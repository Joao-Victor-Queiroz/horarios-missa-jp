import type { Church, NewChurch } from "@/src/db/schema";
import type { ChurchFormData } from "../schemas/church-schema";

export type { Church, NewChurch, ChurchFormData };

export type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

