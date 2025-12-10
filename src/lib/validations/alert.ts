import { z } from 'zod';

export const AlertConfigSchema = z.object({
  alertsEnabled: z.boolean(),
  recipientEmails: z.array(z.string().refine((val) => val.includes('@') || val.startsWith('phone:'), {
    message: "Must be a valid email or phone number"
  })),
  // recipientPhones é aceito na API mas não é salvo no banco (os telefones vão em recipientEmails com prefixo phone:)
  recipientPhones: z.array(z.string()).optional(),
  alertFrequencyMinutes: z.number().int().min(5).max(120),
});

export type AlertConfigInput = z.infer<typeof AlertConfigSchema>;
