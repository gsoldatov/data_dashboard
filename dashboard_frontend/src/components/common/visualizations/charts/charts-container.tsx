interface ChartsContainerProps {
    children: React.ReactNode;
    dataTestID?: string;
}

/** Responsive flex container for chart components.
 *  Stacks children vertically on small screens, places them side-by-side on large screens.
 */
export const ChartsContainer = ({ children, dataTestID }: ChartsContainerProps) => (
    <div className="flex flex-col lg:flex-row gap-4 w-full mb-4 [&>*]:flex-1 [&>*]:min-w-0" data-testid={dataTestID}>{children}</div>
);
