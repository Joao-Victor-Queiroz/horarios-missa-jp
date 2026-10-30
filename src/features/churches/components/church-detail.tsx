import React from 'react';
import Link from 'next/link';
import type { Church } from '../types';

interface ChurchDetailProps {
  church: Church;
}

export function ChurchDetail({ church }: ChurchDetailProps) {
  const formattedDate = church.createdAt
    ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date(church.createdAt))
    : 'Data não disponível';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${church.latitude},${church.longitude}`;
  const instagramUrl = church.instagram
    ? `https://instagram.com/${church.instagram.replace(/^@/, '')}`
    : null;

  return (
    <div className="space-y-6">
      {/* Card Principal de Informações */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
        {/* Cabeçalho do Card */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {church.neighborhood}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {church.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <span>🗺️</span>
                <span>Abrir no Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Detalhes Divididos em Seções */}
        <div className="p-6 space-y-6">
          {/* Seção 1: Identificação */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              Identificação & Redes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Nome Oficial</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{church.name}</span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Identificador (Slug)</span>
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded font-mono border border-zinc-200 dark:border-zinc-700">
                  {church.slug}
                </code>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Instagram</span>
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    @{church.instagram?.replace(/^@/, '')}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500 italic">Não informado</span>
                )}
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Data de Cadastro</span>
                <span className="text-zinc-700 dark:text-zinc-300">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Seção 2: Localização */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              Localização & Endereço
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Bairro</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{church.neighborhood}</span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Coordenadas (GPS)</span>
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  Lat: {church.latitude} | Lng: {church.longitude}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Endereço Completo</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5 leading-relaxed">
                  {church.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Navegação */}
        <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            ← Voltar para lista de paróquias
          </Link>

          <Link
            href="/admin/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
          >
            <span>+</span>
            <span>Cadastrar Nova Paróquia</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

