// TODO review if types are used and move them to more specific files
export interface VisualizationSettingsResponse {
  slug: string;
  is_published: boolean;
}

export interface VisualizationSettingsUpsert {
  is_published: boolean;
}

/** TODO: replace with actual API response when GET /api/visualizations is available */
export interface VisualizationInfo {
  slug: string;
  title: string;
  is_published: boolean;
}
