import { router } from "./trpc";
import { decksRouter } from "./routers/decks";
import { cardsRouter } from "./routers/cards";

export const appRouter = router({
  decks: decksRouter,
  cards: cardsRouter,
});

export type AppRouter = typeof appRouter;
