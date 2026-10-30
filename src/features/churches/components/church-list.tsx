'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Church } from '../types';

interface ChurchListProps {
  churches: Church[];
}

/**
 * Remove acentos e converte para minúsculas para facilitar a busca.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function ChurchList({ churches }: ChurchListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra as paróquias por nome e bairro usando useState
  const filteredChurches = useMemo(() => {
    const query = normalizeText(searchTerm.trim());
    if (!query) return churches;

    return churches.filter((church) => {
      const name = normalizeText(church.name || '');
      const neighborhood = normalizeText(church.neighborhood || '');
      return name.includes(query) || neighborhood.includes(query);
    });
  }, [churches, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Barra de Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
              />
            </svg>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou bairro..."
            className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors shadow-xs"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title="Limpar busca"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1 flex items-center gap-1.5 self-end sm:self-center">
          <span>
            {filteredChurches.length}{' '}
            {filteredChurches.length === 1 ? 'paróquia encontrada' : 'paróquias encontradas'}
          </span>
          {searchTerm && (
            <span className="text-zinc-400 dark:text-zinc-600">
              (de {churches.length})
            </span>
          )}
        </div>
      </div>

      {/* Lista de Paróquias */}
      {filteredChurches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredChurches.map((church) => (
            <Link
              key={church.id}
              href={`/admin/${church.id}`}
              className="group block p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  {/* Nome da Paróquia */}
                  <h3 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {church.name}
                  </h3>

                  {/* Bairro */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    <svg
                      className="w-4 h-4 shrink-0 text-zinc-400 group-hover:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="truncate font-medium">{church.neighborhood}</span>
                  </div>
                </div>

                {/* Seta indicativa de clique */}
                <div className="text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Estado Vazio */
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center bg-white/50 dark:bg-zinc-900/50">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          {searchTerm ? (
            <div className="space-y-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Nenhuma paróquia encontrada
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Não encontramos nenhuma paróquia correspondente a &quot;{searchTerm}&quot;. Tente outro termo de busca.
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Nenhuma paróquia cadastrada ainda
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Comece cadastrando a primeira paróquia para disponibilizar os horários de missas em João Pessoa.
              </p>
              <div>
                <Link
                  href="/admin/register"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  <span>+</span>
                  <span>Cadastrar Paróquia</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

