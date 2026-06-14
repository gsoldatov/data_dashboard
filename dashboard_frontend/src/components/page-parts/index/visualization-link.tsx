import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";


interface VisualizationLinkProps {
    slug: string;
    title: string;
}

/** Linked chart icon + title for a single visualization on the index page. */
export const VisualizationLink = ({ slug, title }: VisualizationLinkProps) => (
    <Link
        to={`/visualizations/${slug}`}
        className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
    >
        <BarChart3 className="size-5 shrink-0 text-muted-foreground" />
        <span className="font-medium">{title}</span>
    </Link>
);
