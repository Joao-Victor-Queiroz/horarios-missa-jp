/**
 * Converte um texto em um slug amigável para URLs.
 * Ex: "Paróquia São Pedro Pescador" -> "paroquia-sao-pedro-pescador"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas de acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres não alfanuméricos exceto espaços e hífens
    .replace(/[\s_]+/g, "-") // Substitui espaços e underscores por hífen
    .replace(/-+/g, "-") // Substitui múltiplos hífens por um único hífen
    .replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
}

