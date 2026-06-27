/** General chart settings. */
export const CHART_HEIGHT = 400;
export const CHART_MARGINS = { top: 0, right: 0, left: 20, bottom: 0 };
export const Y_AXIS_LABEL_OFFSET = -10;

/** 24 distinct colours for chart series, ordered to minimise overlap. */
export const CHART_COLORS = [
    "#2563eb", // blue
    "#dc2626", // red
    "#16a34a", // green
    "#9333ea", // purple
    "#ea580c", // orange
    "#0891b2", // cyan
    "#ca8a04", // yellow
    "#db2777", // pink
    "#65a30d", // lime
    "#0d9488", // teal
    "#4f46e5", // indigo
    "#c026d3", // fuchsia
    "#d97706", // amber
    "#059669", // emerald
    "#7c3aed", // violet
    "#e11d48", // rose
    "#0284c7", // sky
    "#a3e635", // light lime
    "#f97316", // deep orange
    "#06b6d4", // light cyan
    "#a855f7", // light purple
    "#84cc16", // light green
    "#ef4444", // light red
    "#14b8a6", // light teal
];

/** Colours for positive / negative bar segments. */
export const POSITIVE_COLOR = "#16a34a";
export const NEGATIVE_COLOR = "#dc2626";

/** Tooltip formatter for bln RUB values. */
export const tooltipFormatter = (v: number) => `${v.toFixed(1)} bln RUB`;
