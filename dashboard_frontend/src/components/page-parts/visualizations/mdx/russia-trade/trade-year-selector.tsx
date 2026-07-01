import { SingleValueSelector } from "@/components/common/visualizations/selectors/single-value-selector";

interface TradeYearSelectorProps {
    allYears: number[];
    selectedYear: string;
    onSelect: (year: string) => void;
}

export const TradeYearSelector = ({
    allYears,
    selectedYear,
    onSelect,
}: TradeYearSelectorProps) => (
    <div className="mb-4">
        <SingleValueSelector
            allValues={allYears.map(String)}
            selectedValue={selectedYear}
            onSelect={onSelect}
            title="Year"
        />
    </div>
);
