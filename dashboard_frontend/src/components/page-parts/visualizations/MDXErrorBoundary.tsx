import { Component, type ReactNode } from "react";
import { ErrorPlaceholder } from "./ErrorPlaceholder";

interface MDXErrorBoundaryProps {
    children: ReactNode;
}

interface MDXErrorBoundaryState {
    hasError: boolean;
}

/**
 * Catches errors from lazy MDX imports and displays a not-found placeholder.
 *
 * If a dynamic MDX import fails (e.g. because no MDX file exists for the
 * requested slug) this boundary shows a user-friendly message instead of
 * crashing the application.
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
            return <ErrorPlaceholder message="Visualization not found." />;
        }

        return this.props.children;
    }
}
