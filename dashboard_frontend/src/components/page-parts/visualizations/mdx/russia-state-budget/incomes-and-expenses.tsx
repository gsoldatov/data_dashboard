import { CategoryChartGroup } from "./chart-group/category-chart-group";

export const IncomeChartGroup = () => (
    <CategoryChartGroup rootPrefix="1" dataTestID="income-chart-group" />
);

export const ExpensesChartGroup = () => (
    <CategoryChartGroup rootPrefix="2" dataTestID="expenses-chart-group" />
);
