"use client";

import React, { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string; // Initiales ou texte court
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !src || imgError;

  if (showFallback) {
    return (
      <div
        className={`
          inline-flex items-center justify-center rounded-full
          bg-primary/10 text-primary font-semibold
          ${sizeClasses[size]}
          ${className}
        `}
        title={alt}
      >
        {fallback.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`
        inline-block rounded-full object-cover
        ${sizeClasses[size]}
        ${className}
      `}
      onError={() => setImgError(true)}
    />
  );
}
