import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/src/components/ui/Button";
import { logoutAdmin } from "@/app/admin/login/actions";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/results", label: "Control Center" },
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/live", label: "Live Control" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/reset", label: "Reset" },
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
        <div className="flex flex-wrap gap-2">
          <form action={logoutAdmin}>
            <Button type="submit" variant="secondary">
              Logout
            </Button>
          </form>
          <Button href="/" variant="secondary">
            Back to Home
          </Button>
        </div>
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
        <Link
          href="/leaderboard"
          className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          Leaderboard
        </Link>
      </nav>

      <div className="mt-8">{children}</div>
    </main>
  );
}
