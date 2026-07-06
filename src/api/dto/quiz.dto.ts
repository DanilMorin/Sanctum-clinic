import { z } from 'zod';

export const telegramUserSchema = z.object({
  telegramId: z.union([z.string(), z.number()]),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const createQuizSessionSchema = z.object({
  userId: z.number().int().positive().optional(),
  telegramUser: telegramUserSchema.optional(),
});

export const updateQuizAnswersSchema = z.object({
  skinType: z.enum(['oily', 'combination', 'dry']).optional(),
  skinFeatures: z
    .array(
      z.enum([
        'acne',
        'rosacea',
        'couperose',
        'pigmentation',
        'sensitive',
        'none',
      ]),
    )
    .optional(),
  lifestyle: z.enum(['active', 'normal']).optional(),
  spfUsage: z.enum(['makeup_base', 'standalone']).optional(),
  productFormat: z.enum(['pharmacy', 'professional', 'both']).optional(),
});

export type CreateQuizSessionDto = z.infer<typeof createQuizSessionSchema>;
export type UpdateQuizAnswersDto = z.infer<typeof updateQuizAnswersSchema>;