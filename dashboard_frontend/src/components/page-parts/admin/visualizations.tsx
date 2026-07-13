import { useState } from "react";
import { useUpsertVisualizationSettingsMutation } from "@/store/backend-api-slices/visualization-settings";
import { Switch } from "@/components/common/shadcn-ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/common/shadcn-ui/table";
import { Input } from "@/components/common/shadcn-ui/input";
import { Paginator } from "@/components/common/paginator";
import type { VisualizationInfo } from "@/types/visualization-settings";
import type { BatchVisualizationSettingsResponse } from "@/types/backend/responses/visualization-settings";

interface PublishedToggleProps {
    slug: string;
    isPublished: boolean;
}

const PublishedToggle = ({ slug, isPublished }: PublishedToggleProps) => {
    const [upsert, { isLoading }] = useUpsertVisualizationSettingsMutation();
    const [checked, setChecked] = useState(isPublished);

    const handleToggle = async () => {
        if (isLoading) return;
        const next = !checked;
        setChecked(next);
        try {
            await upsert({ slug, body: { is_published: next } }).unwrap();
        } catch {
            setChecked(!next);
        }
    };

    return (
        <Switch
            checked={checked}
            onCheckedChange={handleToggle}
            disabled={isLoading}
        />
    );
};


interface VisualizationsTableProps {
    visualizations: VisualizationInfo[];
    settings: BatchVisualizationSettingsResponse;
}

const VisualizationsTable = ({ visualizations, settings }: VisualizationsTableProps) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Is Published</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {visualizations.map((viz) => (
                <TableRow key={viz.slug}>
                    <TableCell>{viz.title}</TableCell>
                    <TableCell>
                        <PublishedToggle
                            slug={viz.slug}
                            isPublished={
                                settings[viz.slug]?.is_published ?? false
                            }
                        />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);


interface AdminVisualizationsContentProps {
    settings: BatchVisualizationSettingsResponse;
    visualizations?: VisualizationInfo[];
}

export const AdminVisualizationsContent = ({ settings, visualizations = VISUALIZATIONS }: AdminVisualizationsContentProps) => {
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);

    const lowerFilter = filter.toLowerCase();
    const filtered = visualizations.filter((viz) =>
        viz.title.toLowerCase().includes(lowerFilter),
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_VISUALIZATIONS_PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = filtered.slice((safePage - 1) * ADMIN_VISUALIZATIONS_PAGE_SIZE, safePage * ADMIN_VISUALIZATIONS_PAGE_SIZE);

    const handleFilterChange = (value: string) => {
        setFilter(value);
        setPage(1);
    };

    return (
        <>
            <Input
                type="text"
                placeholder="Filter by title…"
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="mb-4 max-w-sm"
            />
            <VisualizationsTable
                visualizations={pageItems}
                settings={settings}
            />
            <Paginator
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </>
    );
};


// Re-exported here so the page component can import from a single place;
// the constant originates from @/util/constants.
import { VISUALIZATIONS, ADMIN_VISUALIZATIONS_PAGE_SIZE } from "@/util/constants";
