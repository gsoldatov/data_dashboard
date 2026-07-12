import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/common/shadcn-ui/dropdown-menu";

export interface AttributeDropdownProps {
    allValues: number[];
    selectedValues: number[];
    onToggle: (value: number) => void;
    prompt: string;
}

/** Dropdown with checkboxes for selecting attribute values. Empty selection = all values. */
export const AttributeDropdown = ({ allValues, selectedValues, onToggle, prompt }: AttributeDropdownProps) => (
    <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
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
