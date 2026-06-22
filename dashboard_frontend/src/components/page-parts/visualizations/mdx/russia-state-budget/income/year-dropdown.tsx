import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/common/shadcn-ui/dropdown-menu";

export interface YearDropdownProps {
    allYears: number[];
    selectedYears: number[];
    onToggle: (year: number) => void;
}

/** Dropdown with checkboxes for selecting years. Empty selection = all years. */
export const YearDropdown = ({ allYears, selectedYears, onToggle }: YearDropdownProps) => (
    <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
            Years
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-56">
            {allYears.map((year) => (
                <DropdownMenuCheckboxItem
                    key={year}
                    checked={selectedYears.length === 0 || selectedYears.includes(year)}
                    onCheckedChange={() => onToggle(year)}
                    onSelect={(e) => e.preventDefault()}
                >
                    {year}
                </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);
