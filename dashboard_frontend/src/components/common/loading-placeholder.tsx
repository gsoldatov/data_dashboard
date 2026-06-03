import { Loader2 } from "lucide-react";


/** Centered spinner with text, displayed while content loads. */
export const LoadingPlaceholder = () => (
    <div className="min-h-40 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Loading...</span>
    </div>
);
