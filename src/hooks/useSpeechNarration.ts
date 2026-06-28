"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ARTICLE_SELECTOR, DEFAULT_SPEECH_RATE } from "@/lib/speech/constants";
import { extractSpeechSegments } from "@/lib/speech/extractArticleText";
import {
  isSpeechSupported,
  primeSpeechVoices,
  SpeechManager,
} from "@/lib/speech/speechManager";
import type { NarrationStatus, SpeechRate } from "@/lib/speech/types";

type UseSpeechNarrationResult = {
  isSupported: boolean;
  status: NarrationStatus;
  rate: SpeechRate;
  setRate: (rate: SpeechRate) => void;
  listen: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlayPause: () => void;
};

export function useSpeechNarration(): UseSpeechNarrationResult {
  const pathname = usePathname();
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<NarrationStatus>("idle");
  const [rate, setRateState] = useState<SpeechRate>(DEFAULT_SPEECH_RATE);
  const managerRef = useRef<SpeechManager | null>(null);
  const rateRef = useRef<SpeechRate>(DEFAULT_SPEECH_RATE);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    setIsSupported(isSpeechSupported());
    primeSpeechVoices();
  }, []);

  useEffect(() => {
    rateRef.current = rate;
    managerRef.current?.setRate(rate);
  }, [rate]);

  useEffect(() => {
    const manager = new SpeechManager({
      rate: rateRef.current,
      onStatusChange: setStatus,
      onSegmentChange: () => {},
    });
    managerRef.current = manager;

    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (pathnameRef.current === pathname) {
      return;
    }

    pathnameRef.current = pathname;
    managerRef.current?.destroy();
    setStatus("idle");
  }, [pathname]);

  const listen = useCallback(() => {
    const article = document.querySelector<HTMLElement>(ARTICLE_SELECTOR);
    if (!article || !managerRef.current) {
      return;
    }

    const segments = extractSpeechSegments(article);
    managerRef.current.start(segments);
  }, []);

  const pause = useCallback(() => {
    managerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    managerRef.current?.resume();
  }, []);

  const stop = useCallback(() => {
    managerRef.current?.stop();
  }, []);

  const setRate = useCallback((nextRate: SpeechRate) => {
    rateRef.current = nextRate;
    setRateState(nextRate);
    managerRef.current?.setRate(nextRate);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (status === "playing") {
      pause();
      return;
    }

    if (status === "paused") {
      resume();
      return;
    }

    listen();
  }, [listen, pause, resume, status]);

  return {
    isSupported,
    status,
    rate,
    setRate,
    listen,
    pause,
    resume,
    stop,
    togglePlayPause,
  };
}
