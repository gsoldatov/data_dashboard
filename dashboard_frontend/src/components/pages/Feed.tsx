import { Link } from "react-router-dom";
import { PageLayout } from "@/components/stateful/PageLayout";
import type { VisualizationInfo } from "@/types";

/**
 * TODO: Replace hardcoded visualization list with GET /api/visualizations.
 */
const VISUALIZATIONS: VisualizationInfo[] = [
    { slug: "russia_state_budget", title: "Russia State Budget", is_published: true },
];

export const Feed = () => {
    return (
        <PageLayout>
            <h1 className="mb-6 text-2xl font-semibold">Dashboard Visualizations</h1>
            {VISUALIZATIONS.length === 0 ? (
                <p className="text-muted-foreground">No visualizations available.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {VISUALIZATIONS.filter((v) => v.is_published).map((viz) => (
                        <li key={viz.slug}>
                            <Link
                                to={`/visualizations/${viz.slug}`}
                                className="block rounded-lg border p-4 hover:bg-accent transition-colors"
                            >
                                <h2 className="font-medium">{viz.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    /visualizations/{viz.slug}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </PageLayout>
    );
};
