import { useState, useEffect, useMemo } from "react";
import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
import { SingleValueSelector } from "@/components/common/visualizations/selectors/single-value-selector";
import { CumulativeInflationBarChart } from "./cumulative-inflation-bar-chart";

import type { RussiaCpiItem } from "@/types/visualization-data/russia-inflation";

/** Chart group for cumulative inflation with start/end period selectors. */
export const InflationChartGroup = () => {
    const { data } = useGetVisualizationDataQuery("russia_inflation");
    const items = (data?.[0] ?? []) as RussiaCpiItem[];

    const allPeriods = useMemo(() => {
        const periods = items.map((item) => item.year_month);
        periods.sort();
        return periods;
    }, [items]);

    const defaultStart = useMemo(() => {
        if (allPeriods.length === 0) return "";
        const idx = Math.max(0, allPeriods.length - 12);
        return allPeriods[idx];
    }, [allPeriods]);

    const defaultEnd = useMemo(() => {
        if (allPeriods.length === 0) return "";
        return allPeriods[allPeriods.length - 1];
    }, [allPeriods]);

    const [startPeriod, setStartPeriod] = useState<string>("");
    const [endPeriod, setEndPeriod] = useState<string>("");

    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        if (!initialized && defaultStart && defaultEnd) {
            setStartPeriod(defaultStart);
            setEndPeriod(defaultEnd);
            setInitialized(true);
        }
    }, [defaultStart, defaultEnd, initialized]);

    if (allPeriods.length === 0) {
        return null;
    }

    const validStartValues = allPeriods.filter((p) => p <= endPeriod);
    const validEndValues = allPeriods.filter((p) => p >= startPeriod);

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-2 mb-4">
                <SingleValueSelector
                    title="Start period"
                    allValues={validStartValues}
                    selectedValue={startPeriod}
                    onSelect={setStartPeriod}
                />
                <SingleValueSelector
                    title="End period"
                    allValues={validEndValues}
                    selectedValue={endPeriod}
                    onSelect={setEndPeriod}
                />
            </div>
            <CumulativeInflationBarChart
                startPeriod={startPeriod}
                endPeriod={endPeriod}
            />
        </div>
    );
};
