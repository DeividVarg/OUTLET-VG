import { z } from 'zod'

export const productoSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category_id: z.string().uuid('categoria requerida'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  state: z.enum(['avaible', 'not available']).default('not available'),
  images: z
    .array(z.string().optional())
    .min(1, 'Debe haber al menos 1 imagen')
    .max(5, 'No puede haber más de 5 imágenes'),
  createdAt: z.date().optional(),
})

export const updateProductoSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').optional(),
  description: z.string().min(1, 'La descripción es obligatoria').optional(),
  category_id: z.string().uuid('La categoría debe ser un UUID').optional(),
  price: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val.trim() === '') return undefined
      const parsed = Number(val)
      if (isNaN(parsed)) return val
      return parsed
    }
    return val
  }, z.number().min(0, 'El precio debe ser mayor o igual a 0').optional()),
  state: z.enum(['avaible', 'not available']).optional(),
  imagesToDelete: z.array(z.number().int().positive()).optional(),
  images: z
    .array(z.string().optional())
    .max(5, 'No puede haber más de 5 imágenes')
    .optional(),
})
