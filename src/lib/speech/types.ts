export type NarrationStatus = "idle" | "playing" | "paused" | "stopped";

export type SpeechRate = 0.75 | 1 | 1.25 | 1.5 | 2;

export type SpeechSegment = {
  text: string;
  pauseBeforeMs?: number;
  pauseAfterMs?: number;
};

export type SpeechManagerCallbacks = {
  onStatusChange: (status: NarrationStatus) => void;
  onSegmentChange: (index: number, total: number) => void;
};

export type SpeechManagerOptions = SpeechManagerCallbacks & {
  rate: SpeechRate;
  volume?: number;
  pitch?: number;
};
