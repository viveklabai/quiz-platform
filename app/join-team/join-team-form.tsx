"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { joinTeam } from "./actions";

export function JoinTeamForm() {
  const [displayName, setDisplayName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await joinTeam(displayName, teamCode);

    if (result.success) {
      setSuccess(result.message);
      setDisplayName("");
      setTeamCode("");
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <Input
        label="Display Name"
        name="displayName"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="Enter your name"
        autoComplete="name"
        disabled={loading}
        required
      />

      <Input
        label="Team Code"
        name="teamCode"
        value={teamCode}
        onChange={(event) => setTeamCode(event.target.value)}
        placeholder="Enter your team code"
        autoComplete="off"
        disabled={loading}
        required
      />

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400" role="status">
          {success}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Join Team
      </Button>
    </form>
  );
}
