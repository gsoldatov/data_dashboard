import { Navbar } from "@/components/stateful/navbar";

/**
 * App shell: renders the top navbar and a centered content area.
 * Page content is passed via the `children` prop.
 */
export const PageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-8">
                {children}
            </main>
        </div>
    );
};
