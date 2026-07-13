import { Eraser } from "lucide-react";
import { Badge } from "@/components/common/shadcn-ui/badge";

export interface AttributeSelectionsProps<T extends string | number = number> {
    selectedValues: T[];
    displayedValues: T[];
    onToggle: (value: T) => void;
    onClear: () => void;
}

/** Badge row of selected values with a clear-all eraser button. Hidden when no explicit selection. */
export const AttributeSelections = <T extends string | number = number>({
    selectedValues,
    displayedValues,
    onToggle,
    onClear,
}: AttributeSelectionsProps<T>) => {
    if (selectedValues.length === 0) return null;

    return (
        <>
            <button
                type="button"
                onClick={onClear}
                className="text-foreground hover:text-accent mt-1.5"
                aria-label="Clear all values"
            >
                <Eraser className="h-4 w-4" />
            </button>
            <div className="flex flex-wrap gap-1.5 mt-1" data-testid="attribute-badges">
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
