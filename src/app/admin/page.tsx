import { ChurchForm } from "@/src/features/churches";
import { PageTitle } from "@/src/components/Title";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabeçalho de Navegação / Título */}
        <div className="space-y-1">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Início
            </Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Administração</span>
          </div>
          <PageTitle title="Cadastrar Nova Paróquia" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Cadastre os dados da paróquia para permitir a busca de horários de missas e localização em João Pessoa.
          </p>
        </div>

        {/* Formulário Principal da Feature */}
        <ChurchForm />
      </div>
    </div>
  );
}
