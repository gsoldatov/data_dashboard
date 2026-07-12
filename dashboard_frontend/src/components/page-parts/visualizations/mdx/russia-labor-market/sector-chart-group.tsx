import { useState, useMemo, useCallback } from "react";
import { Eraser } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/common/shadcn-ui/dropdown-menu";
import { Badge } from "@/components/common/shadcn-ui/badge";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import { SalaryBySectorLineChart } from "./salary-by-sector-line-chart";

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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                        Select sectors
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" className="max-h-56">
                        {allSectors.map((sector) => (
                            <DropdownMenuCheckboxItem
                                key={sector}
                                checked={selectedSectors.includes(sector)}
                                onCheckedChange={() => toggleSector(sector)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {sector}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {selectedSectors.length > 0 && (
                    <>
                        <button
                            type="button"
                            onClick={clearSectors}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Clear all sectors"
                        >
                            <Eraser className="h-4 w-4" />
                        </button>
                        <div className="flex flex-wrap gap-1.5">
                            {displayedSectors.map((sector) => (
                                <Badge
                                    key={sector}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => toggleSector(sector)}
                                >
                                    {sector}
                                </Badge>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <SalaryBySectorLineChart
                items={items}
                displayedSectors={displayedSectors}
            />
        </div>
    );
};
