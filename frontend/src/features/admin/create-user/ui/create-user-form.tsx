import { type ChangeEvent, type SyntheticEvent, useState } from 'react';
import { Envelope, Eye, EyeSlash } from '@gravity-ui/icons';
import { useCreateUserMutation, useMentorOptionsQuery } from '@entities/admin';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  CardContent,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextField,
} from '@shared/ui/heroui';
import { PanelState } from '@shared/ui/panel-state';

import styles from '../../styles.module.css';

type CreateUserFormState = {
  email: string;
  fullName: string;
  password: string;
  role: 'ADMIN' | 'MENTOR' | 'INTERN';
  mentorId: string;
};

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
};

const EMPTY_FORM: CreateUserFormState = {
  email: '',
  fullName: '',
  password: '',
  role: 'INTERN',
  mentorId: '',
};

export function CreateUserForm() {
  const { t } = useTranslation();
  const createUser = useCreateUserMutation();
  const mentors = useMentorOptionsQuery();
  const [formState, setFormState] = useState<CreateUserFormState>(EMPTY_FORM);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const mentorOptions = mentors.data ?? [];

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formState.fullName.trim()) next.fullName = t('admin.createForm.validation.fullNameRequired');
    if (!formState.email.trim()) next.email = t('admin.createForm.validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email))
      next.email = t('admin.createForm.validation.emailInvalid');
    if (!formState.password) next.password = t('admin.createForm.validation.passwordRequired');
    else if (formState.password.length < 8) next.password = t('admin.createForm.validation.passwordMin');
    setErrors(next);

    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    if (!validate()) return;
    void createUser
      .mutateAsync({
        email: formState.email,
        fullName: formState.fullName,
        password: formState.password,
        role: formState.role,
        mentorId: formState.role === 'INTERN' ? formState.mentorId : undefined,
      })
      .then(() => {
        setFormState(EMPTY_FORM);
        setErrors({});
      });
  }

  function handleRoleChange(value: CreateUserFormState['role']) {
    setFormState(prev => ({ ...prev, role: value, mentorId: value === 'INTERN' ? prev.mentorId : '' }));
  }

  return (
    <Card className={styles.glassCard} radius="xl">
      <CardContent className="p-6">
        <form className={styles.form} onSubmit={handleSubmit}>
          <TextField fullWidth isInvalid={!!errors.fullName}>
            <Label className={styles.labelText}>{t('admin.createForm.fullName')}</Label>
            <InputGroup aria-label={t('admin.createForm.fullName')} fullWidth>
              <InputGroup.Input
                value={formState.fullName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setFormState(prev => ({ ...prev, fullName: event.target.value }));
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                }}
              />
            </InputGroup>
            <FieldError>{errors.fullName}</FieldError>
          </TextField>

          <TextField fullWidth isInvalid={!!errors.email}>
            <Label className={styles.labelText}>{t('admin.createForm.email')}</Label>
            <InputGroup aria-label={t('admin.createForm.email')} fullWidth>
              <InputGroup.Input
                type="email"
                value={formState.email}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setFormState(prev => ({ ...prev, email: event.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
              />
              <InputGroup.Suffix>
                <Envelope className="size-4 text-muted" />
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{errors.email}</FieldError>
          </TextField>

          <TextField fullWidth isInvalid={!!errors.password}>
            <Label className={styles.labelText}>{t('admin.createForm.password')}</Label>
            <InputGroup aria-label={t('admin.createForm.password')} fullWidth>
              <InputGroup.Input
                type={passwordVisible ? 'text' : 'password'}
                value={formState.password}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setFormState(prev => ({ ...prev, password: event.target.value }));
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
              />
              <InputGroup.Suffix className="pr-0">
                <Button
                  isIconOnly
                  aria-label={passwordVisible ? t('admin.createForm.hidePassword') : t('admin.createForm.showPassword')}
                  size="sm"
                  variant="ghost"
                  onPress={() => setPasswordVisible(v => !v)}
                >
                  {passwordVisible ? <Eye className="size-4" /> : <EyeSlash className="size-4" />}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{errors.password}</FieldError>
          </TextField>

          <div className={styles.fieldLabel}>
            <span className={styles.labelText}>{t('admin.common.role')}</span>
            <Select
              aria-label={t('admin.common.role')}
              value={formState.role}
              onChange={(value: string | null) => handleRoleChange((value ?? 'INTERN') as CreateUserFormState['role'])}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label={t('admin.common.role')}>
                  <ListBox.Item id="INTERN" textValue={t('roles.byCode.INTERN')}>
                    {t('roles.byCode.INTERN')}
                  </ListBox.Item>
                  <ListBox.Item id="MENTOR" textValue={t('roles.byCode.MENTOR')}>
                    {t('roles.byCode.MENTOR')}
                  </ListBox.Item>
                  <ListBox.Item id="ADMIN" textValue={t('roles.byCode.ADMIN')}>
                    {t('roles.byCode.ADMIN')}
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {formState.role === 'INTERN' ? (
            <div className={styles.fieldLabel}>
              <span className={styles.labelText}>{t('admin.common.assignedMentor')}</span>
              <Select
                aria-label={t('admin.common.assignedMentor')}
                value={formState.mentorId || null}
                onChange={(value: string | null) =>
                  setFormState(prev => ({ ...prev, mentorId: value ? String(value) : '' }))
                }
              >
                <Select.Trigger>
                  <Select.Value>{formState.mentorId ? undefined : t('admin.common.selectMentor')}</Select.Value>
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox aria-label={t('admin.common.assignedMentor')}>
                    {mentorOptions.map(mentor => (
                      <ListBox.Item key={mentor.id} id={mentor.id} textValue={`${mentor.fullName} (${mentor.email})`}>
                        {mentor.fullName} ({mentor.email})
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          ) : null}

          {createUser.error ? (
            <PanelState description={createUser.error.message} title={t('admin.createForm.errorTitle')} tone="danger" />
          ) : null}

          <Button fullWidth isPending={createUser.isPending} radius="lg" size="lg" type="submit" variant="primary">
            {t('admin.createForm.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
