import { createTRPCContext } from "@/server/trpc/trpc";
import { appRouter } from "@/server/trpc";

export const trpcServer = appRouter.createCaller(createTRPCContext);
