/**
 * Normaliza o valor de horário para exibição e formulário (HH:MM).
 */
export function normalizeTimeHHMM(timeVal?: string | null): string {
  if (!timeVal) return '';
  const trimmed = timeVal.trim();
  if (trimmed.length >= 5) {
    return trimmed.slice(0, 5);
  }
  return trimmed;
}

