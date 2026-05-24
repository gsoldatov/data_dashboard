interface ErrorPlaceholderProps {
    message?: string;
}

/** Placeholder displayed when a visualization encounters an error. */
export const ErrorPlaceholder = ({
    message = "Failed to load visualization.",
}: ErrorPlaceholderProps) => <p className="text-destructive">{message}</p>;
