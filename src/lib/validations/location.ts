import { z } from 'zod';

// Preprocessor para corrigir coordenadas do iPhone
const preprocessCoordinate = (val: unknown): number => {
  const num = Number(val);

  // Se o número for muito grande (formato do iPhone sem decimal)
  // O iPhone envia coordenadas como inteiros multiplicados por 10^14
  if (Math.abs(num) > 1000) {
    // Detecta quantas casas decimais foram "movidas"
    const magnitude = Math.floor(Math.log10(Math.abs(num)));
    const divisor = Math.pow(10, magnitude - 1);
    return num / divisor;
  }

  return num;
};

// Preprocessor para timestamp - aceita ISO string ou Unix timestamp
const preprocessTimestamp = (val: unknown): number => {
  if (typeof val === 'string') {
    // Se for string ISO, converte para Unix timestamp em segundos
    return Math.floor(new Date(val).getTime() / 1000);
  }
  return Number(val);
};

export const LocationSchema = z.object({
  latitude: z.preprocess(
    preprocessCoordinate,
    z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90')
  ),
  longitude: z.preprocess(
    preprocessCoordinate,
    z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180')
  ),
  timestamp: z.preprocess(
    preprocessTimestamp,
    z.number().int().positive('Timestamp must be positive')
  ),
  batteryLevel: z.coerce
    .number()
    .min(0, 'Battery must be >= 0')
    .max(100, 'Battery must be <= 100')
    .optional(),
});

export type LocationInput = z.infer<typeof LocationSchema>;
