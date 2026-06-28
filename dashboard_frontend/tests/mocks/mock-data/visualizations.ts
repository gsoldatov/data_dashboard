/** 3-year simplified mock data for the Russia state budget page. */
const russiaStateBudgetData = [
    [
        { year: 2022, number: "1", name: "Income, total", value: 27824.4 },
        { year: 2023, number: "1", name: "Income, total", value: 29124.0 },
        { year: 2024, number: "1", name: "Income, total", value: 36708.6 },
        { year: 2022, number: "2", name: "Expenses, total", value: 31168.5 },
        { year: 2023, number: "2", name: "Expenses, total", value: 32393.7 },
        { year: 2024, number: "2", name: "Expenses, total", value: 39748.5 },
        { year: 2022, number: "3", name: "Deficit (-) / Profit (+)", value: -3344.1 },
        { year: 2023, number: "3", name: "Deficit (-) / Profit (+)", value: -3269.7 },
        { year: 2024, number: "3", name: "Deficit (-) / Profit (+)", value: -3039.9 },

        // Income subcategories (aggregated under "1")
        { year: 2022, number: "1.1", name: "Oil & Gas", value: 9056.0 },
        { year: 2023, number: "1.1", name: "Oil & Gas", value: 8823.0 },
        { year: 2024, number: "1.1", name: "Oil & Gas", value: 11234.0 },
        { year: 2022, number: "1.2", name: "VAT", value: 7211.0 },
        { year: 2023, number: "1.2", name: "VAT", value: 7592.0 },
        { year: 2024, number: "1.2", name: "VAT", value: 9876.0 },
        { year: 2022, number: "1.3", name: "Income Tax", value: 4987.0 },
        { year: 2023, number: "1.3", name: "Income Tax", value: 5234.0 },
        { year: 2024, number: "1.3", name: "Income Tax", value: 6543.0 },
        { year: 2022, number: "1.4", name: "Import Duties", value: 3812.0 },
        { year: 2023, number: "1.4", name: "Import Duties", value: 4120.0 },
        { year: 2024, number: "1.4", name: "Import Duties", value: 5123.0 },
        { year: 2022, number: "1.5", name: "Other Income", value: 2758.4 },
        { year: 2023, number: "1.5", name: "Other Income", value: 3355.0 },
        { year: 2024, number: "1.5", name: "Other Income", value: 3932.6 },

        // Nested subcategories under Oil & Gas
        { year: 2022, number: "1.1.1", name: "Oil", value: 6234.0 },
        { year: 2023, number: "1.1.1", name: "Oil", value: 6012.0 },
        { year: 2024, number: "1.1.1", name: "Oil", value: 7890.0 },
        { year: 2022, number: "1.1.2", name: "Gas", value: 2822.0 },
        { year: 2023, number: "1.1.2", name: "Gas", value: 2811.0 },
        { year: 2024, number: "1.1.2", name: "Gas", value: 3344.0 },

        // Nested subcategory under VAT
        { year: 2022, number: "1.2.1", name: "Domestic VAT", value: 4523.0 },
        { year: 2023, number: "1.2.1", name: "Domestic VAT", value: 4789.0 },
        { year: 2024, number: "1.2.1", name: "Domestic VAT", value: 6123.0 },

        // Expenses subcategories (aggregated under "2")
        { year: 2022, number: "2.1", name: "Social Policy", value: 12987.0 },
        { year: 2023, number: "2.1", name: "Social Policy", value: 13234.0 },
        { year: 2024, number: "2.1", name: "Social Policy", value: 15432.0 },
        { year: 2022, number: "2.2", name: "National Defense", value: 4672.0 },
        { year: 2023, number: "2.2", name: "National Defense", value: 5123.0 },
        { year: 2024, number: "2.2", name: "National Defense", value: 6456.0 },
        { year: 2022, number: "2.3", name: "National Economy", value: 3987.0 },
        { year: 2023, number: "2.3", name: "National Economy", value: 4210.0 },
        { year: 2024, number: "2.3", name: "National Economy", value: 5321.0 },
        { year: 2022, number: "2.4", name: "Healthcare", value: 3012.0 },
        { year: 2023, number: "2.4", name: "Healthcare", value: 3198.0 },
        { year: 2024, number: "2.4", name: "Healthcare", value: 4012.0 },
        { year: 2022, number: "2.5", name: "Other Expenses", value: 6510.5 },
        { year: 2023, number: "2.5", name: "Other Expenses", value: 6628.7 },
        { year: 2024, number: "2.5", name: "Other Expenses", value: 8527.5 },

        // Nested subcategories under Social Policy
        { year: 2022, number: "2.1.1", name: "Pensions", value: 8765.0 },
        { year: 2023, number: "2.1.1", name: "Pensions", value: 8912.0 },
        { year: 2024, number: "2.1.1", name: "Pensions", value: 10234.0 },
        { year: 2022, number: "2.1.2", name: "Social Benefits", value: 4222.0 },
        { year: 2023, number: "2.1.2", name: "Social Benefits", value: 4322.0 },
        { year: 2024, number: "2.1.2", name: "Social Benefits", value: 5198.0 },
    ],
];

/** 3-year mock data for the Russia GDP page (3 datasets). */
const russiaGdpData = [
    [
        { year: 2021, value: 100.0 },
        { year: 2022, value: 102.1 },
        { year: 2023, value: 105.3 },
    ],
    [
        { year: 2021, value: 1500000000000 },
        { year: 2022, value: 1600000000000 },
        { year: 2023, value: 1700000000000 },
    ],
    [
        { year: 2021, value: 4200000000000 },
        { year: 2022, value: 4200000000000 },
        { year: 2023, value: 4300000000000 },
    ],
];

/** 3-month mock data for the Russia labor market page (3 datasets). */
const russiaLaborMarketData = [
    [
        { year: 2023, value: 74854.0 },
        { year: 2024, value: 89069.0 },
        { year: 2025, value: 101784.0 },
    ],
    [
        { year: 2023, sector: "agriculture", value: 54158.1 },
        { year: 2024, sector: "agriculture", value: 65129.3 },
        { year: 2023, sector: "mining", value: 89343.7 },
        { year: 2024, sector: "mining", value: 102116.0 },
        { year: 2023, sector: "manufacturing", value: 65832.0 },
        { year: 2024, sector: "manufacturing", value: 76457.0 },
    ],
    [
        { year_month: "2024-01", workforce: 76500.0, employed: 73100.0, unemployed: 3400.0, workforce_share_in_population: 62.5, employed_share_in_population: 59.8, unemployed_share_in_workforce: 4.4 },
        { year_month: "2024-02", workforce: 76700.0, employed: 73300.0, unemployed: 3400.0, workforce_share_in_population: 62.7, employed_share_in_population: 60.0, unemployed_share_in_workforce: 4.4 },
        { year_month: "2024-03", workforce: 76900.0, employed: 73600.0, unemployed: 3300.0, workforce_share_in_population: 62.9, employed_share_in_population: 60.2, unemployed_share_in_workforce: 4.3 },
    ],
];

export const slugToVisualizationData: Record<string, unknown[]> = {
    russia_gdp: russiaGdpData,
    russia_state_budget: russiaStateBudgetData,
    russia_labor_market: russiaLaborMarketData,
};
