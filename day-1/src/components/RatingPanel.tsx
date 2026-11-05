"use client";

import { useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";
import { ratePizzaAction } from "@/app/actions";
import { parseStars } from "@/lib/format";
import type { RatingSummary } from "@/lib/types";

function reduceRating(summary: RatingSummary, stars: number): RatingSummary {
  const count = summary.count + 1;
  const average = (summary.average * summary.count + stars) / count;
  return { average: Math.round(average * 10) / 10, count };
}

function StarButton({ stars }: { stars: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="stars"
      value={stars}
      disabled={pending}
      aria-label={`Beri ${stars} bintang`}
      className="text-3xl text-amber-500 hover:scale-110 disabled:opacity-50"
    >
      ★
    </button>
  );
}

function SendingStatus() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return <p className="mt-2 text-sm text-ink/60">Mengirim…</p>;
}

export default function RatingPanel({
  pizzaId,
  summary,
}: {
  pizzaId: string;
  summary: RatingSummary;
}) {
  // The server value after refresh(); optimistic while the action is in flight
  const [optimisticSummary, addOptimisticSummary] = useOptimistic(
    summary,
    reduceRating,
  );
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setError(null);
    const stars = parseStars(formData.get("stars"));
    if (stars === null) return;

    addOptimisticSummary(stars);
    const result = await ratePizzaAction(pizzaId, formData);
    // On failure the transition ends, so the summary snaps back by itself
    if (!result.ok) setError(result.error);
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
      <h2 className="text-lg font-bold">Rating pelanggan</h2>
      <p className="mt-1 text-ink/70" data-testid="rating-summary">
        ★ {optimisticSummary.average.toFixed(1)} dari {optimisticSummary.count}{" "}
        rating
      </p>
      <form action={submit}>
        <div className="mt-4 flex gap-1" aria-label="Beri rating">
          {[1, 2, 3, 4, 5].map((stars) => (
            <StarButton key={stars} stars={stars} />
          ))}
        </div>
        <SendingStatus />
      </form>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}