import { z } from 'zod';

export const GeofenceSchema = z.object({
  name: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().max(10000), // máximo 10km
});

export type GeofenceInput = z.infer<typeof GeofenceSchema>;
