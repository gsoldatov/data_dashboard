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

/** Maps each dataset name to the Zod schema used for validating
 *  its data in the visualization-data RTK Query response. */
export const datasetValidatorMap: Record<string, z.ZodType> = {
    russia_gdp_constant_prices_rub: z.array(russiaGdpItem),
    russia_gdp_constant_prices_usd: z.array(russiaGdpItem),
    russia_gdp_ppp_constant_prices: z.array(russiaGdpItem),
    russia_consumer_price_index: z.array(russiaCpiItem),
    russia_key_rate: z.array(russiaKeyRateItem),
    russia_state_budget: z.array(russiaStateBudgetItem),
    russia_trade_exports_by_country: z.array(tradeByCountryItem),
    russia_trade_exports_yearly_totals: z.array(tradeYearlyTotalItem),
    russia_trade_exports_by_category: z.array(tradeByCategoryItem),
    russia_trade_imports_by_country: z.array(tradeByCountryItem),
    russia_trade_imports_yearly_totals: z.array(tradeYearlyTotalItem),
    russia_trade_imports_by_category: z.array(tradeByCategoryItem),
    russia_salaries_average: z.array(russiaLaborMarketAverageSalaryItem),
    russia_salaries_by_sector: z.array(russiaLaborMarketSectorSalaryItem),
    russia_labor_workforce: z.array(russiaLaborMarketWorkforceItem),
};
