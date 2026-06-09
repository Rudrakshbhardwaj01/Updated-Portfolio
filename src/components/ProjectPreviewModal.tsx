"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type ProjectPreviewModalProps = {
  imageSrc: string;
  imageAlt: string;
  isOpen: boolean;
  onClose: () => void;
};

export function ProjectPreviewModal({
  imageSrc,
  imageAlt,
  isOpen,
  onClose,
}: ProjectPreviewModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${imageAlt} preview`}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="absolute top-4 right-4 text-sm text-secondary transition-colors hover:text-primary"
        onClick={onClose}
        aria-label="Close preview"
      >
        close
      </button>

      <div
        className="brutal-card-stack w-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="brutal-card relative !aspect-auto border-2 border-foreground bg-card-dark">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1280}
            height={720}
            className="h-auto max-h-[85vh] w-full object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}