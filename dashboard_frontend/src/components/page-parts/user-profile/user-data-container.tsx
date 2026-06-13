/** Width-limiting wrapper for profile content. */
export const UserDataContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => <div className="mx-auto max-w-sm">{children}</div>;
