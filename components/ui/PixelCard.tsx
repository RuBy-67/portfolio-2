import type { ReactNode } from "react";

type Variant = "ruby" | "cyan" | "yellow";

interface PixelCardProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  title?: string;
}

export function PixelCard({
  children,
  variant = "ruby",
  className = "",
  title,
}: PixelCardProps) {
  const variantClass =
    variant === "cyan"
      ? "pixel-card pixel-card-cyan"
      : variant === "yellow"
      ? "pixel-card pixel-card-yellow"
      : "pixel-card";

  return (
    <div className={`${variantClass} ${className}`}>
      {title && (
        <div className="font-pixel text-xs mb-4 text-ruby">{title}</div>
      )}
      {children}
    </div>
  );
}
