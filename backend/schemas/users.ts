import { z } from 'zod'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

export const RegisterSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'el nombre debe tener minimo 2 caracteres')
      .max(50, 'el nombre no puede tener mas de 50 caracteres'),
    last_name: z
      .string()
      .min(2, 'el apellido debe tener minimo 2 caracteres')
      .max(50, 'el apellido es muy largo intente otra vez'),
    email: z
      .string()
      .email('el email no es valido')
      .max(255, 'el email muy largo intente otra vez '),
    password: z
      .string()
      .min(8, 'la contraseña debe tener minimo 8 caracteres')
      .regex(passwordRegex),
    role: z.enum(['admin', 'employee', 'customer']).default('employee'),
  }),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
