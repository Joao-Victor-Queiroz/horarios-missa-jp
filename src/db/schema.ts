import { pgTable, uuid, varchar, text, decimal, integer, time, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import {defineRelations } from 'drizzle-orm';

// 1. Enum para os tipos de compromisso
export const scheduleTypeEnum = pgEnum('schedule_type', [
  'missa',
  'adoracao',
  'confissao',
]);

// 2. Tabela de Igrejas
export const churches = pgTable('churches', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  neighborhood: varchar('neighborhood', { length: 100 }).notNull(),
  address: text('address').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  instagram: varchar('instagram', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  
});

// 3. Tabela de Horários
export const schedules = pgTable('schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => churches.id, { onDelete: 'cascade' }),
  type: scheduleTypeEnum('type').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startTime: time('start_time').notNull(),    // Formato "HH:MM:SS"
  endTime: time('end_time'),                  // Formato "HH:MM:SS" (opcional)
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const relations = defineRelations({ churches, schedules }, (r) => ({
    schedules: {
     church: r.one.churches({
        from: r.schedules.churchId,
        to: r.churches.id,
     })
    },
    churches: {
        schedules: r.many.schedules(),
    }
}))


export type Church = typeof churches.$inferSelect;
export type NewChurch = typeof churches.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;