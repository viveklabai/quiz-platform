import type { ReactNode } from "react";

type CardProps = {
  title: string;
  value: number | string;
  description?: string;
};

export function Card({ title, value, description }: CardProps) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6">
      <p className="text-sm text-foreground/60">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {description ? (
        <p className="mt-1 text-sm text-foreground/50">{description}</p>
      ) : null}
    </div>
  );
}

type CardGridProps = {
  children: ReactNode;
};

export function CardGrid({ children }: CardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
