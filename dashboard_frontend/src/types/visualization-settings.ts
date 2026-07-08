import type { ComponentType } from "react";

/** Visualizations known to the index page (slug + title). */
export interface VisualizationInfo {
  slug: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
}
