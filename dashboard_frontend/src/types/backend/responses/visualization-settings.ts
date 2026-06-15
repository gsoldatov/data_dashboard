import { z } from "zod";

export const isPublishedEntry = z.object({
    is_published: z.boolean(),
});

/** Response from GET /api/visualization-settings/?settings=...&slugs=... */
export const batchVisualizationSettingsSchema = z.record(z.string(), isPublishedEntry);

export type BatchVisualizationSettingsResponse = z.infer<typeof batchVisualizationSettingsSchema>;
