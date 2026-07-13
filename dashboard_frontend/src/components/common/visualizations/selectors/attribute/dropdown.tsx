import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/common/shadcn-ui/dropdown-menu";

export interface AttributeDropdownProps<T extends string | number = number> {
    allValues: T[];
    selectedValues: T[];
    onToggle: (value: T) => void;
    prompt: string;
}

/** Dropdown with checkboxes for selecting attribute values. Empty selection = all values. */
export const AttributeDropdown = <T extends string | number = number>({ allValues, selectedValues, onToggle, prompt }: AttributeDropdownProps<T>) => (
    <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground h-fit shrink-0">
            {prompt}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" className="max-h-56">
            {allValues.map((value) => (
                <DropdownMenuCheckboxItem
                    key={value}
                    checked={selectedValues.includes(value)}
                    onCheckedChange={() => onToggle(value)}
                    onSelect={(e) => e.preventDefault()}
                >
                    {value}
                </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);
