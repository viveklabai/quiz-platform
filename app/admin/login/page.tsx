import Link from "next/link";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Admin Login</h1>
      <p className="mt-2 text-foreground/60">
        Sign in to access the quiz administration area.
      </p>

      <LoginForm />

      <p className="mt-8 text-sm text-foreground/50">
        <Link href="/" className="underline underline-offset-4">
          Back to Home
        </Link>
      </p>
    </main>
  );
}
