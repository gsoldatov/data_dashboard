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

import type { HierarchyInfo } from "./util";

export interface BreadcrumbLevel {
    label: string;
    depth: number;
    categories: HierarchyInfo[];
}

export interface HierarchyBreadcrumbProps {
    levels: BreadcrumbLevel[];
    selectedCategories: string[];
    onToggle: (code: string) => void;
}

/** Breadcrumb with one dropdown trigger per hierarchy level. Empty selection = all. */
export const HierarchyBreadcrumb = ({
    levels,
    selectedCategories,
    onToggle,
}: HierarchyBreadcrumbProps) => (
    <Breadcrumb>
        <BreadcrumbList>
            {levels.map((level, i) => (
                <Fragment key={level.depth}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="text-sm hover:text-foreground transition-colors">
                                {level.label}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="start" className="max-h-56">
                                {level.categories.map((cat) => (
                                    <DropdownMenuCheckboxItem
                                        key={cat.number}
                                        checked={selectedCategories.includes(cat.number)}
                                        onCheckedChange={() => onToggle(cat.number)}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {cat.number} {cat.name}
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
