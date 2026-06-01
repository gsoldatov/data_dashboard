interface ErrorProps {
    message: string;
}

/** Placeholder displayed when a visualization encounters an error. */
export const Error = ({ message }: ErrorProps) => (
    <p className="text-destructive">{message}</p>
);
