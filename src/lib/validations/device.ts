import { z } from 'zod';

export const DeviceSchema = z.object({
  hardwareId: z
    .string()
    .min(1, 'Hardware ID is required')
    .max(100, 'Hardware ID too long'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long'),
  patientName: z
    .string()
    .min(1, 'Patient name is required')
    .max(255, 'Patient name too long'),
});

export type DeviceInput = z.infer<typeof DeviceSchema>;
