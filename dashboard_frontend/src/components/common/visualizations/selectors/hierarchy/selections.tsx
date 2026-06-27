import { Eraser } from "lucide-react";
import { Badge } from "@/components/common/shadcn-ui/badge";

import type { HierarchyItem } from "./util";

export interface HierarchySelectionsProps {
    badgeGroups: { depth: number; items: HierarchyItem[] }[];
    onClearLevel: (depth: number) => void;
    onDeselect: (code: string) => void;
}

/** Selected hierarchy items displayed as badge rows, one per hierarchy depth, each with a clear-level button. */
export const HierarchySelections = ({
    badgeGroups,
    onClearLevel,
    onDeselect,
}: HierarchySelectionsProps) => (
    <>
        {badgeGroups.map(({ depth, items }) => (
            <div key={depth} className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onClearLevel(depth)}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                    aria-label={`Clear level ${depth} items`}
                >
                    <Eraser className="h-4 w-4" />
                </button>
                <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                        <Badge
                            key={item.number}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => onDeselect(item.number)}
                        >
                            {item.number} {item.name}
                        </Badge>
                    ))}
                </div>
            </div>
        ))}
    </>
);
