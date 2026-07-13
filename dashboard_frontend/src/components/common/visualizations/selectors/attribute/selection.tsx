import { Eraser } from "lucide-react";
import { Badge } from "@/components/common/shadcn-ui/badge";

export interface AttributeSelectionsProps {
    selectedValues: number[];
    displayedValues: number[];
    onToggle: (value: number) => void;
    onClear: () => void;
}

/** Badge row of selected values with a clear-all eraser button. Hidden when no explicit selection. */
export const AttributeSelections = ({
    selectedValues,
    displayedValues,
    onToggle,
    onClear,
}: AttributeSelectionsProps) => {
    if (selectedValues.length === 0) return null;

    return (
        <>
            <button
                type="button"
                onClick={onClear}
                className="text-foreground hover:text-accent"
                aria-label="Clear all values"
            >
                <Eraser className="h-4 w-4" />
            </button>
            <div className="flex flex-wrap gap-1.5" data-testid="attribute-badges">
                {displayedValues.map((value) => (
                    <Badge
                        key={value}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => onToggle(value)}
                    >
                        {value}
                    </Badge>
                ))}
            </div>
        </>
    );
};
