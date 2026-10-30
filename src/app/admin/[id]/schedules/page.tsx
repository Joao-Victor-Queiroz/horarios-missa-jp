import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { PageTitle } from '@/src/components/Title';
import { getChurchByIdAction } from '@/src/features/churches';
import {
  getChurchSchedulesAction,
  ScheduleForm,
} from '@/src/features/schedules';

interface SchedulesPageProps {
  params: Promise<{ id: string }>;
}

function SchedulesFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
        >
          <div className="px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 h-12" />
          <div className="p-5 h-16 bg-zinc-50/30 dark:bg-zinc-950/30" />
        </div>
      ))}
    </div>
  );
}

async function SchedulesPageContent({ params }: SchedulesPageProps) {
  await connection();
  const { id } = await params;

  const [churchResponse, schedulesResponse] = await Promise.all([
    getChurchByIdAction(id),
    getChurchSchedulesAction(id),
  ]);

  if (!churchResponse.success || !churchResponse.data) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium flex-wrap">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link
            href="/admin"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Administração
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Paróquia não encontrada</span>
        </div>

        <div className="rounded-xl border border-dashed border-red-300 dark:border-red-900/60 p-8 sm:p-12 text-center bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Paróquia não encontrada
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {churchResponse.message || 'Não encontramos nenhuma paróquia com este identificador.'}
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            ← Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  const church = churchResponse.data;
  const initialSchedules = schedulesResponse.data ?? [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium flex-wrap">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link
          href="/admin"
          className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          Administração
        </Link>
        <span>/</span>
        <Link
          href={`/admin/${id}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors truncate max-w-[180px]"
        >
          {church.name}
        </Link>
        <span>/</span>
        <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Horários</span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <PageTitle title="Gerenciar Horários" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {church.name}
          </p>
        </div>
        <Link
          href={`/admin/${id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors shrink-0"
        >
          ← Voltar para paróquia
        </Link>
      </div>

      {/* Formulário */}
      <ScheduleForm churchId={id} initialSchedules={initialSchedules} />
    </div>
  );
}

export default function SchedulesPage({ params }: SchedulesPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<SchedulesFormSkeleton />}>
          <SchedulesPageContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}

