import type { Schedule, NewSchedule } from '@/src/db/schema';
import type { ActionResponse } from '@/src/features/churches/types';
import type {
  ScheduleItemFormData,
  DaySchedulesFormData,
  ChurchSchedulesFormData,
} from '../schemas/schedule-schema';

export type {
  Schedule,
  NewSchedule,
  ActionResponse,
  ScheduleItemFormData,
  DaySchedulesFormData,
  ChurchSchedulesFormData,
};

export type ScheduleType = 'missa' | 'adoracao' | 'confissao';

export interface DayOfWeekInfo {
  dayOfWeek: number;
  name: string;
  shortName: string;
}

export const DAYS_OF_WEEK: DayOfWeekInfo[] = [
  { dayOfWeek: 0, name: 'Domingo', shortName: 'Dom' },
  { dayOfWeek: 1, name: 'Segunda-feira', shortName: 'Seg' },
  { dayOfWeek: 2, name: 'Terça-feira', shortName: 'Ter' },
  { dayOfWeek: 3, name: 'Quarta-feira', shortName: 'Qua' },
  { dayOfWeek: 4, name: 'Quinta-feira', shortName: 'Qui' },
  { dayOfWeek: 5, name: 'Sexta-feira', shortName: 'Sex' },
  { dayOfWeek: 6, name: 'Sábado', shortName: 'Sáb' },
];

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  missa: 'Missa',
  adoracao: 'Adoração',
  confissao: 'Confissão',
};

