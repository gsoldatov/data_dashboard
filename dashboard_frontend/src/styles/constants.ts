/**
 * Default vertical rhythm for block-flow containers.
 * Applies 1rem (mb-4) bottom margin to every non-last direct child.
 *
 * Defined in global.css @layer components with :where() for 0,0,0 specificity,
 * so explicit Tailwind mb-* utilities on children always override.
 */
export const FLOW_SPACING = "flow-spacing";
