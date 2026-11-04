"use client";

import Image from "next/image";
import { annotate } from "rough-notation";
import { useEffect, useRef, useState } from "react";
import { siteConfig, socialLinks } from "@/data/site";
import { BrutalistButton } from "./BrutalistButton";
import { useTheme } from "./ThemeProvider";
import { WritingBanner } from "./WritingBanner";
import { SocialIcon } from "./SocialIcons";

const iconNames: Record<string, "Email" | "LinkedIn" | "X" | "GitHub" | "LeetCode" | "Codeforces" | "CodeChef"> = {
  Email: "Email",
  LinkedIn: "LinkedIn",
  X: "X",
  GitHub: "GitHub",
  LeetCode: "LeetCode",
  Codeforces: "Codeforces",
  CodeChef: "CodeChef",
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function Hero() {
  const [avatarError, setAvatarError] = useState(false);
  const { bio } = siteConfig;
  const { theme } = useTheme();

  const boxRef = useRef<HTMLSpanElement>(null);
  const highlightRefs = [
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
  ];

  const middleParts = bio.middle.split("rabbit hole");
  const secondaryParts = siteConfig.bioSecondary.split("multiple niches");

  useEffect(() => {
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--highlight")
        .trim() || "#f5d547";
    const isDark = theme === "dark";

    // Dark mode: soften the pink highlights to ~60% intensity.
    const highlightColor = isDark ? withAlpha(accent, 0.6) : accent;
    // Light mode: deepen the yellow box so it stands out on the ivory background.
    const boxColor = isDark ? accent : darken(accent, 0.3);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const animationDuration = reducedMotion ? 0 : 700;

    const targets = [
      { ref: highlightRefs[0], type: "highlight", padding: 2, strokeWidth: 2, iterations: 1, color: highlightColor },
      { ref: highlightRefs[1], type: "highlight", padding: 2, strokeWidth: 2, iterations: 1, color: highlightColor },
      { ref: boxRef, type: "box", padding: 6, strokeWidth: 2, iterations: 2, color: boxColor },
    ] as const;

    const annotations = targets
      .filter((t) => t.ref.current)
      .map((t) =>
        annotate(t.ref.current as HTMLElement, {
          type: t.type,
          color: t.color,
          padding: t.padding,
          strokeWidth: t.strokeWidth,
          animationDuration,
          iterations: t.iterations,
          multiline: true,
        })
      );

    annotations.forEach((a) => a.show());

    return () => {
      annotations.forEach((a) => a.remove());
    };
  }, [theme]);

  return (
    <header className="section relative">
      <div className="hero-cube-bg" aria-hidden="true" />
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 relative z-10">
        <div className="order-2 pr-24 sm:pr-28 lg:order-1 lg:pr-0">
          <h1 className="brutal-heading text-primary">
            {siteConfig.displayName.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="brutal-label mt-6 text-primary/80">
            {siteConfig.tagline} · {siteConfig.specialization}
          </p>

          {/* Hero Banner */}
          <div className="relative mt-8 max-w-lg aspect-[10/5] overflow-hidden border-2 border-foreground bg-card shadow-[5px_5px_0_var(--foreground)]">
            <Image
              src="/assets/heroBanner.png"
              alt="Learning by doing"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 32rem"
              className="object-cover grayscale-[15%] object-cover object-[center_58%]"
            />
          </div>

          <p className="brutal-body-lg mt-8 max-w-lg">
            {bio.lead}{" "}
            <span ref={highlightRefs[0]}>{bio.highlight}</span>
            {middleParts[0]}
            <span ref={highlightRefs[1]}>rabbit hole</span>
            {middleParts[1]} {bio.squiggle}
            {bio.tail}
          </p>

          <p className="brutal-body mt-4 max-w-lg">
            {secondaryParts[0]}
            <span ref={boxRef}>multiple niches</span>
            {secondaryParts[1]}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className="shrink-0">
              <BrutalistButton href={siteConfig.ctaEmail} external>
                Let&apos;s Talk →
              </BrutalistButton>
            </div>

            <WritingBanner />
          </div>

          <nav className="mt-9 flex flex-wrap gap-3" aria-label="Social">
            {socialLinks.map((link) => {
              const IconName = iconNames[link.label];
              const isExternal = link.external || link.href.startsWith("http");
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="social-icon-btn"
                  aria-label={link.label}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <SocialIcon name={IconName} />
                </a>
              );
            })}
          </nav>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="brutal-card-stack w-full max-w-sm">
            <div className="brutal-card aspect-square">
              {avatarError ? (
                <div
                  className="flex h-full items-center justify-center bg-card-dark font-mono text-base text-secondary"
                  aria-hidden="true"
                >
                  RB
                </div>
              ) : (
                <Image
                  src="/assets/Avatar_2.png"
                  alt="Rudraksh Bhardwaj"
                  width={480}
                  height={480}
                  className="h-full w-full object-cover object-[center_40%]"
                  priority
                  onError={() => setAvatarError(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
