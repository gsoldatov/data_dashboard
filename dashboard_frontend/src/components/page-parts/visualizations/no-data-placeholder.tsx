import { ResponsiveContainer } from "recharts";

interface NoDataPlaceholderProps {
    height?: number;
}

/** Placeholder displayed when a chart has no data to render.
 *  Matches the dimensions of the chart it replaces via ResponsiveContainer. */
export const NoDataPlaceholder = ({ height }: NoDataPlaceholderProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <div className="flex items-center justify-center h-full border rounded-md text-muted-foreground text-sm">
            No data available
        </div>
    </ResponsiveContainer>
);
