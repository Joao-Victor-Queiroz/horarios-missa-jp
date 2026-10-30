import { Suspense } from "react";
import Link from "next/link";
import { Spinner } from "@heroui/react";
import { ChurchForm, getChurchByIdAction } from "@/src/features/churches";
import { PageTitle } from "@/src/components/Title";



interface ChurchEditPageProps {
  params: Promise<{ id: string }>;
}


async function ChurchEditContent({ params }: ChurchEditPageProps) {
  const { id } = await params;
  const church = await getChurchByIdAction(id);

  if (!church.success || !church.data) {
    return (
      <div className="p-6 text-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
        <p className="text-red-600 dark:text-red-400 font-medium">Paróquia não encontrada.</p>
      </div>
    );
  }

  return <ChurchForm mode="EDIT" initialValues={church.data} />;
}


function ChurchEditSkeleton() {
    
  return (
    <div className="w-full max-w-3xl mx-auto p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col items-center justify-center min-h-[400px] space-y-3 shadow-sm">
      <Spinner size="lg" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
        Carregando dados da paróquia...
      </p>
    </div>
  );
}


export default async function EditChurchPage({ params }: ChurchEditPageProps) {

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-6">
       
        <div className="space-y-2">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Início
            </Link>
            <span>/</span>
            <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Administração
            </Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Editar</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <PageTitle title="Edição de Paróquia" />
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              ← Voltar para lista
            </Link>
          </div>
        </div>


        <Suspense fallback={<ChurchEditSkeleton />}>
          <ChurchEditContent params={params}/>
        </Suspense>
      </div>
    </div>
  );
}