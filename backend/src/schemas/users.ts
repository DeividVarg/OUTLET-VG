import { z } from "zod";

export const RegisterSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "el nombre debe tener minimo 2 caracteres")
        .max(50, "el nombre no puede tener mas de 50 caracteres"),
      email: z
        .string()
        .email("el email no es valido")
        .max(255, "el email muy largo intente otra vez "),
      password: z
        .string()
        .min(4, "la contraseña debe tener minimo 8 caracteres"),
      password2: z
        .string()
        .min(4, "la contraseña debe tener minimo 8 caracteres"),
      role: z.string().optional().default("user"),
      number_phone: z
        .string()
        .min(10, "el numero de telefono debe tener minimo 10 caracteres")
        .max(20, "el numero de telefono no puede tener mas de 20 caracteres"),
    })
    .refine((data) => data.password === data.password2, {
      message: "Las contraseñas no coinciden",
      path: ["password2"],
    }),
});

export const RegisterAuthSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "el nombre debe tener minimo 2 caracteres")
        .max(50, "el nombre no puede tener mas de 50 caracteres"),
      email: z
        .string()
        .email("el email no es valido")
        .max(255, "el email muy largo intente otra vez "),
      password: z
        .string()
        .min(4, "la contraseña debe tener minimo 8 caracteres"),
      password2: z
        .string()
        .min(4, "la contraseña debe tener minimo 8 caracteres"),
      role: z.enum(["admin", "employee", "user", "superAdmin"]).default("user"),
      number_phone: z
        .string()
        .min(10, "el numero de telefono debe tener minimo 10 caracteres")
        .max(20, "el numero de telefono no puede tener mas de 20 caracteres"),
    })
    .refine((data) => data.password === data.password2, {
      message: "Las contraseñas no coinciden",
      path: ["password2"],
    }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("el email no es valido"),
    password: z.string().min(4, "la contraseña debe tener minimo 8 caracteres"),
  }),
});

export const UpdateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    number_phone: z.string().min(10).max(20).optional(),
    email: z.string().email().max(255).optional(),
    role: z.enum(["admin", "employee", "user", "superAdmin"]).optional(),
  }),
});
