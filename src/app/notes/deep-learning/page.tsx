"use client";

import { useState, useEffect } from "react";
import { Footer } from "@/components/Footer";
import { TextLink } from "@/components/TextLink";

export default function DeepLearningNotesPage() {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPdfLoaded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
      <main className="max-w-4xl">
        <nav className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-secondary">
          <TextLink href="/">Home</TextLink>
          <span className="mx-2">/</span>
          <TextLink href="/writings">Writings</TextLink>
          <span className="mx-2">/</span>
          <TextLink href="/notes">My Notes</TextLink>
          <span className="mx-2">/</span>
          <span className="text-primary">Deep Learning</span>
        </nav>

        <header className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Handwritten Notebook
          </p>

          <h1
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-bebas), Impact, sans-serif",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            DEEP LEARNING
          </h1>

          <p className="brutal-body-lg mt-4 text-secondary">
            Handwritten notes from the perceptron up to encoder-decoder
            architecture.
          </p>
        </header>

        <div className="brutal-card border-2 border-foreground bg-background overflow-hidden">
          <div className="border-b-2 border-foreground px-6 py-4 bg-background">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-mono text-sm text-secondary">
                  DeepLearningNotes.pdf
                </span>
              </div>
              <span className="flex-1" />
              <a
                href="/assets/DeepLearningNotes.pdf"
                download="DeepLearningNotes.pdf"
                className="brutal-btn brutal-btn-content group"
                aria-label="Download Deep Learning Notes PDF"
              >
                <span>DOWNLOAD PDF</span>
                <svg
                  className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="relative" style={{ aspectRatio: "4/3" }}>
            {pdfError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10 p-8">
                <div className="text-center">
                  <svg
                    className="mx-auto w-12 h-12 text-secondary mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="brutal-body text-secondary mb-4">
                    Unable to load PDF preview.
                  </p>
                  <a
                    href="/assets/DeepLearningNotes.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-link font-mono text-sm"
                  >
                    Open PDF in new tab &rarr;
                  </a>
                </div>
              </div>
            )}
            {!pdfError && (
              <>
                <embed
                  src="/assets/DeepLearningNotes.pdf"
                  type="application/pdf"
                  title="Deep Learning Handwritten Notes"
                  className="absolute inset-0 w-full h-full border-0"
                  style={{ backgroundColor: "var(--card-dark)" }}
                  onLoad={() => setPdfLoaded(true)}
                  onError={() => setPdfError(true)}
                />
                {!pdfLoaded && !pdfError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card-dark z-10">
                    <div className="text-center p-8">
                      <div className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mb-4 mx-auto" />
                      <p className="font-mono text-sm text-secondary">
                        Loading notebook...
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 brutal-divider" />

        <footer className="mt-8">
          <Footer />
        </footer>
      </main>
    </div>
  );
}