/**
 * Default vertical rhythm for block-flow containers.
 * Applies 1rem (mb-4) bottom margin to every non-last direct child.
 *
 * :where() keeps specificity at 0,1,0 — explicit Tailwind margin classes
 * (also 0,1,0) on children can override via source order.
 */
export const FLOW_SPACING = "[&>:where(:not(:last-child))]:mb-4";
