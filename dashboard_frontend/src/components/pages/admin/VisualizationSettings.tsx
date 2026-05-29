import { type FormEvent, useState } from "react";
import { PageLayout } from "@/components/stateful/PageLayout";
import { useUpsertVisualizationSettingsMutation } from "@/store/backend-api-slices/visualizationSettings";
import { rtkqErrorMessage } from "@/store/util";

export const AdminVisualizationSettings = () => {
    const [upsert, { isLoading, error }] =
        useUpsertVisualizationSettingsMutation();
    const [slug, setSlug] = useState("");
    const [isPublished, setIsPublished] = useState(true);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        try {
            await upsert({
                slug,
                body: { is_published: isPublished },
            }).unwrap();
            setMessage(
                `Visualization "${slug}" updated: ${isPublished ? "published" : "unpublished"}.`
            );
            setSlug("");
        } catch {
            // Error handled via RTK Query
        }
    };

    return (
        <PageLayout>
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-2xl font-semibold">
                    Admin: Visualization Settings
                </h1>

                <section className="mb-8 rounded-lg border p-4">
                    <h2 className="mb-4 text-lg font-medium">
                        Set Visualization Publish Status
                    </h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Enter a visualization slug (e.g.
                        &quot;russia_state_budget&quot;) to update its publish
                        status. Visualizations default to published if not
                        configured.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="viz-slug"
                                className="text-sm font-medium"
                            >
                                Visualization Slug
                            </label>
                            <input
                                id="viz-slug"
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="rounded-md border px-3 py-2 text-sm"
                                placeholder="russia_state_budget"
                                required
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="h-4 w-4"
                            />
                            Published
                        </label>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </form>
                    {error ? (
                        <p className="mt-2 text-sm text-destructive">
                            {rtkqErrorMessage(error, "Update failed")}
                        </p>
                    ) : null}
                </section>

                {message && (
                    <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
                )}
            </div>
        </PageLayout>
    );
};
