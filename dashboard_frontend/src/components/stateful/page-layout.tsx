import { Navbar } from "@/components/stateful/navbar";
import { cn } from "@/styles/utils";

/**
 * App shell: renders the top navbar and a centered content area.
 * Page content is passed via the `children` prop.
 */
export const PageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main
                className={cn(
                    // Center horizontally
                    "mx-auto",
                    // 100 % stacked, 80 % fullscreen, capped at 1536 (1920 * 0.8)px
                    "w-full lg:w-4/5 lg:max-w-[1536px]",
                    // Inner padding
                    "px-4 py-8",
                    // Separate direct children
                    "[&>:not(:last-child)]:mb-4",
                )}
            >
                {children}
            </main>
        </div>
    );
};
