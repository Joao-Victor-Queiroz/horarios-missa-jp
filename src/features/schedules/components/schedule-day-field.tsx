'use client';

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form';
import type { ChurchSchedulesFormData, DayOfWeekInfo } from '../types';

interface ScheduleDayFieldProps {
  control: Control<ChurchSchedulesFormData>;
  register: UseFormRegister<ChurchSchedulesFormData>;
  errors: FieldErrors<ChurchSchedulesFormData>;
  dayIndex: number;
  dayInfo: DayOfWeekInfo;
  disabled?: boolean;
}

export function ScheduleDayField({
  control,
  register,
  errors,
  dayIndex,
  dayInfo,
  disabled = false,
}: ScheduleDayFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${dayIndex}.schedules`,
  });

  const handleAddSchedule = () => {
    append({
      dayOfWeek: dayInfo.dayOfWeek,
      startTime: '',
      endTime: '',
      type: 'missa',
      notes: '',
    });
  };

  const dayErrors = errors.days?.[dayIndex]?.schedules;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden transition-colors">
      <div className="px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
            {dayInfo.name}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {fields.length} {fields.length === 1 ? 'horário' : 'horários'}
          </span>
        </div>

     
        <input
          type="hidden"
          {...register(`days.${dayIndex}.dayOfWeek`, { valueAsNumber: true })}
          value={dayInfo.dayOfWeek}
        />

        <button
          type="button"
          onClick={handleAddSchedule}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/50 disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Adicionar horário</span>
        </button>
      </div>

      {/* Conteúdo: Lista de Horários ou Estado Vazio */}
      <div className="p-4 sm:p-5">
        {fields.length === 0 ? (
          <div className="text-center py-5 px-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30">
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum horário cadastrado para este dia.
            </p>
            <button
              type="button"
              onClick={handleAddSchedule}
              disabled={disabled}
              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>+ Adicionar primeiro horário</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, scheduleIndex) => {
              const itemError = dayErrors?.[scheduleIndex];
              const startTimeError = itemError?.startTime?.message;

              return (
                <div
                  key={field.id}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 p-3 sm:p-4 transition-all"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    {/* Input oculto para o dayOfWeek individual */}
                    <input
                      type="hidden"
                      {...register(
                        `days.${dayIndex}.schedules.${scheduleIndex}.dayOfWeek`,
                        { valueAsNumber: true }
                      )}
                      value={dayInfo.dayOfWeek}
                    />

                    {/* 1. Tipo de Celebração */}
                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`type-${dayIndex}-${scheduleIndex}`}
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                      >
                        Tipo *
                      </label>
                      <select
                        id={`type-${dayIndex}-${scheduleIndex}`}
                        {...register(
                          `days.${dayIndex}.schedules.${scheduleIndex}.type`
                        )}
                        disabled={disabled}
                        className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        <option value="missa">Missa</option>
                        <option value="adoracao">Adoração</option>
                        <option value="confissao">Confissão</option>
                      </select>
                    </div>

                    {/* 2. Horário Início */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`startTime-${dayIndex}-${scheduleIndex}`}
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                      >
                        Início *
                      </label>
                      <input
                        id={`startTime-${dayIndex}-${scheduleIndex}`}
                        type="time"
                        {...register(
                          `days.${dayIndex}.schedules.${scheduleIndex}.startTime`
                        )}
                        disabled={disabled}
                        className={`w-full text-xs sm:text-sm px-2.5 py-2 rounded-lg border ${
                          startTimeError
                            ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                            : 'border-zinc-300 dark:border-zinc-700 focus:ring-blue-500'
                        } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-colors`}
                      />
                      {startTimeError && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">
                          {startTimeError}
                        </p>
                      )}
                    </div>

                    {/* 3. Horário Fim (Opcional) */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`endTime-${dayIndex}-${scheduleIndex}`}
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                      >
                        Término <span className="text-zinc-400 text-[10px]">(opcional)</span>
                      </label>
                      <input
                        id={`endTime-${dayIndex}-${scheduleIndex}`}
                        type="time"
                        {...register(
                          `days.${dayIndex}.schedules.${scheduleIndex}.endTime`
                        )}
                        disabled={disabled}
                        className="w-full text-xs sm:text-sm px-2.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>

                    {/* 4. Observações / Descrição */}
                    <div className="sm:col-span-4">
                      <label
                        htmlFor={`notes-${dayIndex}-${scheduleIndex}`}
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                      >
                        Observações <span className="text-zinc-400 text-[10px]">(opcional)</span>
                      </label>
                      <input
                        id={`notes-${dayIndex}-${scheduleIndex}`}
                        type="text"
                        placeholder="Ex: Missa das Crianças, Novena"
                        {...register(
                          `days.${dayIndex}.schedules.${scheduleIndex}.notes`
                        )}
                        disabled={disabled}
                        className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>

                    {/* 5. Botão Excluir */}
                    <div className="sm:col-span-1 flex items-end justify-end sm:justify-center sm:pt-6">
                      <button
                        type="button"
                        onClick={() => remove(scheduleIndex)}
                        disabled={disabled}
                        title="Excluir este horário"
                        className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                        aria-label="Excluir horário"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

