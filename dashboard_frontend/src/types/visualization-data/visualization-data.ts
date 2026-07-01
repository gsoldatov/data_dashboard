import { z } from "zod";
import { russiaGdpItem } from "./russia-gdp";
import { russiaCpiItem, russiaKeyRateItem } from "./russia-inflation";
import {
    russiaLaborMarketAverageSalaryItem,
    russiaLaborMarketSectorSalaryItem,
    russiaLaborMarketWorkforceItem,
} from "./russia-labor-market";
import { russiaStateBudgetItem } from "./russia-state-budget";
import {
    tradeByCountryItem,
    tradeYearlyTotalItem,
    tradeByCategoryItem,
} from "./russia-trade";

/** Maps each visualization slug to the Zod schema used for validating
 *  its backend response data in RTK Query. */
export const visualizationDataResponseValidatorMap: Record<
    string,
    z.ZodType
> = {
    russia_gdp: z.array(z.array(russiaGdpItem)),
    russia_inflation: z.tuple([
        z.array(russiaCpiItem),
        z.array(russiaKeyRateItem),
    ]),
    russia_labor_market: z.tuple([
        z.array(russiaLaborMarketAverageSalaryItem),
        z.array(russiaLaborMarketSectorSalaryItem),
        z.array(russiaLaborMarketWorkforceItem),
    ]),
    russia_state_budget: z.array(z.array(russiaStateBudgetItem)),
    russia_trade: z.tuple([
        z.array(tradeByCountryItem), // [0] exports by country
        z.array(tradeYearlyTotalItem), // [1] exports yearly totals
        z.array(tradeByCategoryItem), // [2] exports by category
        z.array(tradeByCountryItem), // [3] imports by country
        z.array(tradeYearlyTotalItem), // [4] imports yearly totals
        z.array(tradeByCategoryItem), // [5] imports by category
    ]),
};
