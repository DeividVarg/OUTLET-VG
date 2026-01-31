import { z } from 'zod'

export const productoSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category_id: z.string().uuid('categoria requerida'),
  urls: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val)
      } catch {
        return [val]
      }
    }
    return val
  }, z.array(z.string())),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  state: z.enum(['available', 'not available']).default('not available'),
  images: z
    .array(z.string().optional())
    .min(1, 'Debe haber al menos 1 imagen')
    .max(5, 'No puede haber más de 5 imágenes'),
  createdAt: z.date().optional(),
})

export const updateProductoSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').optional(),
  description: z.string().min(1, 'La descripción es obligatoria').optional(),
  urls: z.preprocess((val) => {
    // Si es un string que empieza con [, intentamos parsearlo
    if (typeof val === 'string') {
      try {
        return JSON.parse(val)
      } catch {
        return [val] // Si falla el parse, lo devolvemos como array simple
      }
    }
    return val
  }, z.array(z.string())),
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
  state: z.enum(['available', 'not available']).optional(),
  imagesToDelete: z.array(z.number().int().positive()).optional(),
  images: z
    .array(z.string().optional())
    .max(5, 'No puede haber más de 5 imágenes')
    .optional(),
})

export const productByCategorySchema = z.object({
  id_category: z.string().uuid('El ID de la categoría debe ser un UUID'),
})