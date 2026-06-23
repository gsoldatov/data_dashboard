import type { TooltipProps } from "recharts";
import type { NameType } from "recharts/types/component/DefaultTooltipContent";


/** Shared tooltip content rendering each payload entry's name and value,
 *  with theming support via shadcn/ui CSS variables. */
export const ChartTooltip = ({
    active,
    payload,
    formatter,
}: TooltipProps<number, NameType>) => {
    if (!active || !payload?.length) return null;

    return (
        <div
            // Container: themed background / border / shadow, max-width
            className="bg-popover text-popover-foreground border rounded-md shadow-md max-w-[500px]"
        >
            {payload.map((entry, i) => (
                <TooltipRow
                    key={`tooltip-${i}`}
                    entry={entry}
                    formatter={formatter}
                />
            ))}
        </div>
    );
};

type PayloadEntry = NonNullable<TooltipProps<number, NameType>["payload"]>[number];

interface TooltipRowProps {
    entry: PayloadEntry;
    formatter?: TooltipProps<number, NameType>["formatter"];
}

const TooltipRow = ({ entry, formatter }: TooltipRowProps) => {
    let displayValue: string = String(entry.value ?? "");
    let displayName: string = String(entry.name ?? "");

    if (formatter && entry.value != null && entry.name != null) {
        const result = formatter(entry.value, entry.name, entry, 0, []);
        if (Array.isArray(result)) {
            displayValue = String(result[0]);
            displayName = String(result[1]);
        } else {
            displayValue = String(result);
        }
    }

    return (
        <div
            // Row: flex layout, padding, separator borders
            className="flex items-center gap-2 px-3 py-1.5 border-b last:border-b-0"
            style={{ color: entry.color || undefined }}
        >
            <span
                // Name: truncation with min / max width, fills remaining space
                className="truncate min-w-[100px] max-w-[350px] flex-1"
                title={displayName}
            >
                {displayName}
            </span>
            <span
                // Value: truncation with min width, prevents shrinking, right-aligned
                className="truncate min-w-[150px] shrink-0 text-right"
                title={displayValue}
            >
                {displayValue}
            </span>
        </div>
    );
};
