import type { ComponentPropsWithoutRef, FC } from "react";

const MdxH1: FC<ComponentPropsWithoutRef<"h1">> = ({ className, ...props }) => (
    <h1 className={`font-bold text-3xl mb-4${className ? ` ${className}` : ""}`} {...props} />
);

const MdxH2: FC<ComponentPropsWithoutRef<"h2">> = ({ className, ...props }) => (
    <h2 className={`font-bold text-2xl mb-4${className ? ` ${className}` : ""}`} {...props} />
);

const MdxH3: FC<ComponentPropsWithoutRef<"h3">> = ({ className, ...props }) => (
    <h3 className={`font-bold text-xl mb-2${className ? ` ${className}` : ""}`} {...props} />
);

const MdxP: FC<ComponentPropsWithoutRef<"p">> = ({ className, ...props }) => (
    <p className={`text-base mb-4${className ? ` ${className}` : ""}`} {...props} />
);

/** MDX component mapping — passed to {@link import("@mdx-js/react").MDXProvider}. */
export const mdxComponents = {
    h1: MdxH1,
    h2: MdxH2,
    h3: MdxH3,
    p: MdxP,
};
