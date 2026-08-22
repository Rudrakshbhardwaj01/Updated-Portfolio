"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useCallback } from "react";

type ShelfLightboxProps = {
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
};

export function ShelfLightbox({
  imageSrc,
  imageAlt,
  onClose,
}: ShelfLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => setIsOpen(true));

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [close]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      close();
    }
  };

  const lightboxContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${imageAlt} preview`}
      onClick={handleBackdropClick}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        opacity: isOpen ? 1 : 0,
        transition: "opacity 220ms ease-out",
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors duration-200 z-10 rounded-full hover:bg-white/5 focus:outline focus:outline-2 focus:outline-foreground focus:outline-offset-2"
        onClick={close}
        aria-label="Close preview"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: "opacity 220ms ease-out 50ms",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        className="relative overflow-hidden rounded-lg"
        onClick={(event) => event.stopPropagation()}
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.95)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 220ms ease-out, opacity 220ms ease-out",
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
<div className="relative bg-black/90 border-2 border-foreground overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={imageAlt}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                width: "auto",
                height: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(lightboxContent, document.body);
}