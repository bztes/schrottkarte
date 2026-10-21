import { z } from 'zod';
import { mapSourceTypes } from './types.js';

/** A map layer as it is edited on the admin page, also validates the input on the server */
export const mapLayerInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'The name is required'),
  enabled: z.boolean(),
  source: z.looseObject({ type: z.enum(mapSourceTypes) }),
  layers: z
    .array(z.looseObject({ id: z.string().min(1), type: z.string().min(1) }))
    .min(1, 'At least one style layer is required')
    .refine(
      (layers) => new Set(layers.map((l) => l.id)).size === layers.length,
      'The style layer ids must be unique',
    ),
});

export type MapLayerInput = z.infer<typeof mapLayerInput>;

/** The file written by the export on the admin page, layers from bottom to top */
export const mapLayersFile = z.object({
  version: z.literal(1),
  layers: z.array(mapLayerInput),
});

export type MapLayersFile = z.infer<typeof mapLayersFile>;

/** A readable message for the first validation issue */
export function firstIssue(error: z.ZodError) {
  const issue = error.issues[0];
  return issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message;
}
