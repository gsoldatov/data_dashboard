import { Component, type ReactNode } from "react";
import { ErrorPlaceholder } from "./error-placeholder";

interface MDXErrorBoundaryProps {
    children: ReactNode;
}

interface MDXErrorBoundaryState {
    hasError: boolean;
}

/**
 * Catches errors from lazy MDX imports and displays an error placeholder.
 *
 * If a dynamic MDX import fails (e.g. because a chunk fails to load or
 * the component throws during render) this boundary shows a user-friendly
 * message instead of crashing the application.
 */
export class MDXErrorBoundary extends Component<
    MDXErrorBoundaryProps,
    MDXErrorBoundaryState
> {
    constructor(props: MDXErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): MDXErrorBoundaryState {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <ErrorPlaceholder message="Failed to load the page." />;
        }

        return this.props.children;
    }
}
