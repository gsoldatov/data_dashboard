import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/common/shadcn-ui/select";

export interface SingleValueSelectorProps<T extends string> {
    allValues: T[];
    selectedValue: T;
    onSelect: (value: T) => void;
    title: string;
}

/** Single-value selector with a customizable title label to the left. */
export const SingleValueSelector = <T extends string>({
    allValues,
    selectedValue,
    onSelect,
    title,
}: SingleValueSelectorProps<T>) => (
    <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">{title}</span>
        <Select value={selectedValue} onValueChange={onSelect}>
            <SelectTrigger className="w-[140px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56">
                {allValues.map((value) => (
                    <SelectItem key={value} value={value}>
                        {value}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);
