export interface UserResponse {
  id: number;
  username: string;
  role: "admin" | "viewer";
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SessionResponse {
  user_id: number;
  expires_at: string;
}

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
