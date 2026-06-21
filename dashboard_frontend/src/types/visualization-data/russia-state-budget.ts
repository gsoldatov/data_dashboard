import { z } from "zod";

/** Zod schema for a single Russia state budget data item (flat format). */
export const russiaStateBudgetItem = z.object({
    year: z.number(),
    number: z.string(),
    name: z.string(),
    value: z.number(),
});

/** Inferred type for a single Russia state budget data item. */
export type RussiaStateBudgetItem = z.infer<typeof russiaStateBudgetItem>;
