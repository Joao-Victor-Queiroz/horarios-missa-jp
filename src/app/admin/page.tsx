import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { PageTitle } from "@/src/components/Title";
import { ChurchList, getChurchesAction } from "@/src/features/churches";

function ChurchListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full" />
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
          >
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-md w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function ChurchListContent() {
  await connection();
  const response = await getChurchesAction();
  const churches = response.data || [];

  return (
    <>
      {!response.success && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-800 dark:text-red-300">
          {response.message || 'Não foi possível carregar as paróquias no momento.'}
        </div>
      )}

      <ChurchList churches={churches} />
    </>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho de Navegação / Título */}
        <div className="space-y-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Início
            </Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Administração</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <PageTitle title="Paróquias" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Gerencie as paróquias cadastradas na arquidiocese e consulte seus horários e localização.
              </p>
            </div>

            <Link
              href="/admin/register"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nova Paróquia</span>
            </Link>
          </div>
        </div>

        {/* Componente com Suspense para Streaming e Partial Prerendering */}
        <Suspense fallback={<ChurchListSkeleton />}>
          <ChurchListContent />
        </Suspense>
      </div>
    </div>
  );
}
