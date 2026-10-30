'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/src';
import { churches } from '@/src/db/schema';
import { churchSchema, type ChurchFormData } from '../schemas/church-schema';
import type { ActionResponse, Church } from '../types';

/**
 * Normaliza o identificador do Instagram removendo URL completa e símbolo '@'.
 */
function normalizeInstagram(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  return trimmed
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
    .trim() || null;
}

/**
 * Cadastra uma nova paróquia no banco de dados.
 */
export async function createChurchAction(
  formData: ChurchFormData
): Promise<ActionResponse<Church>> {
  try {
    const parseResult = churchSchema.safeParse(formData);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0] || 'geral');
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = [];
        }
        fieldErrors[fieldName].push(issue.message);
      });

      return {
        success: false,
        message: 'Por favor, corrija os erros no formulário antes de enviar.',
        errors: fieldErrors,
      };
    }

    const validData = parseResult.data;
    const cleanSlug = validData.slug.toLowerCase().trim();

    // 1. Verifica se já existe uma igreja com este slug
    const existingChurch = await db
      .select({ id: churches.id })
      .from(churches)
      .where(eq(churches.slug, cleanSlug))
      .limit(1);

    if (existingChurch.length > 0) {
      return {
        success: false,
        message: `Já existe uma paróquia cadastrada com o slug "${cleanSlug}". Escolha outro identificador.`,
        errors: {
          slug: ['Este identificador já está em uso por outra paróquia.'],
        },
      };
    }

    // 2. Insere a nova igreja
    const [inserted] = await db
      .insert(churches)
      .values({
        name: validData.name.trim(),
        slug: cleanSlug,
        neighborhood: validData.neighborhood.trim(),
        address: validData.address.trim(),
        latitude: validData.latitude.trim(),
        longitude: validData.longitude.trim(),
        instagram: normalizeInstagram(validData.instagram),
      })
      .returning();

    revalidatePath('/admin');
    revalidatePath('/admin/register');
    revalidatePath('/');

    return {
      success: true,
      message: 'Paróquia cadastrada com sucesso!',
      data: inserted,
    };
  } catch (error) {
    console.error('Erro ao cadastrar paróquia:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Erro ao salvar no banco de dados: ${error.message}`
          : 'Ocorreu um erro inesperado ao cadastrar a paróquia. Tente novamente mais tarde.',
    };
  }
}

/**
 * Recupera todas as paróquias cadastradas, ordenadas por nome.
 */
export async function getChurchesAction(): Promise<ActionResponse<Church[]>> {
  try {
    const list = await db
      .select()
      .from(churches)
      .orderBy(asc(churches.name));

    return {
      success: true,
      message: 'Lista de paróquias recuperada com sucesso.',
      data: list,
    };
  } catch (error) {
    console.error('Erro ao buscar lista de paróquias:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Erro ao buscar paróquias: ${error.message}`
          : 'Erro ao buscar paróquias no banco de dados.',
      data: [],
    };
  }
}

/**
 * Recupera os dados completos de uma paróquia pelo seu ID.
 */
export async function getChurchByIdAction(
  id: string
): Promise<ActionResponse<Church>> {
  try {
    if (!id || typeof id !== 'string') {
      return {
        success: false,
        message: 'ID da paróquia inválido.',
      };
    }

    const result = await db
      .select()
      .from(churches)
      .where(eq(churches.id, id))
      .limit(1);

    if (result.length === 0) {
      return {
        success: false,
        message: 'Paróquia não encontrada.',
      };
    }

    return {
      success: true,
      message: 'Paróquia encontrada com sucesso.',
      data: result[0],
    };
  } catch (error) {
    console.error('Erro ao buscar paróquia por ID:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Erro ao carregar dados da paróquia: ${error.message}`
          : 'Erro inesperado ao consultar a paróquia.',
    };
  }
}


