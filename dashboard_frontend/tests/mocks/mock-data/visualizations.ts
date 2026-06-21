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
    ],
];

export const slugToVisualizationData: Record<string, unknown[]> = {
    russia_state_budget: russiaStateBudgetData,
};
