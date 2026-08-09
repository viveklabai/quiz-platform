"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { loginAdmin } from "./actions";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginAdmin(password);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <Input
        label="Admin Password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={loading}
        required
      />

      {error ? (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
