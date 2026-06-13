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
import type { VisualizationInfo } from "@/types";
import type { BatchVisualizationSettingsResponse } from "@/types";


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
}

export const AdminVisualizationsContent = ({ settings }: AdminVisualizationsContentProps) => {
    const [filter, setFilter] = useState("");

    const lowerFilter = filter.toLowerCase();
    const filtered = VISUALIZATIONS.filter((viz) =>
        viz.title.toLowerCase().startsWith(lowerFilter),
    );

    return (
        <>
            <Input
                type="text"
                placeholder="Filter by title…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mb-4 max-w-sm"
            />
            <VisualizationsTable
                visualizations={filtered}
                settings={settings}
            />
        </>
    );
};


// Re-exported here so the page component can import from a single place;
// the constant originates from @/util/constants.
import { VISUALIZATIONS } from "@/util/constants";
