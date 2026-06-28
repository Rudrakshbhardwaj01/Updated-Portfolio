"use client";

import { SPEECH_RATES } from "@/lib/speech/constants";
import type { SpeechRate } from "@/lib/speech/types";
import { useSpeechNarration } from "@/hooks/useSpeechNarration";

function formatRateLabel(rate: SpeechRate): string {
  return `${rate}×`;
}

export function ArticleNarrator() {
  const { isSupported, status, rate, setRate, listen, pause, resume, stop } =
    useSpeechNarration();

  if (!isSupported) {
    return null;
  }

  const isPlaying = status === "playing";
  const isPaused = status === "paused";
  const isActive = isPlaying || isPaused;

  function handlePrimaryAction() {
    if (isPlaying) {
      pause();
      return;
    }

    if (isPaused) {
      resume();
      return;
    }

    listen();
  }

  function handlePrimaryKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handlePrimaryAction();
  }

  const primaryLabel = isPlaying ? "Pause" : isPaused ? "Resume" : "Listen";

  return (
    <div
      className="article-narrator"
      role="group"
      aria-label="Article narration controls"
    >
      <div
        className={`article-narrator-bar${
          isActive ? " article-narrator-bar--active" : ""
        }`}
      >
        <span className="article-narrator-accent" aria-hidden="true" />

        <div className="article-narrator-inner">
          <div className="article-narrator-transport">
            <button
              type="button"
              className={`article-narrator-action${
                isActive ? " article-narrator-action--active" : ""
              }`}
              onClick={handlePrimaryAction}
              onKeyDown={handlePrimaryKeyDown}
              aria-label={
                isPlaying
                  ? "Pause narration"
                  : isPaused
                    ? "Resume narration"
                    : "Listen to article"
              }
            >
              {primaryLabel}
            </button>

            {isActive ? (
              <button
                type="button"
                className="article-narrator-secondary"
                onClick={stop}
                aria-label="Stop narration"
              >
                Stop
              </button>
            ) : null}
          </div>

          {isActive ? (
            <div
              className="article-narrator-rates"
              role="radiogroup"
              aria-label="Narration speed"
            >
              <span className="article-narrator-rates-label">Speed</span>

              <div className="article-narrator-rates-options">
                {SPEECH_RATES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={rate === option}
                    className={`article-narrator-rate${
                      rate === option ? " article-narrator-rate--active" : ""
                    }`}
                    onClick={() => setRate(option)}
                  >
                    {formatRateLabel(option)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
