import { Eraser } from "lucide-react";
import { Badge } from "@/components/common/shadcn-ui/badge";

export interface YearSelectionsProps {
    selectedYears: number[];
    effectiveYears: number[];
    onToggle: (year: number) => void;
    onClear: () => void;
}

/** Badge row of selected years with a clear-all eraser button. Hidden when no explicit selection. */
export const YearSelections = ({
    selectedYears,
    effectiveYears,
    onToggle,
    onClear,
}: YearSelectionsProps) => {
    if (selectedYears.length === 0) return null;

    return (
        <>
            <button
                type="button"
                onClick={onClear}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear all years"
            >
                <Eraser className="h-4 w-4" />
            </button>
            <div className="flex flex-wrap gap-1.5">
                {effectiveYears.map((year) => (
                    <Badge
                        key={year}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => onToggle(year)}
                    >
                        {year}
                    </Badge>
                ))}
            </div>
        </>
    );
};
