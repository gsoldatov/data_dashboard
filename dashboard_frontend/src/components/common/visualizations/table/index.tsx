import { POSITIVE_COLOR, NEGATIVE_COLOR } from "@/styles/charts";

/**
 * Responsive indicator table.
 *
 * A single DOM structure that renders as a standard table on desktop and
 * transposes on mobile.  The mechanism:
 * - the outer `<table>` is a flex container by default and a table on `lg:`;
 * - `<thead>` and `<tbody>` become horizontal flex wrappers;
 * - each `<tr>` stacks its cells vertically on mobile (`flex-col`) and
 *   restores normal table-row layout on desktop.
 *
 * This means the header row and value row sit **side-by-side** on mobile,
 * with each header stacked above its corresponding value — no duplicated DOM.
 */

interface IndicatorTableProps {
    children: React.ReactNode;
    "data-testid"?: string;
}

export const IndicatorTable = ({
    children,
    "data-testid": dataTestID,
}: IndicatorTableProps) => (
    <table
        className="flex border-collapse lg:table"
        data-testid={dataTestID}
    >
        {children}
    </table>
);

/**
 * Header row of an indicator table.
 *
 * On mobile the row becomes a single vertical column of header labels.
 */
export const IndicatorHeaderRow = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <thead className="flex lg:table-header-group">
        <tr className="flex flex-col lg:table-row">{children}</tr>
    </thead>
);

/**
 * Value row of an indicator table.
 *
 * On mobile the row becomes a single vertical column of values, positioned
 * to the right of the header column via the flex layout of the outer table.
 */
export const IndicatorValueRow = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <tbody className="flex lg:table-row-group">
        <tr className="flex flex-col lg:table-row">{children}</tr>
    </tbody>
);

/**
 * Bold header cell.
 *
 * Uses `block` on mobile (stacks vertically inside its flex-col `<tr>`) and
 * `table-cell` on desktop (restores normal table-cell behaviour).
 */
export const HeaderCell = ({ children }: { children: React.ReactNode }) => (
    <th className="block lg:table-cell font-bold px-2 py-1 text-left">
        {children}
    </th>
);

type ValueCellColor = "positive" | "negative";

interface ValueCellProps {
    children: React.ReactNode;
    color?: ValueCellColor;
}

/**
 * Value cell with optional positive / negative colour.
 *
 * When `color` is omitted the cell inherits the default text colour.
 */
export const ValueCell = ({ children, color }: ValueCellProps) => {
    const style =
        color === "positive"
            ? { color: POSITIVE_COLOR }
            : color === "negative"
              ? { color: NEGATIVE_COLOR }
              : undefined;

    return (
        <td
            className="block lg:table-cell px-2 py-1"
            style={style}
        >
            {children}
        </td>
    );
};
