"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./MaleHunter.module.css";

type Direction = "east" | "west";

const ASSET_ROOT = "/assets/sprites/male-hunter";
const WALK_FRAME_MS = 1000 / 10;
const WALK_SPEED = 28;
const TURN_MARGIN = 2;

const idleFrames: Record<Direction, string> = {
  east: `${ASSET_ROOT}/Idle/east.png`,
  west: `${ASSET_ROOT}/Idle/west.png`,
};

const walkFrames: Record<Direction, string[]> = {
  east: Array.from(
    { length: 8 },
    (_, index) =>
      `${ASSET_ROOT}/Walk/east/frame_${String(index).padStart(2, "0")}.png`,
  ),
  west: Array.from(
    { length: 8 },
    (_, index) =>
      `${ASSET_ROOT}/Walk/west/frame_${String(index).padStart(2, "0")}.png`,
  ),
};

export function MaleHunter() {
  const pathname = usePathname();
  const railRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let observedFooter: HTMLElement | null = null;
    let footerObserver: ResizeObserver | null = null;

    const updateRailPosition = () => {
      const footer = document.querySelector<HTMLElement>("footer.border-t-2")
        ?? document.querySelector<HTMLElement>("footer");

      if (!footer) {
        footerObserver?.disconnect();
        footerObserver = null;
        observedFooter = null;
        rail.style.visibility = "hidden";
        return;
      }

      if (footer !== observedFooter) {
        footerObserver?.disconnect();
        footerObserver = typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(updateRailPosition);
        footerObserver?.observe(footer);
        observedFooter = footer;
      }

      const footerBounds = footer.getBoundingClientRect();
      rail.style.left = `${footerBounds.left + window.scrollX}px`;
      rail.style.top = `${footerBounds.top + window.scrollY - 2}px`;
      rail.style.width = `${footerBounds.width}px`;
      rail.style.visibility = "visible";
    };

    const routeObserver = new MutationObserver(updateRailPosition);
    routeObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateRailPosition);
    updateRailPosition();

    return () => {
      routeObserver.disconnect();
      footerObserver?.disconnect();
      window.removeEventListener("resize", updateRailPosition);
    };
  }, [pathname]);

  useEffect(() => {
    const rail = railRef.current;
    const sprite = spriteRef.current;
    const image = imageRef.current;

    if (!rail || !sprite || !image) return;

    let direction: Direction = "east";
    let currentX = 0;
    let movementLimit = 0;
    let frameIndex = 0;
    let frameTimer: number | undefined;
    let movementFrame: number | undefined;
    let lastMovementTime = 0;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;

    const setPosition = () => {
      sprite.style.setProperty("--male-hunter-x", `${currentX}px`);
    };

    const setFrame = (source: string) => {
      if (image.src.endsWith(source)) return;
      image.src = source;
    };

    const measureRail = () => {
      movementLimit = Math.max(
        0,
        rail.getBoundingClientRect().width - sprite.getBoundingClientRect().width,
      );
      currentX = Math.min(currentX, movementLimit);
      setPosition();
    };

    const stopAnimation = () => {
      if (frameTimer !== undefined) {
        window.clearInterval(frameTimer);
        frameTimer = undefined;
      }
      if (movementFrame !== undefined) {
        window.cancelAnimationFrame(movementFrame);
        movementFrame = undefined;
      }
    };

    const startWalking = () => {
      stopAnimation();
      frameIndex = 0;
      setFrame(walkFrames[direction][frameIndex]);
      frameTimer = window.setInterval(() => {
        frameIndex = (frameIndex + 1) % walkFrames[direction].length;
        setFrame(walkFrames[direction][frameIndex]);
      }, WALK_FRAME_MS);
      lastMovementTime = performance.now();

      const move = (now: number) => {
        if (reducedMotion) return;

        const elapsed = Math.min(64, now - lastMovementTime);
        lastMovementTime = now;
        currentX += (direction === "east" ? 1 : -1) * WALK_SPEED * (elapsed / 1000);

        const reachedBoundary = direction === "east"
          ? currentX >= Math.max(0, movementLimit - TURN_MARGIN)
          : currentX <= Math.min(movementLimit, TURN_MARGIN);

        if (reachedBoundary) {
          currentX = direction === "east"
            ? Math.max(0, movementLimit - TURN_MARGIN)
            : Math.min(movementLimit, TURN_MARGIN);
          direction = direction === "east" ? "west" : "east";
          frameIndex = 0;
          setFrame(walkFrames[direction][frameIndex]);
        }

        currentX = Math.max(0, Math.min(currentX, movementLimit));
        setPosition();
        movementFrame = window.requestAnimationFrame(move);
      };

      movementFrame = window.requestAnimationFrame(move);
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      stopAnimation();

      if (reducedMotion) {
        setFrame(idleFrames[direction]);
        return;
      }

      startWalking();
    };

    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(measureRail);
    observer?.observe(rail);
    window.addEventListener("resize", measureRail);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    measureRail();
    setPosition();

    if (reducedMotion) {
      setFrame(idleFrames[direction]);
    } else {
      startWalking();
    }

    return () => {
      stopAnimation();
      observer?.disconnect();
      window.removeEventListener("resize", measureRail);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  return (
    <div ref={railRef} className={styles.rail} aria-hidden="true">
      <div ref={spriteRef} className={styles.sprite}>
        {/* eslint-disable-next-line @next/next/no-img-element -- frames are swapped directly for the walking animation. */}
        <img
          ref={imageRef}
          src={idleFrames.east}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
