import { z } from "zod";
import { russiaGdpItem } from "./russia-gdp";
import { russiaCpiItem, russiaKeyRateItem } from "./russia-inflation";
import {
    russiaLaborMarketAverageSalaryItem,
    russiaLaborMarketSectorSalaryItem,
    russiaLaborMarketWorkforceItem,
} from "./russia-labor-market";
import { russiaStateBudgetItem } from "./russia-state-budget";

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
};
