"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export default function NewDeckPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createDeck = trpc.decks.create.useMutation({
    onSuccess: ({ id }) => router.push(`/app/decks/${id}`),
  });

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">New Deck</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createDeck.mutate({ name, description: description || undefined });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g. React Hooks"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Optional"
          />
        </div>
        <button
          type="submit"
          disabled={createDeck.isPending}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {createDeck.isPending ? "Creating…" : "Create Deck"}
        </button>
      </form>
    </div>
  );
}
