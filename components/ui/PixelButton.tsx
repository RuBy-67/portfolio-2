import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "ruby" | "cyan" | "yellow";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  as?: "button" | "a";
  href?: string;
}

export function PixelButton({
  children,
  variant = "ruby",
  className = "",
  ...props
}: PixelButtonProps) {
  const variantClass =
    variant === "cyan"
      ? "btn-pixel btn-pixel-cyan"
      : "btn-pixel";

  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
