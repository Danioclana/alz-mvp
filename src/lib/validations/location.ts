import { z } from 'zod';

export const LocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be >= -90')
    .max(90, 'Latitude must be <= 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be >= -180')
    .max(180, 'Longitude must be <= 180'),
  timestamp: z
    .number()
    .int()
    .positive('Timestamp must be positive'),
  batteryLevel: z
    .number()
    .min(0, 'Battery must be >= 0')
    .max(100, 'Battery must be <= 100')
    .optional(),
});

export type LocationInput = z.infer<typeof LocationSchema>;
