import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Envelope, Eye, EyeSlash } from '@gravity-ui/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentUser } from '@entities/session';
import { Button, Card, CardContent, FieldError, InputGroup, Label, TextField } from '@shared/ui/heroui';
import { useTranslation } from 'react-i18next';
import { createLoginFormSchema, type LoginFormValues } from '../model/login-form.schema';
import { useLoginSubmit } from '../model/use-login-submit';
import { LoginCardHeader } from './login-card-header';
import { LoginFooter } from './login-footer';

import styles from './styles.module.css';

export function LoginForm() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const { loginMutation, submit } = useLoginSubmit();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const schema = createLoginFormSchema(t);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className={styles.container}>
      <Card className={styles.card} radius="xl">
        <LoginCardHeader />

        <CardContent className={styles.cardContent}>
          {currentUser ? <div className={styles.sessionAlert}>{t('auth.login.activeSession')}</div> : null}

          <form className={styles.form} onSubmit={form.handleSubmit(submit)}>
            <TextField fullWidth isInvalid={!!form.formState.errors.email}>
              <Label className={styles.label}>{t('auth.login.emailLabel')}</Label>
              <InputGroup aria-label={t('auth.login.emailLabel')} fullWidth>
                <InputGroup.Input
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  {...form.register('email')}
                />
                <InputGroup.Suffix>
                  <Envelope className="size-4 text-muted" />
                </InputGroup.Suffix>
              </InputGroup>
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </TextField>

            <TextField fullWidth isInvalid={!!form.formState.errors.password}>
              <Label className={styles.label}>{t('auth.login.passwordLabel')}</Label>
              <InputGroup aria-label={t('auth.login.passwordLabel')} fullWidth>
                <InputGroup.Input
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('auth.login.passwordPlaceholder')}
                  {...form.register('password')}
                />
                <InputGroup.Suffix className="pr-0">
                  <Button
                    isIconOnly
                    aria-label={passwordVisible ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                    size="sm"
                    variant="ghost"
                    onPress={() => setPasswordVisible(v => !v)}
                  >
                    {passwordVisible ? <Eye className="size-4" /> : <EyeSlash className="size-4" />}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </TextField>

            {loginMutation.error ? <div className={styles.errorAlert}>{loginMutation.error.message}</div> : null}

            <Button
              className={styles.submitButton}
              fullWidth
              isLoading={loginMutation.isPending}
              radius="lg"
              type="submit"
              variant="primary"
            >
              {loginMutation.isPending ? t('auth.login.submitLoading') : t('auth.login.submit')}
            </Button>
          </form>

          <div className={styles.divider} />

          <LoginFooter />
        </CardContent>
      </Card>
    </div>
  );
}
