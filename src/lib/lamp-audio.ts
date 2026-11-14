/**
 * Audio engine for the pull-cord lamp theme switch.
 *
 * Plays the supplied mechanical recording at public/assets/theme/sound.wav
 * (3.8s, 44.1kHz, mono). The recording is a chain of eight discrete switch
 * clicks; rather than replaying all of it, two short segments are cut from
 * it at transient boundaries so one pull yields one click:
 *
 *  - "activate": the crisp initial click (0.00s – 0.45s, covers the 0.075s
 *    transient and its softer 0.309s echo) — fired when the pull crosses
 *    the activation threshold or on click/keyboard activation.
 *  - "release":  a ratchet double-click (0.80s – 1.30s, transients at
 *    0.858s and 1.048s) — fired when the cord recoils after a real pull.
 *
 * The file is fetched as soon as the lamp mounts, but the AudioContext is
 * only created on the first user gesture and nothing is ever played on page
 * load. Segment buffers are built once after decoding, with short fade
 * envelopes so a cut never pops.
 */

const SOUND_URL = "/assets/theme/sound.wav";

type SegmentName = "activate" | "release";

/** Seconds into the source recording; derived from its transient map. */
const SEGMENTS: Record<SegmentName, { start: number; end: number }> = {
  activate: { start: 0, end: 0.45 },
  release: { start: 0.8, end: 1.3 },
};

const FADE_IN_S = 0.012;
const FADE_OUT_S = 0.06;
const VOLUME = 0.7;

export type LampAudio = {
  /** Begin prefetching the recording. Safe to call any time (client only). */
  prime: () => void;
  /** Create/resume the AudioContext. Call inside a user-gesture handler. */
  unlock: () => void;
  /** Play one of the cut segments. Silently no-ops if audio is unavailable. */
  play: (segment: SegmentName) => void;
  /** Stop playback and release resources. */
  dispose: () => void;
};

let singleton: LampAudio | null = null;

export function getLampAudio(): LampAudio {
  if (singleton) return singleton;
  singleton = createLampAudio();
  return singleton;
}

function createLampAudio(): LampAudio {
  if (typeof window === "undefined") {
    // SSR / import-time safety: every method becomes a no-op.
    const noop: LampAudio = {
      prime: () => {},
      unlock: () => {},
      play: () => {},
      dispose: () => {},
    };
    return noop;
  }

  // Preload starts immediately; resolved to null on any failure.
  const filePromise: Promise<ArrayBuffer | null> = fetch(SOUND_URL)
    .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(res.status)))
    .catch(() => null);

  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;
  let segmentsPromise: Promise<void> | null = null;
  const segments = new Map<SegmentName, AudioBuffer>();
  const activeSources = new Map<SegmentName, AudioBufferSourceNode>();

  function ensureContext(): AudioContext | null {
    try {
      if (!ctx) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
        gain = ctx.createGain();
        gain.gain.value = VOLUME;
        gain.connect(ctx.destination);
      }
      if (ctx.state === "suspended") void ctx.resume();
      return ctx;
    } catch {
      ctx = null;
      gain = null;
      return null;
    }
  }

  /** Copy a time range of the recording into its own buffer with fades. */
  function buildSegment(
    full: AudioBuffer,
    { start, end }: { start: number; end: number },
  ): AudioBuffer | null {
    if (!ctx) return null;
    const sr = full.sampleRate;
    const s0 = Math.max(0, Math.floor(start * sr));
    const s1 = Math.min(full.length, Math.floor(end * sr));
    if (s1 <= s0) return null;

    const segment = ctx.createBuffer(1, s1 - s0, sr);
    const dst = segment.getChannelData(0);
    const src = full.getChannelData(0);
    const fadeIn = Math.floor(FADE_IN_S * sr);
    const fadeOut = Math.floor(FADE_OUT_S * sr);
    const length = s1 - s0;

    for (let i = 0; i < length; i++) {
      let env = 1;
      if (i < fadeIn) env *= i / fadeIn;
      if (i >= length - fadeOut) env *= (length - i) / fadeOut;
      dst[i] = src[s0 + i] * Math.max(0, env);
    }
    return segment;
  }

  function ensureSegments(): Promise<void> {
    if (!segmentsPromise) {
      segmentsPromise = (async () => {
        const audioCtx = ensureContext();
        if (!audioCtx) return;
        const raw = await filePromise;
        if (!raw) return;
        const full = await audioCtx.decodeAudioData(raw);
        for (const name of Object.keys(SEGMENTS) as SegmentName[]) {
          const segment = buildSegment(full, SEGMENTS[name]);
          if (segment) segments.set(name, segment);
        }
      })().catch(() => {
        // Broken/undecodable audio stays silent forever; the lamp still works.
        // The cached promise resolves, so retries are cheap no-ops.
      });
    }
    return segmentsPromise;
  }

  return {
    prime: () => {
      // Touching the promise starts (or joins) the fetch; decoding waits for
      // a real gesture so no AudioContext exists before user interaction.
      void filePromise.catch(() => null);
    },

    unlock: () => {
      ensureContext();
      void ensureSegments();
    },

    play: (segmentName) => {
      const audioCtx = ensureContext();
      if (!audioCtx || !gain) return;
      void ensureSegments().then(() => {
        const buffer = segments.get(segmentName);
        if (!buffer || !ctx || !gain) return;

        // Avoid overlapping copies of the same segment (e.g. fast repeated
        // pulls): a still-ringing source is stopped in favour of the new one.
        const previous = activeSources.get(segmentName);
        if (previous) {
          try {
            previous.stop();
          } catch {
            /* already stopped */
          }
          activeSources.delete(segmentName);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gain);
        source.onended = () => {
          if (activeSources.get(segmentName) === source) {
            activeSources.delete(segmentName);
          }
        };
        activeSources.set(segmentName, source);
        source.start();
      });
    },

    dispose: () => {
      for (const source of activeSources.values()) {
        try {
          source.stop();
        } catch {
          /* already stopped */
        }
      }
      activeSources.clear();
      segments.clear();
      segmentsPromise = null;
      filePromise.catch(() => null);
      if (ctx) {
        void ctx.close().catch(() => null);
        ctx = null;
        gain = null;
      }
      singleton = null;
    },
  };
}
