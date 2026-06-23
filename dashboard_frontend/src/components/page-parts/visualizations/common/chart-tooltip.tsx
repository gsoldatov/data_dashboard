import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

type PayloadEntry<TValue extends ValueType> =
    NonNullable<TooltipProps<TValue, NameType>["payload"]>[number];

/** Shared tooltip content rendering an X-axis indicator row followed by
 *  each payload entry's name and value.
 *  The X-axis label and value are derived from the payload data —
 *  no hardcoded axis name in the tooltip. */
export const ChartTooltip = <TValue extends ValueType>({
    active,
    payload,
    formatter,
}: TooltipProps<TValue, NameType>) => {
    if (!active || !payload?.length) return null;

    const xAxis = getXAxisInfo(payload);

    return (
        <div
            // Container: themed background / border / shadow, max-width
            className="bg-popover text-popover-foreground border rounded-md shadow-md max-w-[500px]"
        >
            {xAxis && (
                <div
                    // Indicator row: same layout as data rows, bold, separator border
                    className="flex items-center gap-2 px-3 py-1.5 border-b font-bold"
                >
                    <span
                        // Label: same width constraints as name column
                        className="truncate min-w-[100px] max-w-[350px] flex-1"
                    >
                        {xAxis.label}
                    </span>
                    <span
                        // Value: same width constraints as value column
                        className="truncate min-w-[150px] shrink-0 text-right"
                    >
                        {xAxis.value}
                    </span>
                </div>
            )}
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

/** Derive the X-axis label and value from the payload data.
 *  Uses the raw-data property that is not a series dataKey
 *  and does not start with "_" (internal chart helpers). */
const getXAxisInfo = <TValue extends ValueType>(
    payload: PayloadEntry<TValue>[],
): { label: string; value: number | string } | null => {
    const first = payload[0];
    if (!first) return null;

    const seriesKeys = new Set(payload.map((e) => String(e.dataKey ?? "")));
    const raw = first.payload as Record<string, unknown> | undefined;
    if (!raw) return null;

    const xAxisKey = Object.keys(raw).find(
        (k) => !seriesKeys.has(k) && !k.startsWith("_"),
    );
    if (!xAxisKey) return null;

    const value = raw[xAxisKey];
    if (typeof value !== "number" && typeof value !== "string") return null;

    const label = xAxisKey.charAt(0).toUpperCase() + xAxisKey.slice(1);
    return { label, value };
};

interface TooltipRowProps<TValue extends ValueType> {
    entry: PayloadEntry<TValue>;
    formatter?: TooltipProps<TValue, NameType>["formatter"];
}

const TooltipRow = <TValue extends ValueType>({
    entry,
    formatter,
}: TooltipRowProps<TValue>) => {
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
