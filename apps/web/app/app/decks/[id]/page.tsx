"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: deck, isLoading } = trpc.decks.getById.useQuery({ id });
  const { data: dueCards } = trpc.cards.getDue.useQuery({ deckId: id });
  const deleteDeck = trpc.decks.delete.useMutation({
    onSuccess: () => router.push("/app/decks"),
  });

  if (isLoading) return <p>Loading…</p>;
  if (!deck) return <p>Deck not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{deck.name}</h1>
          {deck.description && <p className="text-gray-500 mt-1">{deck.description}</p>}
        </div>
        <button
          onClick={() => {
            if (confirm("Delete this deck?")) deleteDeck.mutate({ id });
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
      <div className="flex gap-4">
        <Link
          href={`/app/review?deckId=${id}`}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Review ({dueCards?.length ?? 0} due)
        </Link>
        <Link href="/app/decks" className="rounded-md border px-4 py-2 hover:bg-gray-50">
          Back
        </Link>
      </div>
    </div>
  );
}
