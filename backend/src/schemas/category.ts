import { z } from 'zod'

export const CreateCategorySchema = z.object({
  name: z.string().min(4, 'minimo 4 caracteres para el nombre'),
  description: z.string().min(4, 'minimo 4 caracteres para la descripcion'),
})

export const UpdateCategorySchema = z.object({
  name: z.string().min(4, 'minimo 4 caracteres para el nombre').optional(),
  description: z
    .string()
    .min(4, 'minimo 4 caracteres para la descripcion')
    .optional(),
})
