import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names with conditional and conflict resolution.
 *
 * Combines `clsx` (for conditional classes: objects, arrays, falsy values)
 * with `tailwind-merge` (deduplicates conflicting Tailwind utilities — the
 * last class wins for each utility group).
 *
 * @example
 * cn("px-4 py-2", "px-6")              // => "py-2 px-6"
 * cn("base", { "conditional": flag })   // => "base conditional" (if flag)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
