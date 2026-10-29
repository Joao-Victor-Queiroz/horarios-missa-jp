import { z } from "zod";

export const churchSchema = z.object({
  name: z
    .string()
    .min(3, "O nome da paróquia deve ter pelo menos 3 caracteres")
    .max(255, "O nome não pode exceder 255 caracteres"),
  slug: z
    .string()
    .min(3, "O slug deve ter pelo menos 3 caracteres")
    .max(255, "O slug não pode exceder 255 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido. Use apenas letras minúsculas, números e hífens (ex: paroquia-santo-antonio)"
    ),
  neighborhood: z
    .string()
    .min(2, "Informe o bairro da paróquia")
    .max(100, "O bairro não pode exceder 100 caracteres"),
  address: z
    .string()
    .min(5, "Informe o endereço completo da paróquia (logradouro, número, etc.)")
    .max(500, "O endereço é muito longo"),
  latitude: z
    .string()
    .min(1, "Informe a latitude da paróquia")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      },
      { message: "A latitude deve ser um número decimal válido entre -90 e 90 (ex: -7.115320)" }
    ),
  longitude: z
    .string()
    .min(1, "Informe a longitude da paróquia")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      },
      { message: "A longitude deve ser um número decimal válido entre -180 e 180 (ex: -34.861000)" }
    ),
  instagram: z
    .string()
    .max(100, "O Instagram não pode exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ChurchFormData = z.infer<typeof churchSchema>;

