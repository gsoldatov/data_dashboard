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
    ],
];

export const slugToVisualizationData: Record<string, unknown[]> = {
    russia_state_budget: russiaStateBudgetData,
};
