import { Eraser } from "lucide-react";
import { Badge } from "@/components/common/shadcn-ui/badge";

import type { HierarchyInfo } from "./util";

export interface HierarchySelectionsProps {
    badgeGroups: { depth: number; categories: HierarchyInfo[] }[];
    onClearLevel: (depth: number) => void;
    onDeselect: (code: string) => void;
}

/** Selected categories displayed as badge rows, one per hierarchy depth, each with a clear-level button. */
export const HierarchySelections = ({
    badgeGroups,
    onClearLevel,
    onDeselect,
}: HierarchySelectionsProps) => (
    <>
        {badgeGroups.map(({ depth, categories }) => (
            <div key={depth} className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onClearLevel(depth)}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                    aria-label={`Clear level ${depth} categories`}
                >
                    <Eraser className="h-4 w-4" />
                </button>
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                        <Badge
                            key={cat.number}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => onDeselect(cat.number)}
                        >
                            {cat.number} {cat.name}
                        </Badge>
                    ))}
                </div>
            </div>
        ))}
    </>
);
