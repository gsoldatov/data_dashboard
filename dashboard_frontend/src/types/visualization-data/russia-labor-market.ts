import { z } from "zod";

/** Zod schema for a single Russia average salary data item. */
export const russiaLaborMarketAverageSalaryItem = z.object({
    year: z.number(),
    value: z.number(),
});

/** Inferred type for a single Russia average salary data item. */
export type RussiaLaborMarketAverageSalaryItem = z.infer<
    typeof russiaLaborMarketAverageSalaryItem
>;

/** Zod schema for a single Russia sector salary data item. */
export const russiaLaborMarketSectorSalaryItem = z.object({
    year: z.number(),
    sector: z.string(),
    value: z.number(),
});

/** Inferred type for a single Russia sector salary data item. */
export type RussiaLaborMarketSectorSalaryItem = z.infer<
    typeof russiaLaborMarketSectorSalaryItem
>;

/** Zod schema for a single Russia workforce data item. */
export const russiaLaborMarketWorkforceItem = z.object({
    year_month: z.string(),
    workforce: z.number(),
    employed: z.number(),
    unemployed: z.number(),
    workforce_share_in_population: z.number(),
    employed_share_in_population: z.number(),
    unemployed_share_in_workforce: z.number(),
});

/** Inferred type for a single Russia workforce data item. */
export type RussiaLaborMarketWorkforceItem = z.infer<
    typeof russiaLaborMarketWorkforceItem
>;

/** Full response schema: tuple of three datasets. */
export const russiaLaborMarketResponseSchema = z.tuple([
    z.array(russiaLaborMarketAverageSalaryItem),
    z.array(russiaLaborMarketSectorSalaryItem),
    z.array(russiaLaborMarketWorkforceItem),
]);
