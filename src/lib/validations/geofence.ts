import { z } from 'zod';

export const GeofenceSchema = z.object({
  name: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(10).max(5000), // 10m a 5km
});

export type GeofenceInput = z.infer<typeof GeofenceSchema>;
