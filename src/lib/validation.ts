import * as z from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { error: "Le nom d'utilisateur doit contenir au moins 3 caractères." })
  .max(24, { error: "Le nom d'utilisateur ne peut pas dépasser 24 caractères." })
  .regex(/^[a-z0-9_-]+$/, {
    error: "Lettres minuscules, chiffres, - et _ uniquement.",
  });

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
    username: usernameSchema,
    email: z.email({ error: "Adresse email invalide." }).trim().toLowerCase(),
    password: z
      .string()
      .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
  username: usernameSchema,
});

export const updateEmailSchema = z.object({
  email: z.email({ error: "Adresse email invalide." }).trim().toLowerCase(),
  // Optional: accounts created via Google/Facebook have no password to confirm.
  currentPassword: z.string().min(1, { error: "Mot de passe actuel requis." }).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
  email: z.email({ error: "Adresse email invalide." }).trim().toLowerCase(),
  message: z
    .string()
    .trim()
    .min(10, { error: "Le message doit contenir au moins 10 caractères." })
    .max(2000, { error: "Le message ne peut pas dépasser 2000 caractères." }),
});

export const updatePasswordSchema = z
  .object({
    // Optional: accounts created via Google/Facebook have no password yet —
    // this becomes a "set a password" flow instead of "change password".
    currentPassword: z.string().min(1, { error: "Mot de passe actuel requis." }).optional(),
    newPassword: z
      .string()
      .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Adresse email invalide." }).trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const createMatchSchema = z.object({
  homeClubName: z.string().trim().min(2, { error: "Nom du club domicile requis." }),
  awayClubName: z.string().trim().min(2, { error: "Nom du club extérieur requis." }),
  competition: z.string().trim().optional(),
  venue: z.string().trim().optional(),
  kickoffAt: z.string().optional(),
});

export const statusUpdateSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "LIVE",
    "HALFTIME",
    "INTERRUPTED",
    "FINISHED",
    "POSTPONED",
    "CANCELLED",
  ]),
});

export const goalSchema = z.object({
  clubId: z.string().min(1, { error: "Sélectionne un club." }),
  scorerName: z.string().trim().optional(),
  scorerNumber: z.coerce.number().int().min(0).max(99).optional(),
  assistName: z.string().trim().optional(),
  assistNumber: z.coerce.number().int().min(0).max(99).optional(),
  minute: z.coerce.number().int().min(0).max(130).optional(),
  ownGoal: z.coerce.boolean().optional(),
  penalty: z.coerce.boolean().optional(),
});

export const cardSchema = z.object({
  clubId: z.string().min(1, { error: "Sélectionne un club." }),
  playerName: z.string().trim().optional(),
  playerNumber: z.coerce.number().int().min(0).max(99).optional(),
  minute: z.coerce.number().int().min(0).max(130).optional(),
});

export const cardEditSchema = cardSchema.extend({
  type: z.enum(["YELLOW", "RED"]),
});

export const substitutionSchema = z.object({
  clubId: z.string().min(1, { error: "Sélectionne un club." }),
  playerInName: z.string().trim().optional(),
  playerInNumber: z.coerce.number().int().min(0).max(99).optional(),
  playerOutName: z.string().trim().optional(),
  playerOutNumber: z.coerce.number().int().min(0).max(99).optional(),
  minute: z.coerce.number().int().min(0).max(130).optional(),
});

export const startMatchSchema = z.object({
  startedAt: z.string().min(1, { error: "Heure de début requise." }),
});

export const endMatchSchema = z.object({
  endedAt: z.string().min(1, { error: "Heure de fin requise." }),
});

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { error: "Le commentaire ne peut pas être vide." })
    .max(2000, { error: "Le commentaire est trop long (2000 caractères max)." }),
});

export const lineupEntrySchema = z.object({
  playerName: z.string().trim().min(1),
  number: z.coerce.number().int().min(0).max(99).optional(),
  position: z.string().trim().optional(),
  isStarting: z.coerce.boolean().optional(),
});

export const avatarSchema = z.object({
  avatar: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, { error: "Format d'image invalide." })
    .max(2_000_000, { error: "Image trop volumineuse." }),
});
