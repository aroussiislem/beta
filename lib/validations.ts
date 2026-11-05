import { z } from "zod";

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
  .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre");

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: passwordSchema,
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "CLIENT", "ACCOUNTANT"]),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: passwordSchema,
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "CLIENT", "ACCOUNTANT"]),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .optional(),
  email: z.string().email("Adresse email invalide").optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  role: z
    .enum(["ADMIN", "MANAGER", "DEVELOPER", "CLIENT", "ACCOUNTANT"])
    .optional(),
  isActive: z.boolean().optional(),
});

// Ticket schemas
export const createTicketSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  complexity: z
    .enum(["SIMPLE", "MEDIUM", "COMPLEX", "VERY_COMPLEX"])
    .default("SIMPLE"),
  estimatedHours: z.number().positive().optional(),
  hourlyRate: z.number().positive().default(50),
});

export const updateTicketSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .optional(),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z
    .enum([
      "NEW",
      "ASSIGNED",
      "IN_PROGRESS",
      "PENDING",
      "RESOLVED",
      "CLOSED",
      "REOPENED",
    ])
    .optional(),
  complexity: z
    .enum(["SIMPLE", "MEDIUM", "COMPLEX", "VERY_COMPLEX"])
    .optional(),
  estimatedHours: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().min(1, "Un développeur doit être sélectionné"),
});

export const changeStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "PENDING",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
  ]),
});

// Timer schemas
export const startTimerSchema = z.object({
  notes: z.string().optional(),
});

export const stopTimerSchema = z.object({
  timerSessionId: z.string().min(1, "L'ID de la session est requis"),
});

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Le commentaire ne peut pas être vide"),
  isInternal: z.boolean().default(false),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
