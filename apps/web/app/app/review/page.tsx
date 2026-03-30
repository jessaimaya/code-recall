"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const RATING_LABELS: Record<number, string> = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId") ?? "";
  const router = useRouter();

  const { data: dueCards, refetch } = trpc.cards.getDue.useQuery({ deckId }, { enabled: !!deckId });
  const schedule = trpc.cards.schedule.useMutation({ onSuccess: () => refetch() });

  const [revealed, setRevealed] = useState(false);

  if (!deckId) {
    return (
      <div className="max-w-md">
        <p className="text-gray-500">No deck selected. Go to a deck and click Review.</p>
      </div>
    );
  }

  const card = dueCards?.[0];

  if (!card) {
    return (
      <div className="max-w-md text-center py-12">
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-gray-500 mt-2">No cards due for review.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-md border px-4 py-2 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <p className="text-sm text-gray-500 mb-4">{dueCards?.length} card(s) remaining</p>

      <div className="rounded-lg border p-6 mb-6">
        <p className="text-xs text-gray-400 uppercase mb-2">{card.cardType}</p>
        <h2 className="text-lg font-semibold mb-4">{card.title}</h2>
        {revealed && (
          <div className="mt-4 pt-4 border-t">
            <pre className="whitespace-pre-wrap text-sm">{card.content}</pre>
          </div>
        )}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full rounded-md bg-black py-3 text-white hover:bg-gray-800"
        >
          Show Answer
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                schedule.mutate({ cardId: card.id, rating: r });
                setRevealed(false);
              }}
              disabled={schedule.isPending}
              className="rounded-md border py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {RATING_LABELS[r]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
