import { ResponsiveContainer } from "recharts";

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
