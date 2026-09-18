"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncFffClubs } from "@/app/actions/admin";

export function FffClubSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    setIsError(false);

    const result = await syncFffClubs();

    setLoading(false);
    if ("error" in result) {
      setIsError(true);
      setMessage(result.error);
      return;
    }

    setIsError(false);
    setMessage(
      `${result.upserted} club${result.upserted > 1 ? "s" : ""} importé${result.upserted > 1 ? "s" : ""}/mis à jour (${result.pages} page${result.pages > 1 ? "s" : ""}).`
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent disabled:opacity-60"
      >
        {loading ? "Import en cours…" : "Importer les clubs FFF"}
      </button>
      {loading && (
        <p className="max-w-xs text-right text-xs text-zinc-500">
          Peut prendre plusieurs minutes (tout l&apos;annuaire des clubs FFF).
        </p>
      )}
      {message && (
        <p className={`max-w-xs text-right text-xs ${isError ? "text-red-600" : "text-zinc-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
