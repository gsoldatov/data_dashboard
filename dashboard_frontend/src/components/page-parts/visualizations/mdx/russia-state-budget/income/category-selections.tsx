import { Eraser } from "lucide-react";
import { Badge } from "@/components/common/shadcn-ui/badge";

import type { CategoryInfo } from "./category-hierarchy";

export interface CategorySelectionsProps {
    badgeGroups: { depth: number; categories: CategoryInfo[] }[];
    onClearLevel: (depth: number) => void;
    onDeselect: (code: string) => void;
}

/** Selected categories displayed as badge rows, one per hierarchy depth, each with a clear-level button. */
export const CategorySelections = ({
    badgeGroups,
    onClearLevel,
    onDeselect,
}: CategorySelectionsProps) => (
    <>
        {badgeGroups.map(({ depth, categories }) => (
            <div key={depth} className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onClearLevel(depth)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Clear level ${depth} categories`}
                >
                    <Eraser className="h-4 w-4" />
                </button>
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                        <Badge
                            key={cat.code}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => onDeselect(cat.code)}
                        >
                            {cat.code} {cat.name}
                        </Badge>
                    ))}
                </div>
            </div>
        ))}
    </>
);
