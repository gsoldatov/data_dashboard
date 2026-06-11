// TODO review if types are used and move them to more specific files
export interface VisualizationSettingsResponse {
  slug: string;
  is_published: boolean;
}

export interface VisualizationSettingsUpsert {
  is_published: boolean;
}

/** Visualizations known to the feed page (slug + title). */
export interface VisualizationInfo {
  slug: string;
  title: string;
}

/** Response from GET /api/visualization-settings/?settings=...&slugs=... */
export interface BatchVisualizationSettingsResponse {
  [slug: string]: {
    is_published: boolean;
  };
}
