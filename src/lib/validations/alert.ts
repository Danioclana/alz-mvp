import { z } from 'zod';

export const AlertConfigSchema = z.object({
  alertsEnabled: z.boolean(),
  recipientEmails: z.array(z.string().email()),
  recipientPhones: z.array(z.string()),
  alertFrequencyMinutes: z.number().int().min(1).max(60),
});

export type AlertConfigInput = z.infer<typeof AlertConfigSchema>;
