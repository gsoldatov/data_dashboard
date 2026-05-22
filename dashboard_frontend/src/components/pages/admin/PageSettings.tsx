import { type FormEvent, useState } from "react";
import { useUpsertPageSettingsMutation } from "@/store/api/pageSettings";

export const AdminPageSettings = () => {
    const [upsert, { isLoading, error }] = useUpsertPageSettingsMutation();
    const [slug, setSlug] = useState("");
    const [isPublished, setIsPublished] = useState(true);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        try {
            await upsert({ slug, body: { is_published: isPublished } }).unwrap();
            setMessage(`Page "${slug}" updated: ${isPublished ? "published" : "unpublished"}.`);
            setSlug("");
        } catch {
            // Error handled via RTK Query
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="mb-6 text-2xl font-semibold">Admin: Page Settings</h1>

            <section className="mb-8 rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-medium">Set Page Publish Status</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    Enter a page slug (e.g. &quot;russia_state_budget&quot;) to update
                    its publish status. Pages default to published if not configured.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="page-slug" className="text-sm font-medium">
                            Page Slug
                        </label>
                        <input
                            id="page-slug"
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
                {error && (
                    <p className="mt-2 text-sm text-destructive">
                        {"data" in error
                            ? (error.data as { detail?: string })?.detail ?? "Update failed"
                            : "Update failed"}
                    </p>
                )}
            </section>

            {message && (
                <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
            )}
        </div>
    );
};
