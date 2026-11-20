"use client";

import React, { useState } from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  size = "md",
  className = "",
  children,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-12 text-sm",
    lg: "size-16 text-base",
    xl: "size-20 text-lg",
  };

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-2xl bg-zinc-100 select-none ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function AvatarImage({
  src,
  alt = "",
  className = "",
  ...props
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) return null;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`size-full rounded-2xl object-cover z-10 ${className}`}
      {...props}
    />
  );
}

export function AvatarFallback({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-100 font-medium text-zinc-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface AvatarBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: "online" | "offline" | "busy" | "away" | string;
}

export function AvatarBadge({
  status = "online",
  className = "",
  ...props
}: AvatarBadgeProps) {
  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    offline: "bg-zinc-400",
    busy: "bg-red-500",
    away: "bg-amber-500",
  };

  const badgeColor = statusColors[status] || "bg-emerald-500";

  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 z-20 size-3.5 rounded-full border-2 border-white ${badgeColor} ${className}`}
      {...props}
    />
  );
}