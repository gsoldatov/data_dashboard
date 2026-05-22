import { Link } from "react-router-dom";
import type { PageInfo } from "@/types";

/**
 * TODO: Replace hardcoded page list with GET /api/pages.
 */
const PAGES: PageInfo[] = [
    { slug: "russia_state_budget", title: "Russia State Budget", is_published: true },
];

export const Feed = () => {
    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Dashboard Pages</h1>
            {PAGES.length === 0 ? (
                <p className="text-muted-foreground">No pages available.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {PAGES.filter((p) => p.is_published).map((page) => (
                        <li key={page.slug}>
                            <Link
                                to={`/page/${page.slug}`}
                                className="block rounded-lg border p-4 hover:bg-accent transition-colors"
                            >
                                <h2 className="font-medium">{page.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    /page/{page.slug}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
