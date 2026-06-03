import { z } from "zod";
import { id } from "zod/v4/locales";

export const CreateSubCategorySchema = z.object({
  name: z.string().min(4, "minimo 4 caracteres para el nombre"),
  id_category: z.string().uuid("La categoría debe ser un UUID"),
});

export const UpdateSubCategorySchema = z.object({
  name: z.string().min(4, "minimo 4 caracteres para el nombre").optional(),
  id_category: z.string().uuid("La categoría debe ser un UUID").optional(),
});
