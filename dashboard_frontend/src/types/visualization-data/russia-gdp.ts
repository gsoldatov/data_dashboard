import { z } from "zod";

/** Zod schema for a single Russia GDP data item (flat format). */
export const russiaGdpItem = z.object({
    year: z.number(),
    value: z.number(),
});

/** Inferred type for a single Russia GDP data item. */
export type RussiaGdpItem = z.infer<typeof russiaGdpItem>;
