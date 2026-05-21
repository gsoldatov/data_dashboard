import { useParams } from "react-router-dom";
import { useGetPageDataQuery } from "@/store/api/pageData";
import { useGetPageSettingsQuery } from "@/store/api/pageSettings";
import { useAppSelector, selectIsAdmin } from "@/store";

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const isAdmin = useAppSelector(selectIsAdmin);
  const { data: settings } = useGetPageSettingsQuery(slug!, {
    skip: !isAdmin,
  });
  const { data, isLoading, error } = useGetPageDataQuery(slug!, {
    skip: !slug,
  });

  if (!slug) {
    return <p className="text-muted-foreground">No page specified.</p>;
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (error) {
    const detail =
      "data" in error
        ? (error.data as { detail?: string })?.detail ?? "Failed to load page"
        : "Failed to load page";
    return <p className="text-destructive">{detail}</p>;
  }

  const isHidden = !isAdmin && settings && !settings.is_published;

  if (isHidden) {
    return <p className="text-muted-foreground">Page not found.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">
        {slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </h1>
      {data ? (
        <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-muted-foreground">No data available.</p>
      )}
    </div>
  );
}
