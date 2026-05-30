"use client";

import Image from "next/image";
import { useState } from "react";
import { siteConfig, socialLinks } from "@/data/site";
import { TextLink } from "./TextLink";

export function Hero() {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className="mb-10">
      <div className="flex items-start gap-5">
        {avatarError ? (
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-border text-sm text-secondary"
            aria-hidden="true"
          >
            rb
          </div>
        ) : (
          <Image
            src="/assets/ProfileAvatar.jpeg"
            alt="Rudraksh Bhardwaj"
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-2xl object-cover"
            priority
            onError={() => setAvatarError(true)}
          />
        )}

        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {siteConfig.name}
          </h1>

          <p className="mt-1 text-sm text-secondary">
            {siteConfig.tagline}
          </p>

          <nav className="mt-3 text-base" aria-label="Links">
            {socialLinks.map((link, index) => (
              <span key={link.label}>
                {index > 0 && (
                  <span className="text-secondary"> / </span>
                )}
                <TextLink
                  href={link.href}
                  external={link.external}
                >
                  {link.label}
                </TextLink>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-6 max-w-2xl space-y-3 text-base leading-relaxed text-secondary">
        {siteConfig.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </header>
  );
}