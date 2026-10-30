import { z } from 'zod';

export const scheduleTypeEnumSchema = z.enum(['missa', 'adoracao', 'confissao']);

// Formato de hora HH:MM (00:00 a 23:59)
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleItemSchema = z.object({
  id: z.string().uuid().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z
    .string()
    .trim()
    .regex(timeRegex, { message: 'Horário de início inválido (use o formato HH:MM).' }),
  endTime: z
    .string()
    .trim()
    .regex(timeRegex, { message: 'Horário de término inválido (use o formato HH:MM).' })
    .optional()
    .or(z.literal('')),
  type: scheduleTypeEnumSchema,
  notes: z
    .string()
    .trim()
    .max(255, 'Observações devem ter no máximo 255 caracteres.')
    .optional()
    .or(z.literal('')),
});

export const daySchedulesSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  schedules: z.array(scheduleItemSchema),
});

export const churchSchedulesFormSchema = z.object({
  days: z.array(daySchedulesSchema),
});

export type ScheduleItemFormData = z.infer<typeof scheduleItemSchema>;
export type DaySchedulesFormData = z.infer<typeof daySchedulesSchema>;
export type ChurchSchedulesFormData = z.infer<typeof churchSchedulesFormSchema>;

