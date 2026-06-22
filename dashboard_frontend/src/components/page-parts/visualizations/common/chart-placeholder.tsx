import { ResponsiveContainer } from "recharts";

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
