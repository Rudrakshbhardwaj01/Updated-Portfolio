"use client";

import Image from "next/image";
import { useState } from "react";
import { profileAvatar } from "@/lib/bhardwajbot/assets";

type BhardwajBotAvatarProps = {
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-7 w-7 rounded-xl",
  md: "h-8 w-8 rounded-2xl",
};

export function BhardwajBotAvatar({
  size = "sm",
  className = "",
}: BhardwajBotAvatarProps) {
  const [avatarError, setAvatarError] = useState(false);
  const sizeClass = sizeClasses[size];

  if (avatarError) {
    return (
      <div
        className={`${sizeClass} shrink-0 bg-border text-[10px] text-secondary flex items-center justify-center ${className}`}
        aria-hidden="true"
      >
        rb
      </div>
    );
  }

  return (
    <Image
      src={profileAvatar}
      alt="BhardwajBot"
      width={size === "md" ? 32 : 28}
      height={size === "md" ? 32 : 28}
      className={`${sizeClass} shrink-0 object-cover ${className}`}
      onError={() => setAvatarError(true)}
    />
  );
}
