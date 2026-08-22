"use client";

import { useState } from "react";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { ShelfCard } from "@/components/ShelfCard";
import { ShelfLightbox } from "@/components/ShelfLightbox";
import { TextLink } from "@/components/TextLink";
import { shelfItems } from "@/data/shelf";

export function ShelfContent() {
  const [lightbox, setLightbox] = useState<{
    imageSrc: string;
    imageAlt: string;
  } | null>(null);

  const openLightbox = (imageSrc: string, imageAlt: string) => {
    setLightbox({ imageSrc, imageAlt });
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
      <main className="grid gap-8 lg:grid-cols-3">
        <header className="lg:col-span-2 max-w-2xl">
          <nav className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-secondary">
            <TextLink href="/">Home</TextLink>
            <span className="mx-2">/</span>
            <TextLink href="/writings">Writings</TextLink>
            <span className="mx-2">/</span>
            <span className="text-primary">Shelf</span>
          </nav>

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Books &middot; Papers &middot; Notes
          </p>

          <h1
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-bebas), Impact, sans-serif",
              fontSize: "clamp(3.5rem, 11vw, 7rem)",
              lineHeight: 0.88,
              letterSpacing: "0.02em",
            }}
          >
            Shelf
          </h1>

          <p className="brutal-body-lg mt-6">
            A collection of books and papers that have influenced the way I
            think about engineering, systems, machine learning, and software.
          </p>
        </header>

        <div className="lg:col-start-3 lg:row-start-1 self-start hidden lg:block">
          <div className="shelf-illustration border-2 border-foreground bg-background">
            <Image
              src="/assets/shelfImage.jpg"
              alt="Pixel art illustration of a person at a computer"
              width={300}
              height={300}
              className="object-contain pixelated"
            />
          </div>
        </div>

        <section
          aria-label="Shelf"
          className="lg:col-span-3 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shelfItems.map((item) => (
            <ShelfCard
              key={item.id}
              item={item}
              onCoverClick={openLightbox}
            />
          ))}
        </section>
      </main>

      <div className="lg:hidden">
        <div className="shelf-illustration border-2 border-foreground bg-background mx-auto my-10 max-w-xs">
          <Image
            src="/assets/shelfImage.jpg"
            alt="Pixel art illustration of a person at a computer"
            width={280}
            height={280}
            className="object-contain pixelated"
          />
        </div>
      </div>

      <Footer />

      {lightbox && (
        <ShelfLightbox
          imageSrc={lightbox.imageSrc}
          imageAlt={lightbox.imageAlt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}