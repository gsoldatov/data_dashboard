import { useState, useMemo } from "react";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import { TradeYearSelector } from "./trade-year-selector";
import { CountryBarChart } from "./country-bar-chart";
import { CategoryTreemap } from "./category-treemap";

import type { TradeByCountryItem } from "@/types/visualization-data/russia-trade";

export const TradeChartGroup = () => {
    const { data: exportsByCountryData } = useGetVisualizationDatasetQuery(
        "russia_trade_exports_by_country",
    );
    const { data: importsByCountryData } = useGetVisualizationDatasetQuery(
        "russia_trade_imports_by_country",
    );

    const exportsByCountry = (exportsByCountryData ?? []) as TradeByCountryItem[];
    const importsByCountry = (importsByCountryData ?? []) as TradeByCountryItem[];

    const allYears = useMemo(() => {
        const years = new Set([
            ...exportsByCountry.map((d) => d.year),
            ...importsByCountry.map((d) => d.year),
        ]);
        return [...years].sort((a, b) => a - b);
    }, [exportsByCountry, importsByCountry]);

    const [selectedYear, setSelectedYear] = useState<string>(
        () => String(allYears[allYears.length - 1] ?? ""),
    );

    return (
        <>
            <h2 className="font-bold text-2xl">Trade Analysis</h2>

            <TradeYearSelector
                allYears={allYears}
                selectedYear={selectedYear}
                onSelect={setSelectedYear}
            />

            <CountryBarChart
                label="Exports"
                datasetName="russia_trade_exports_by_country"
                selectedYear={selectedYear}
            />
            <CategoryTreemap
                label="Exports"
                datasetName="russia_trade_exports_by_category"
                selectedYear={selectedYear}
            />
            <CountryBarChart
                label="Imports"
                datasetName="russia_trade_imports_by_country"
                selectedYear={selectedYear}
            />
            <CategoryTreemap
                label="Imports"
                datasetName="russia_trade_imports_by_category"
                selectedYear={selectedYear}
            />
        </>
    );
};
