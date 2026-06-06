"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shell } from "@/data/rbsh-knowledge";
import { RBSHTerminal } from "./RBSHTerminal";
import { useRBSH } from "./useRBSH";

type RBSHWindowProps = {
  onClose: () => void;
};

export function RBSHWindow({ onClose }: RBSHWindowProps) {
  const {
    lines,
    input,
    runCommand,
    showWelcome,
    prompt,
    handleKey,
    insertText,
  } = useRBSH(onClose);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    function syncViewport() {
      setIsMobile(media.matches);
      if (media.matches) {
        setPosition({ x: 0, y: 0 });
      }
    }

    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  const handleTitleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        return;
      }

      if ((event.target as HTMLElement).closest(".rbsh-close")) {
        return;
      }

      event.preventDefault();
      setIsDragging(true);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
      };
    },
    [position.x, position.y],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function handleMouseMove(event: MouseEvent) {
      setPosition({
        x: dragRef.current.originX + (event.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (event.clientY - dragRef.current.startY),
      });
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <section
      id="rbsh-window"
      aria-label="RBSH terminal"
      className={`rbsh-window${isVisible ? " rbsh-window-open" : ""}`}
      style={
        isMobile
          ? undefined
          : ({
              "--rbsh-drag-x": `${position.x}px`,
              "--rbsh-drag-y": `${position.y}px`,
            } as React.CSSProperties)
      }
    >
      <header
        className="rbsh-titlebar"
        onMouseDown={handleTitleMouseDown}
        role="presentation"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/RBSH.svg"
          alt=""
          className="rbsh-titlebar-logo"
          width={48}
          height={14}
          decoding="async"
        />
        <span className="rbsh-titlebar-divider">—</span>
        <span className="rbsh-titlebar-caption">
          {shell.full_name} v{shell.version}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rbsh-close"
          aria-label="Close RBSH"
        >
          ×
        </button>
      </header>

      <RBSHTerminal
        lines={lines}
        buffer={input.buffer}
        cursor={input.cursor}
        prompt={prompt}
        showWelcome={showWelcome}
        onSubmit={runCommand}
        onShortcut={runCommand}
        onKey={handleKey}
        onInsert={insertText}
      />
    </section>
  );
}
