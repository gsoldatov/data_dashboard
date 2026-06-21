interface ChartTitleProps {
    children: React.ReactNode;
}

/** Reusable chart heading with consistent styling across MDX visualization pages. */
export const ChartTitle = ({ children }: ChartTitleProps) => (
    <h3 className="font-bold text-xl mt-6 mb-2">{children}</h3>
);
