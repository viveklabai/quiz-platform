import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/src/components/ui/Button";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/quizzes", label: "Manage Quizzes" },
  { href: "/admin/live", label: "Live Control" },
  { href: "/admin/teams", label: "Manage Teams" },
] as const;

type AdminShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 text-foreground/60">{description}</p>
          ) : null}
        </div>
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>

      <nav
        aria-label="Admin navigation"
        className="mt-8 flex flex-wrap gap-2 border-b border-foreground/10 pb-4"
      >
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </main>
  );
}
