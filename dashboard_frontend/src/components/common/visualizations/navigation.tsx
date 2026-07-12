import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface VisualizationPageNavigationProps {
    children: ReactNode;
}

/** Flex container for visualization page navigation items. */
export const VisualizationPageNavigation = ({
    children,
}: VisualizationPageNavigationProps) => (
    <nav
        aria-label="Visualization pages"
        className="flex flex-wrap gap-x-4 gap-y-1 mb-6"
    >
        {children}
    </nav>
);

interface VisualizationPageNavigationItemProps {
    link: string;
    linkText: string;
}

/**
 * A single navigation item.
 *
 * Renders as a blue underlined link when inactive and as bold plain text
 * when the current URL matches `link`.
 */
export const VisualizationPageNavigationItem = ({
    link,
    linkText,
}: VisualizationPageNavigationItemProps) => {
    const { pathname } = useLocation();

    if (pathname === link) {
        return <span className="font-bold truncate">{linkText}</span>;
    }

    return (
        <Link
            to={link}
            className="underline truncate"
        >
            {linkText}
        </Link>
    );
};
