import { Fragment } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/common/shadcn-ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/common/shadcn-ui/dropdown-menu";

import type { HierarchyItem } from "./util";

export interface BreadcrumbLevel {
    label: string;
    depth: number;
    items: HierarchyItem[];
}

export interface HierarchyBreadcrumbProps {
    levels: BreadcrumbLevel[];
    selectedItems: string[];
    onToggle: (code: string) => void;
}

/** Breadcrumb with one dropdown trigger per hierarchy level. Empty selection = all. */
export const HierarchyBreadcrumb = ({
    levels,
    selectedItems,
    onToggle,
}: HierarchyBreadcrumbProps) => (
    <Breadcrumb>
        <BreadcrumbList>
            {levels.map((level, i) => (
                <Fragment key={level.depth}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="text-sm text-foreground hover:text-accent transition-colors">
                                {level.label}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="start" className="max-h-56">
                                {level.items.map((item) => (
                                    <DropdownMenuCheckboxItem
                                        key={item.number}
                                        checked={selectedItems.includes(item.number)}
                                        onCheckedChange={() => onToggle(item.number)}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {item.number} {item.name}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </BreadcrumbItem>
                </Fragment>
            ))}
        </BreadcrumbList>
    </Breadcrumb>
);
