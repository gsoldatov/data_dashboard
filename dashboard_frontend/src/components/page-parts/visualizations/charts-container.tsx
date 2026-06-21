interface ChartsContainerProps {
    children: React.ReactNode;
}

/** Responsive flex container for chart components.
 *  Stacks children vertically on small screens, places them side-by-side on large screens. */
export const ChartsContainer = ({ children }: ChartsContainerProps) => (
    <div className="flex flex-col lg:flex-row gap-4 w-full [&>*]:flex-1 [&>*]:min-w-0">{children}</div>
);
