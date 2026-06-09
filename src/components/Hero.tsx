"use client";

import Image from "next/image";
import { useState } from "react";
import { siteConfig, socialLinks } from "@/data/site";
import { BrutalistButton } from "./BrutalistButton";
import { WritingBanner } from "./WritingBanner";

export function Hero() {
  const [avatarError, setAvatarError] = useState(false);
  const { bio } = siteConfig;

  return (
    <header className="section">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
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

          <p className="brutal-body-lg mt-8 max-w-lg">
            {bio.lead}{" "}
            <span className="brutal-highlight text-primary">{bio.highlight}</span>
            {bio.middle}{" "}
            <span className="brutal-squiggle text-primary">{bio.squiggle}</span>
            {bio.tail}
          </p>

          <p className="brutal-body mt-4 max-w-lg">{siteConfig.bioSecondary}</p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className="shrink-0">
              <BrutalistButton href={siteConfig.ctaEmail} external>
                Let&apos;s Talk →
              </BrutalistButton>
            </div>
            <WritingBanner />
          </div>

          <nav
            className="mt-9 flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Social"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="brutal-social-link"
                {...(link.external || link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
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
                  className="h-full w-full object-cover"
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
