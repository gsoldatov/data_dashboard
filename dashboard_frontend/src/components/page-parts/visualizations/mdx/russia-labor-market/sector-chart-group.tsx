import { useState, useMemo, useCallback } from "react";

import { AttributeDropdown } from "@/components/common/visualizations/selectors/attribute/dropdown";
import { AttributeSelections } from "@/components/common/visualizations/selectors/attribute/selection";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import { SalaryBySectorLineChart } from "./salary-by-sector-line-chart";
import { FLOW_SPACING } from "@/styles/constants";

import type { RussiaLaborMarketSectorSalaryItem } from "@/types/visualization-data/russia-labor-market";

/** Chart group wrapping the sector salary line chart with sector selection. */
export const SectorChartGroup = () => {
    const { data } = useGetVisualizationDatasetQuery("russia_salaries_by_sector");
    const items = (data ?? []) as RussiaLaborMarketSectorSalaryItem[];

    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

    const allSectors = useMemo(
        () => [...new Set(items.map((d) => d.sector))].sort(),
        [items],
    );

    /** Sectors shown in the chart: all when nothing selected, selected otherwise. */
    const displayedSectors = useMemo(
        () =>
            selectedSectors.length === 0
                ? allSectors
                : selectedSectors,
        [allSectors, selectedSectors],
    );

    const toggleSector = useCallback((sector: string) => {
        setSelectedSectors((prev) => {
            if (prev.length === 0) {
                return prev.includes(sector) ? prev : [sector];
            }
            return prev.includes(sector)
                ? prev.filter((s) => s !== sector)
                : [...prev, sector];
        });
    }, []);

    const clearSectors = useCallback(() => {
        setSelectedSectors([]);
    }, []);

    return (
        <div className={FLOW_SPACING}>
            <div className="flex items-center gap-2">
                <AttributeDropdown
                    allValues={allSectors}
                    selectedValues={selectedSectors}
                    onToggle={toggleSector}
                    prompt="Select sectors"
                />
                <AttributeSelections
                    selectedValues={selectedSectors}
                    displayedValues={displayedSectors}
                    onToggle={toggleSector}
                    onClear={clearSectors}
                />
            </div>

            <SalaryBySectorLineChart
                items={items}
                displayedSectors={displayedSectors}
            />
        </div>
    );
};
