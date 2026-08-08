import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  href?: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 disabled:opacity-50",
  secondary:
    "border border-foreground/20 bg-transparent hover:bg-foreground/5 disabled:opacity-50",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function Button({
  children,
  variant = "primary",
  loading = false,
  href,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
