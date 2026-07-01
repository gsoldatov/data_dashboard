import { z } from "zod";

export const tradeByCountryItem = z.object({
    year: z.number(),
    country: z.string(),
    value: z.number(),
});

export type TradeByCountryItem = z.infer<typeof tradeByCountryItem>;

export const tradeYearlyTotalItem = z.object({
    year: z.number(),
    value: z.number(),
});

export type TradeYearlyTotalItem = z.infer<typeof tradeYearlyTotalItem>;

export const tradeByCategoryItem = z.object({
    year: z.number(),
    product_category: z.string(),
    value: z.number(),
});

export type TradeByCategoryItem = z.infer<typeof tradeByCategoryItem>;
