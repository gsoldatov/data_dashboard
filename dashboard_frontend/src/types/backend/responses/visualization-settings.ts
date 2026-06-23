import { z } from "zod";

export const isPublishedEntry = z.object({
    is_published: z.boolean(),
});

/** Schema for a single visualization's settings (GET /{slug}, PUT /{slug}). */
export const visualizationSettingsResponseSchema = isPublishedEntry.extend({
    slug: z.string(),
});
export type VisualizationSettingsResponse = z.infer<typeof visualizationSettingsResponseSchema>;

/** Response from GET /api/visualization-settings/?settings=...&slugs=... */
export const batchVisualizationSettingsSchema = z.record(z.string(), isPublishedEntry);

export type BatchVisualizationSettingsResponse = z.infer<typeof batchVisualizationSettingsSchema>;
