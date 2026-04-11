import { z } from 'zod';

type Translator = (key: string, options?: Record<string, unknown>) => string;

export const createLoginFormSchema = (t: Translator) =>
  z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
    password: z.string().min(6, t('auth.validation.passwordMin', { count: 6 })),
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;
