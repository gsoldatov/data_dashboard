import { ResponsiveContainer } from "recharts";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

// ── ChartTitle ────────────────────────────────────────────────────────────

interface ChartTitleProps {
    children: React.ReactNode;
}

/** Reusable chart heading with consistent styling across MDX visualization pages. */
export const ChartTitle = ({ children }: ChartTitleProps) => (
    <h3 className="font-bold text-xl mb-2">{children}</h3>
);

// ── ChartsContainer ────────────────────────────────────────────────────────

interface ChartsContainerProps {
    children: React.ReactNode;
    dataTestID?: string;
}

/** Responsive flex container for chart components.
 *  Stacks children vertically on small screens, places them side-by-side on large screens.
 */
export const ChartsContainer = ({ children, dataTestID }: ChartsContainerProps) => (
    <div className="flex flex-col lg:flex-row gap-4 w-full mb-4 [&>*]:flex-1 [&>*]:min-w-0" data-testid={dataTestID}>{children}</div>
);

// ── ChartPlaceholder ──────────────────────────────────────────────────────

interface ChartPlaceholderProps {
    height?: number;
    message?: string;
}

/** Placeholder displayed when a chart has no data to render.
 *  Matches the dimensions of the chart it replaces via ResponsiveContainer. */
export const ChartPlaceholder = ({
    height,
    message = "No data available",
}: ChartPlaceholderProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <div className="flex items-center justify-center h-full border rounded-md text-muted-foreground text-sm">
            {message}
        </div>
    </ResponsiveContainer>
);

// ── ChartTooltip / axisTooltipContent ──────────────────────────────────────

type PayloadEntry<TValue extends ValueType> =
    NonNullable<TooltipProps<TValue, NameType>["payload"]>[number];

/**
 * Create a tooltip content component for a chart whose X-axis data key is
 * `dataKey` and display label is `label`.  The returned function is meant
 * to be passed as `content` to a Recharts `<Tooltip>`:
 *
 * ```tsx
 * <Tooltip content={axisTooltipContent("year", "Year")} formatter={tooltipFormatter} />
 * ```
 *
 * Passing the axis info via a factory avoids widening the `<Tooltip>` generics
 * (Recharts infers `TValue` from `formatter`; an unknown prop like `xAxisKey`
 * would break that inference).
 */
export const axisTooltipContent =
    (dataKey: string, label?: string) =>
    <TValue extends ValueType>(
        props: TooltipProps<TValue, NameType>,
    ) => <ChartTooltip {...props} xAxisKey={dataKey} xAxisLabel={label} />;

/** Shared tooltip content for Recharts charts.
 *
 *  Renders two sections:
 *  1. An X-axis indicator row (bold) — displayed when `xAxisKey` is provided.
 *     The data value is read from the first payload entry's raw data
 *     using `xAxisKey`; the display label comes from `xAxisLabel`
 *     (or falls back to `xAxisKey` itself).
 *     Omit `xAxisKey` for chart types without an X-axis (Treemap, Pie, etc.).
 *  2. One row per payload entry, showing the series name and formatted value.
 *
 *  Uses `content={ChartTooltip}` on a Recharts `<Tooltip>` — the function-reference
 *  pattern so Recharts calls `React.createElement(ChartTooltip, props)`. */
export const ChartTooltip = <TValue extends ValueType>({
    active,
    payload,
    formatter,
    xAxisKey,
    xAxisLabel,
}: TooltipProps<TValue, NameType> & { xAxisKey?: string; xAxisLabel?: string }) => {
    if (!active || !payload?.length) return null;

    // Resolve the X-axis indicator value from the first payload entry
    const xAxisValue =
        xAxisKey != null
            ? (payload[0]?.payload as Record<string, unknown> | undefined)?.[
                  xAxisKey
              ]
            : undefined;

    return (
        <div
            // Container: themed background / border / shadow, max-width
            className="bg-popover text-popover-foreground border rounded-md shadow-md max-w-[500px]"
        >
            {xAxisKey != null && xAxisValue != null && (
                <div
                    // Indicator row: same layout as data rows, bold, separator border
                    className="flex items-center gap-2 px-3 py-1.5 border-b font-bold"
                >
                    <span
                        // Label: display label (or raw key as fallback), same width as name column
                        className="truncate min-w-[100px] max-w-[350px] flex-1"
                    >
                        {xAxisLabel ?? xAxisKey}
                    </span>
                    <span
                        // Value: same width constraints as value column
                        className="truncate min-w-[150px] shrink-0 text-right"
                    >
                        {String(xAxisValue)}
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

interface TooltipRowProps<TValue extends ValueType> {
    entry: PayloadEntry<TValue>;
    formatter?: TooltipProps<TValue, NameType>["formatter"];
}

/** Single data row inside the tooltip.
 *
 *  Applies the chart's `formatter` to the entry's value and name,
 *  handling both single-string and `[value, name]`-tuple returns
 *  (the same logic Recharts' `DefaultTooltipContent` uses). */
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
