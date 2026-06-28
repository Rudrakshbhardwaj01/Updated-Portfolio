import {
  DEFAULT_SPEECH_PITCH,
  DEFAULT_SPEECH_RATE,
  DEFAULT_SPEECH_VOLUME,
} from "@/lib/speech/constants";
import type {
  NarrationStatus,
  SpeechManagerOptions,
  SpeechRate,
  SpeechSegment,
} from "@/lib/speech/types";

export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

type PendingPause = {
  kind: "before" | "after";
  remainingMs: number;
};

export class SpeechManager {
  private segments: SpeechSegment[] = [];

  private segmentIndex = 0;

  private status: NarrationStatus = "idle";

  private rate: SpeechRate = DEFAULT_SPEECH_RATE;

  private volume = DEFAULT_SPEECH_VOLUME;

  private pitch = DEFAULT_SPEECH_PITCH;

  private callbacks: SpeechManagerOptions;

  private waitTimeoutId: number | null = null;

  private waitStartedAt = 0;

  private pendingPause: PendingPause | null = null;

  private utterance: SpeechSynthesisUtterance | null = null;

  private cancelled = false;

  private restartOnResume = false;

  constructor(callbacks: SpeechManagerOptions) {
    this.callbacks = callbacks;
    this.rate = callbacks.rate;
    this.volume = callbacks.volume ?? DEFAULT_SPEECH_VOLUME;
    this.pitch = callbacks.pitch ?? DEFAULT_SPEECH_PITCH;
  }

  getStatus(): NarrationStatus {
    return this.status;
  }

  getRate(): SpeechRate {
    return this.rate;
  }

  setRate(rate: SpeechRate): void {
    if (this.rate === rate) {
      return;
    }

    this.rate = rate;

    if (this.status !== "playing" && this.status !== "paused") {
      return;
    }

    // Between segments — the next utterance already reads this.rate.
    if (this.waitTimeoutId !== null) {
      return;
    }

    this.applyRateToCurrentSegment();
  }

  start(segments: SpeechSegment[]): void {
    this.restartOnResume = false;
    this.cancelInternal(false);
    this.segments = segments;
    this.segmentIndex = 0;
    this.cancelled = false;

    if (segments.length === 0) {
      this.setStatus("idle");
      return;
    }

    this.setStatus("playing");
    this.playCurrentSegment();
  }

  pause(): void {
    if (this.status !== "playing") {
      return;
    }

    if (this.waitTimeoutId !== null && this.pendingPause) {
      window.clearTimeout(this.waitTimeoutId);
      this.waitTimeoutId = null;
      const elapsed = Date.now() - this.waitStartedAt;
      this.pendingPause.remainingMs = Math.max(
        0,
        this.pendingPause.remainingMs - elapsed,
      );
    } else {
      // Avoid speechSynthesis.pause()/resume() — unreliable in Chrome/Edge.
      // Cancel the current utterance and resume the same segment on demand.
      this.restartOnResume = true;
      this.cancelCurrentUtteranceOnly();
    }

    this.setStatus("paused");
  }

  resume(): void {
    if (this.status !== "paused") {
      return;
    }

    this.setStatus("playing");

    if (this.pendingPause && this.pendingPause.remainingMs > 0) {
      this.startWait(this.pendingPause.remainingMs, this.pendingPause.kind);
      return;
    }

    if (this.restartOnResume || this.segmentIndex < this.segments.length) {
      this.restartOnResume = false;
      this.speakCurrentSegmentText();
    }
  }

  stop(): void {
    this.restartOnResume = false;
    this.cancelInternal(true);
    this.segments = [];
    this.segmentIndex = 0;
    this.setStatus("idle");
  }

  destroy(): void {
    this.restartOnResume = false;
    this.cancelInternal(false);
    this.segments = [];
    this.segmentIndex = 0;
    this.setStatus("idle");
  }

  private setStatus(status: NarrationStatus): void {
    this.status = status;
    this.callbacks.onStatusChange(status);
  }

  private cancelCurrentUtteranceOnly(): void {
    if (this.utterance) {
      this.utterance.onend = null;
      this.utterance.onerror = null;
      this.utterance = null;
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  }

  private applyRateToCurrentSegment(): void {
    const wasPaused = this.status === "paused";

    this.cancelCurrentUtteranceOnly();

    if (wasPaused) {
      this.restartOnResume = true;
      return;
    }

    window.setTimeout(() => {
      if (this.status === "playing" && !this.cancelled) {
        this.speakCurrentSegmentText();
      }
    }, 0);
  }

  private cancelInternal(markStopped: boolean): void {
    this.cancelled = true;
    this.clearWait();

    if (this.utterance) {
      this.utterance.onend = null;
      this.utterance.onerror = null;
      this.utterance = null;
    }

    window.speechSynthesis.cancel();

    if (markStopped) {
      this.setStatus("stopped");
    }
  }

  private clearWait(): void {
    if (this.waitTimeoutId !== null) {
      window.clearTimeout(this.waitTimeoutId);
      this.waitTimeoutId = null;
    }

    this.pendingPause = null;
  }

  private startWait(durationMs: number, kind: PendingPause["kind"]): void {
    this.clearWait();
    this.pendingPause = { kind, remainingMs: durationMs };
    this.waitStartedAt = Date.now();

    this.waitTimeoutId = window.setTimeout(() => {
      this.waitTimeoutId = null;
      this.pendingPause = null;

      if (this.cancelled || this.status !== "playing") {
        return;
      }

      if (kind === "before") {
        this.speakCurrentSegmentText();
        return;
      }

      this.advanceSegment();
    }, durationMs);
  }

  private playCurrentSegment(): void {
    if (this.cancelled || this.segmentIndex >= this.segments.length) {
      this.finish();
      return;
    }

    const segment = this.segments[this.segmentIndex];
    this.callbacks.onSegmentChange(
      this.segmentIndex + 1,
      this.segments.length,
    );

    const pauseBefore = segment.pauseBeforeMs ?? 0;
    if (pauseBefore > 0) {
      this.startWait(pauseBefore, "before");
      return;
    }

    this.speakCurrentSegmentText();
  }

  private speakCurrentSegmentText(): void {
    if (this.cancelled || this.segmentIndex >= this.segments.length) {
      this.finish();
      return;
    }

    const segment = this.segments[this.segmentIndex];
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.rate = this.rate;
    utterance.volume = this.volume;
    utterance.pitch = this.pitch;

    utterance.onend = () => {
      if (this.cancelled || this.status !== "playing") {
        return;
      }

      const pauseAfter = segment.pauseAfterMs ?? 0;
      if (pauseAfter > 0) {
        this.startWait(pauseAfter, "after");
        return;
      }

      this.advanceSegment();
    };

    utterance.onerror = () => {
      if (this.cancelled || this.status !== "playing") {
        return;
      }

      this.advanceSegment();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private advanceSegment(): void {
    this.restartOnResume = false;
    this.segmentIndex += 1;

    if (this.segmentIndex >= this.segments.length) {
      this.finish();
      return;
    }

    this.playCurrentSegment();
  }

  private finish(): void {
    this.restartOnResume = false;
    this.utterance = null;
    this.segments = [];
    this.segmentIndex = 0;
    this.setStatus("idle");
  }
}

export function primeSpeechVoices(): void {
  if (!isSpeechSupported()) {
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.getVoices();
}
