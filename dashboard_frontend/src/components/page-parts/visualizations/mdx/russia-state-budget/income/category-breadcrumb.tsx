import { Fragment } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/common/shadcn-ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/common/shadcn-ui/dropdown-menu";

import type { CategoryInfo } from "./category-hierarchy";

export interface BreadcrumbLevel {
    label: string;
    depth: number;
    categories: CategoryInfo[];
}

export interface CategoryBreadcrumbProps {
    levels: BreadcrumbLevel[];
    selectedCategories: string[];
    onToggle: (code: string) => void;
}

/** Breadcrumb with one dropdown trigger per hierarchy level. Empty selection = all at that level. */
export const CategoryBreadcrumb = ({
    levels,
    selectedCategories,
    onToggle,
}: CategoryBreadcrumbProps) => (
    <Breadcrumb>
        <BreadcrumbList>
            {levels.map((level, i) => (
                <Fragment key={level.depth}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                        {level.categories.length === 0 ? (
                            <BreadcrumbPage>{level.label}</BreadcrumbPage>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="text-sm hover:text-foreground transition-colors">
                                    {level.label}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="max-h-56">
                                    {level.categories.map((cat) => {
                                        const checked =
                                            selectedCategories.length === 0 ||
                                            selectedCategories.includes(cat.code);
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={cat.code}
                                                checked={checked}
                                                onCheckedChange={() => onToggle(cat.code)}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {cat.code} {cat.name}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </BreadcrumbItem>
                </Fragment>
            ))}
        </BreadcrumbList>
    </Breadcrumb>
);
