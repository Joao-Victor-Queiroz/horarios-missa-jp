'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/src';
import { churches, schedules, type Schedule } from '@/src/db/schema';
import {
  churchSchedulesFormSchema,
  type ChurchSchedulesFormData,
} from '../schemas/schedule-schema';
import type { ActionResponse } from '../types';



/**
 * Busca todos os horários cadastrados para uma paróquia específica,
 * ordenados por dia da semana (0-6) e horário de início.
 */
export async function getChurchSchedulesAction(
  churchId: string
): Promise<ActionResponse<Schedule[]>> {
  try {
    if (!churchId || typeof churchId !== 'string') {
      return {
        success: false,
        message: 'ID da paróquia inválido.',
      };
    }

    const churchSchedules = await db
      .select()
      .from(schedules)
      .where(eq(schedules.churchId, churchId))
      .orderBy(asc(schedules.dayOfWeek), asc(schedules.startTime));

    return {
      success: true,
      message: 'Horários da paróquia recuperados com sucesso.',
      data: churchSchedules,
    };
  } catch (error) {
    console.error('Erro ao buscar horários da paróquia:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Erro ao buscar horários: ${error.message}`
          : 'Erro ao consultar horários no banco de dados.',
      data: [],
    };
  }
}

/**
 * Salva e sincroniza todos os horários de uma paróquia.
 * Substitui os horários anteriores daquela paróquia pelos novos horários fornecidos.
 */
export async function saveChurchSchedulesAction(
  churchId: string,
  formData: ChurchSchedulesFormData
): Promise<ActionResponse<{ count: number }>> {
  try {
    if (!churchId || typeof churchId !== 'string') {
      return {
        success: false,
        message: 'Identificador da paróquia inválido.',
      };
    }

    // Valida existência da paróquia
    const existingChurch = await db
      .select({ id: churches.id, name: churches.name })
      .from(churches)
      .where(eq(churches.id, churchId))
      .limit(1);

    if (existingChurch.length === 0) {
      return {
        success: false,
        message: 'Paróquia não encontrada.',
      };
    }

    // Validação com Zod
    const parseResult = churchSchedulesFormSchema.safeParse(formData);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path.join('.');
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = [];
        }
        fieldErrors[fieldName].push(issue.message);
      });

      return {
        success: false,
        message: 'Por favor, verifique os horários informados.',
        errors: fieldErrors,
      };
    }

    // Coleta todos os horários dos 7 dias para inserção
    const itemsToInsert: {
      churchId: string;
      type: 'missa' | 'adoracao' | 'confissao';
      dayOfWeek: number;
      startTime: string;
      endTime: string | null;
      notes: string | null;
    }[] = [];

    for (const day of parseResult.data.days) {
      for (const item of day.schedules) {
        if (!item.startTime) continue;

        // Formata para time no banco (HH:MM:SS)
        const formattedStart =
          item.startTime.length === 5 ? `${item.startTime}:00` : item.startTime;
        const formattedEnd = item.endTime
          ? item.endTime.length === 5
            ? `${item.endTime}:00`
            : item.endTime
          : null;

        itemsToInsert.push({
          churchId,
          type: item.type,
          dayOfWeek: item.dayOfWeek,
          startTime: formattedStart,
          endTime: formattedEnd,
          notes: item.notes && item.notes.trim().length > 0 ? item.notes.trim() : null,
        });
      }
    }

    // Executa a substituição dos horários
    await db.delete(schedules).where(eq(schedules.churchId, churchId));

    if (itemsToInsert.length > 0) {
      await db.insert(schedules).values(itemsToInsert);
    }

    revalidatePath(`/admin/${churchId}`);
    revalidatePath(`/admin/${churchId}/schedules`);
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message:
        itemsToInsert.length > 0
          ? `${itemsToInsert.length} horário(s) salvo(s) com sucesso!`
          : 'Horários atualizados (nenhum horário configurado).',
      data: { count: itemsToInsert.length },
    };
  } catch (error) {
    console.error('Erro ao salvar horários da paróquia:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Erro ao salvar horários: ${error.message}`
          : 'Ocorreu um erro inesperado ao salvar os horários. Tente novamente mais tarde.',
    };
  }
}

