import { useMemo } from "react";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { ChartPlaceholder, ChartTitle, axisTooltipContent } from "@/components/common/visualizations/charts/charts";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    CHART_COLORS,
    formatScaledValue,
} from "@/styles/charts";

import type { TradeByCountryItem } from "@/types/visualization-data/russia-trade";

interface CountryBarChartProps {
    label: string;
    datasetName: string;
    selectedYear: string;
}

const BLN = 1_000_000_000;
const BAR_HEIGHT = 25;
const VISIBLE_BARS = 15;

export const CountryBarChart = ({ label, datasetName, selectedYear }: CountryBarChartProps) => {
    const { data } = useGetVisualizationDatasetQuery(datasetName);
    const countryItems = (data ?? []) as TradeByCountryItem[];

    const chartData = useMemo(() => {
        const year = Number(selectedYear);
        return countryItems
            .filter((d) => d.year === year)
            .map((d) => ({
                country: d.country,
                value: d.value / BLN,
                _raw: d.value,
            }))
            .sort((a, b) => b.value - a.value);
    }, [countryItems, selectedYear]);

    if (chartData.length === 0) {
        return (
            <>
                <ChartTitle>{label} by Country</ChartTitle>
                <ChartPlaceholder height={CHART_HEIGHT} />
            </>
        );
    }

    const chartHeight = Math.max(CHART_HEIGHT, chartData.length * BAR_HEIGHT);

    return (
        <>
            <ChartTitle>{label} by Country</ChartTitle>
            <div
                style={{
                    maxHeight: VISIBLE_BARS * BAR_HEIGHT,
                    overflowY: "auto",
                }}
            >
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart
                        data={chartData}
                        margin={CHART_MARGINS}
                        layout="vertical"
                    >
                        <CartesianGrid
                            stroke={GRID_STROKE}
                            strokeDasharray={GRID_STROKE_DASHARRAY}
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
                            tickFormatter={(v: number) => v.toFixed(0)}
                        />
                        <YAxis
                            type="category"
                            dataKey="country"
                            width={120}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            content={axisTooltipContent("country", "Country")}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(_v, _name, entry: any) =>
                                formatScaledValue(
                                    entry.payload._raw,
                                    "USD",
                                )
                            }
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={
                                        CHART_COLORS[
                                            i % CHART_COLORS.length
                                        ]
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};
