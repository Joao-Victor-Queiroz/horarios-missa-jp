import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { PageTitle } from '@/src/components/Title';
import { getChurchByIdAction, ChurchDetail } from '@/src/features/churches';
import { getChurchSchedulesAction } from '@/src/features/schedules';

interface ChurchDetailPageProps {
  params: Promise<{ id: string }>;
}

function ChurchDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48" />
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-72" />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
        </div>
      </div>
    </div>
  );
}

async function ChurchDetailContent({ params }: ChurchDetailPageProps) {
  await connection();
  const { id } = await params;
  const [response, schedulesResponse] = await Promise.all([
    getChurchByIdAction(id),
    getChurchSchedulesAction(id),
  ]);

  if (!response.success || !response.data) {
    return (
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Administração
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Não Encontrada</span>
        </div>

        <div className="rounded-xl border border-dashed border-red-300 dark:border-red-900/60 p-8 sm:p-12 text-center bg-white dark:bg-zinc-900">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Paróquia não encontrada
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
            {response.message || 'Não encontramos nenhuma paróquia com o identificador fornecido.'}
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            ← Voltar para lista de paróquias
          </Link>
        </div>
      </div>
    );
  }

  const church = response.data;
  const schedules = schedulesResponse.data ?? [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Navegação / Breadcrumb */}
      <div className="space-y-2">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium flex-wrap">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Administração
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-xs">
            {church.name}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <PageTitle title={church.name} />
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors shrink-0"
          >
            ← Voltar para lista
          </Link>
        </div>
      </div>

      {/* Detalhes da Paróquia */}
      <ChurchDetail church={church} schedules={schedules} />
    </div>
  );
}

export default function ChurchDetailPage({ params }: ChurchDetailPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<ChurchDetailSkeleton />}>
          <ChurchDetailContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
