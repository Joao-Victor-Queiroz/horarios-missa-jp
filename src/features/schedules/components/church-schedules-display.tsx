import Link from 'next/link';
import type { Schedule } from '../types';
import { DAYS_OF_WEEK, SCHEDULE_TYPE_LABELS, type ScheduleType } from '../types';
import { normalizeTimeHHMM } from '../utils/time';

interface ChurchSchedulesDisplayProps {
  churchId: string;
  schedules: Schedule[];
}

const TYPE_BADGE_CLASSES: Record<ScheduleType, string> = {
  missa: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50',
  adoracao:
    'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50',
  confissao:
    'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50',
};

function formatTime(timeVal?: string | null): string {
  if (!timeVal) return '';
  return normalizeTimeHHMM(timeVal);
}

export function ChurchSchedulesDisplay({ churchId, schedules }: ChurchSchedulesDisplayProps) {
  const hasAnySchedule = schedules.length > 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
      {/* Cabeçalho */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🕐</span>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Horários de Celebração
          </h2>
          {hasAnySchedule && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {schedules.length} {schedules.length === 1 ? 'horário' : 'horários'}
            </span>
          )}
        </div>
        <Link
          href={`/admin/${churchId}/schedules`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span>Gerenciar Horários</span>
        </Link>
      </div>

      {/* Corpo */}
      <div className="p-5">
        {!hasAnySchedule ? (
          <div className="text-center py-8 px-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              Nenhum horário de celebração cadastrado.
            </p>
            <Link
              href={`/admin/${churchId}/schedules`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              + Adicionar Horários
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DAYS_OF_WEEK.map(({ dayOfWeek, name, shortName }) => {
              const daySchedules = schedules.filter((s) => s.dayOfWeek === dayOfWeek);

              if (daySchedules.length === 0) return null;

              return (
                <div
                  key={dayOfWeek}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40 overflow-hidden"
                >
                  {/* Cabeçalho do dia */}
                  <div className="px-3 py-2 bg-zinc-100/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-semibold uppercase tracking-wider  dark:text-zinc-400">
                      <span className="sm:hidden">{shortName}</span>
                      <span className="hidden sm:inline">{name}</span>
                    </span>
                  </div>

                  {/* Lista de horários do dia */}
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {daySchedules.map((schedule) => {
                      const type = schedule.type as ScheduleType;
                      const startTime = formatTime(schedule.startTime);
                      const endTime = formatTime(schedule.endTime);

                      return (
                        <li key={schedule.id} className="px-3 py-2.5 flex items-start gap-2.5">
                          {/* Horário */}
                          <div className="shrink-0 min-w-16">
                            <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                              {startTime}
                            </span>
                            {endTime && (
                              <span className="text-xs text-zinc-800 dark:text-zinc-500 block">
                                até {endTime}
                              </span>
                            )}
                          </div>

                          {/* Tipo e notas */}
                          <div className="flex flex-col gap-1 min-w-0">
                            <span
                              className={`self-start text-[11px] px-2 py-0.5 rounded-full font-semibold ${TYPE_BADGE_CLASSES[type]}`}
                            >
                              {SCHEDULE_TYPE_LABELS[type]}
                            </span>
                            {schedule.notes && (
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight truncate max-w-40">
                                {schedule.notes}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

