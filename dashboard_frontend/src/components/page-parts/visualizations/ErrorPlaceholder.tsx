interface ErrorPlaceholderProps {
    message: string;
}

/** Placeholder displayed when a visualization encounters an error. */
export const ErrorPlaceholder = ({
    message,
}: ErrorPlaceholderProps) => <p className="text-destructive">{message}</p>;
