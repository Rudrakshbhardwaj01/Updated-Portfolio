"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";
import { getLampAudio } from "@/lib/lamp-audio";

/**
 * Pull-cord lamp — the site's global light/dark theme switch.
 *
 * A bare pendant lamp (no card, no labels) that hangs from the site's top
 * structure. The ceiling wire runs from the very top of the viewport; the
 * ticker's opaque band masks its upper run, so at rest the cord appears to
 * grow out of the ticker's bottom border, and out of the viewport top once
 * the ticker scrolls away. Colours come from the site's own design tokens
 * (see the .lamp-* rules in globals.css).
 *
 * Interaction:
 *  - Grab the handle and pull down. Crossing the pull threshold trips the
 *    switch exactly once per gesture (activation click) while still holding.
 *  - Releasing springs the cord back with a damped bounce (recoil ratchet).
 *  - A short press (< click grab distance) counts as a click and toggles.
 *  - Keyboard: Enter/Space on the focused handle performs the same toggle.
 *
 * The cord and handle are moved by writing SVG attributes through refs, so
 * dragging and the recoil animation cause no React re-renders.
 */

/* Geometry, in SVG viewBox units (viewBox 0 0 100 160). */
const CORD_REST = 116; // resting cord end / handle top
const MAX_PULL = 24; // hard stop of the drag travel
const FIRE_THRESHOLD = 17; // pull distance that trips the switch
const CLICK_GRAB = 4; // below this, a gesture counts as a plain click
const CLICK_YANK = 13; // scripted pull distance for click/keyboard toggles
const SPRING_K = 170; // recoil spring stiffness
const SPRING_C = 11; // recoil damping (slightly under-damped: soft settle)
const RUBBER_BAND = 0.12; // resistance past the hard stop

type DragState = {
  startY: number;
  fired: boolean;
  maxPull: number;
};

export function LampToggle() {
  const { theme, toggleTheme } = useTheme();
  const isOn = theme === "light";

  const cordRef = useRef<SVGLineElement>(null);
  const handleRef = useRef<SVGGElement>(null);
  const pullRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    // Prefetch the recording; nothing is played until a user gesture.
    const audio = getLampAudio();
    audio.prime();
    return () => {
      audio.dispose();
    };
  }, []);

  useEffect(() => {
    // Cancel any in-flight recoil when the component goes away.
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const applyPull = useCallback((pull: number) => {
    pullRef.current = pull;
    cordRef.current?.setAttribute("y2", `${CORD_REST + pull}`);
    handleRef.current?.setAttribute("transform", `translate(0 ${pull})`);
  }, []);

  const stopSpring = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  /** Damped-spring recoil back to the resting position. */
  const startSpring = useCallback(
    (fromPull: number, velocity = 0) => {
      stopSpring();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        applyPull(0);
        return;
      }
      let pull = fromPull;
      let vel = velocity;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.032);
        last = now;
        const accel = -SPRING_K * pull - SPRING_C * vel;
        vel += accel * dt;
        pull += vel * dt;
        if (Math.abs(pull) < 0.08 && Math.abs(vel) < 0.3) {
          applyPull(0);
          rafRef.current = 0;
          return;
        }
        applyPull(Math.min(Math.max(pull, -3.5), MAX_PULL + 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [applyPull, stopSpring],
  );

  /** Click / keyboard path: one toggle, one click sound, a quick tug. */
  const activateByYank = useCallback(() => {
    const audio = getLampAudio();
    audio.unlock();
    audio.play("activate");
    toggleTheme();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stopSpring();
      applyPull(0);
      return;
    }
    stopSpring();
    applyPull(CLICK_YANK);
    startSpring(CLICK_YANK);
  }, [applyPull, startSpring, stopSpring, toggleTheme]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<SVGGElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (dragRef.current) return; // ignore a second pointer mid-gesture
      stopSpring();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* capture is best-effort; drag still works while over the handle */
      }
      dragRef.current = { startY: event.clientY, fired: false, maxPull: 0 };
      event.currentTarget.style.cursor = "grabbing";
      getLampAudio().unlock();
    },
    [stopSpring],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<SVGGElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dragged = event.clientY - drag.startY;
      // Linear travel up to the hard stop, gentle rubber band beyond it.
      const pull =
        dragged <= 0
          ? 0
          : dragged > MAX_PULL
            ? MAX_PULL + Math.min((dragged - MAX_PULL) * RUBBER_BAND, 4)
            : dragged;
      drag.maxPull = Math.max(drag.maxPull, pull);
      applyPull(pull);
      if (!drag.fired && pull >= FIRE_THRESHOLD) {
        drag.fired = true;
        getLampAudio().play("activate");
        toggleTheme();
      }
    },
    [applyPull, toggleTheme],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<SVGGElement>, cancelled: boolean) => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* pointer may already be gone */
      }
      event.currentTarget.style.cursor = "";
      if (drag.maxPull <= CLICK_GRAB && !cancelled) {
        // A short press is a plain toggle.
        activateByYank();
        return;
      }
      if (drag.maxPull > CLICK_GRAB) {
        getLampAudio().play("release");
      }
      startSpring(pullRef.current);
    },
    [activateByYank, startSpring],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<SVGGElement>) => {
      endDrag(event, false);
    },
    [endDrag],
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent<SVGGElement>) => {
      endDrag(event, true);
    },
    [endDrag],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGGElement>) => {
      if (event.repeat) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateByYank();
      }
    },
    [activateByYank],
  );

  return (
    <svg className="lamp-mount" viewBox="0 0 100 160" fill="none">
      {/* Ceiling wire — runs to the top of the viewport; the ticker band
          masks its upper run so the lamp hangs off the header structure. */}
      <line
        className="lamp-wire-ceiling"
        x1="47"
        y1="0"
        x2="47"
        y2="58"
        strokeWidth="1.4"
      />

      {/* Pull cord (y2 follows the drag) */}
      <line
        ref={cordRef}
        className="lamp-cord"
        x1="57"
        y1="82.5"
        x2="57"
        y2={CORD_REST}
        strokeWidth="1.3"
      />

      {/* Bulb — lower half peeks out beneath the shade */}
      <circle className="lamp-bulb" cx="47" cy="84" r="6.2" />

      {/* Flat trapezoidal shade, drawn over the cord/bulb tops */}
      <polygon
        className="lamp-shade"
        points="37,58 57,58 72,84 22,84"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />

      {/* Handle + invisible enlarged hit area; translates with the pull */}
      <g
        ref={handleRef}
        className="lamp-hit"
        role="switch"
        aria-checked={isOn}
        aria-label="Lights pull cord"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
      >
        <rect x="45" y="102" width="26" height="31" rx="8" fill="transparent" />
        <rect
          className="lamp-handle-pill"
          x="53.4"
          y={CORD_REST}
          width="7.2"
          height="11.5"
          rx="3.6"
        />
      </g>
    </svg>
  );
}
