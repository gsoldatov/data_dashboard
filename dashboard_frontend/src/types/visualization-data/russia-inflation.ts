import { z } from "zod";

/** Zod schema for a single Russia CPI data item. */
export const russiaCpiItem = z.object({
    year_month: z.string(),
    value: z.number(),
});

/** Inferred type for a single Russia CPI data item. */
export type RussiaCpiItem = z.infer<typeof russiaCpiItem>;

/** Zod schema for a single Russia key rate data item. */
export const russiaKeyRateItem = z.object({
    year_month: z.string(),
    key_rate: z.number().optional(),
    inflation_yoy: z.number().optional(),
});

/** Inferred type for a single Russia key rate data item. */
export type RussiaKeyRateItem = z.infer<typeof russiaKeyRateItem>;

/** Full response schema: tuple of two datasets (CPI first, key rate second). */
export const russiaInflationResponseSchema = z.tuple([
    z.array(russiaCpiItem),
    z.array(russiaKeyRateItem),
]);
