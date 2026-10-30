'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@heroui/react';
import {
  churchSchedulesFormSchema,
  type ChurchSchedulesFormData,
} from '../schemas/schedule-schema';
import { saveChurchSchedulesAction} from '../actions/schedule-actions';
import { normalizeTimeHHMM } from '../utils/time';
import { ScheduleDayField } from './schedule-day-field';
import { DAYS_OF_WEEK } from '../types';
import type { Schedule } from '../types';

interface ScheduleFormProps {
  churchId: string;
  initialSchedules: Schedule[];
}

function buildInitialFormData(schedules: Schedule[]): ChurchSchedulesFormData {
  return {
    days: DAYS_OF_WEEK.map(({ dayOfWeek }) => ({
      dayOfWeek,
      schedules: schedules
        .filter((s) => s.dayOfWeek === dayOfWeek)
        .map((s) => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          startTime: normalizeTimeHHMM(s.startTime),
          endTime: normalizeTimeHHMM(s.endTime) || '',
          type: s.type as 'missa' | 'adoracao' | 'confissao',
          notes: s.notes ?? '',
        })),
    })),
  };
}

export function ScheduleForm({ churchId, initialSchedules }: ScheduleFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChurchSchedulesFormData>({
    resolver: zodResolver(churchSchedulesFormSchema),
    defaultValues: buildInitialFormData(initialSchedules),
  });

  const onSubmit = (data: ChurchSchedulesFormData) => {
    startTransition(async () => {
      const result = await saveChurchSchedulesAction(churchId, data);

      if (result.success) {
        toast.success(result.message, { timeout: 4000 });
      } else {
        toast.danger(result.message || 'Erro ao salvar horários.', { timeout: 5000 });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {DAYS_OF_WEEK.map((dayInfo, dayIndex) => (
        <ScheduleDayField
          key={dayInfo.dayOfWeek}
          control={control}
          register={register}
          errors={errors}
          dayIndex={dayIndex}
          dayInfo={dayInfo}
          disabled={isPending}
        />
      ))}

      {/* Rodapé com botão de salvar */}
      <div className="sticky bottom-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800 px-0 py-4 flex items-center justify-end gap-3 z-10">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex-1">
          Os horários anteriores serão substituídos ao salvar.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Salvar Horários</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

