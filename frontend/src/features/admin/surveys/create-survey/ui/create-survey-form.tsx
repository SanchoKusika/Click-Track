import { type ChangeEvent, type SyntheticEvent, useState } from 'react';
import { useCreateSurveyMutation } from '@entities/surveys';
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
import styles from '../../../styles.module.css';

type QuestionDraft = { title: string };
type SurveyTarget = 'MENTOR' | 'INTERN';

type FormState = {
  title: string;
  target: SurveyTarget;
  questions: QuestionDraft[];
};

const EMPTY_FORM: FormState = {
  title: '',
  target: 'MENTOR',
  questions: [{ title: '' }],
};

export function CreateSurveyForm() {
  const { t } = useTranslation();
  const createSurvey = useCreateSurveyMutation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [titleError, setTitleError] = useState('');

  function addQuestion() {
    setForm(prev => ({ ...prev, questions: [...prev.questions, { title: '' }] }));
  }

  function removeQuestion(index: number) {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  }

  function setQuestionTitle(index: number, value: string) {
    setForm(prev => {
      const questions = [...prev.questions];
      questions[index] = { title: value };
      return { ...prev, questions };
    });
  }

  function handleTargetChange(value: SurveyTarget) {
    setForm(prev => ({ ...prev, target: value }));
  }

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setTitleError(t('admin.surveys.createForm.titleRequired'));
      return;
    }
    if (form.questions.some(q => !q.title.trim())) {
      return;
    }

    void createSurvey
      .mutateAsync({
        title: form.title.trim(),
        target: form.target,
        questions: form.questions.map((q, i) => ({ title: q.title.trim(), order: i })),
      })
      .then(() => setForm(EMPTY_FORM));
  }

  return (
    <Card className={styles.glassCard} radius="xl">
      <CardContent className="p-6">
        <form className={styles.form} onSubmit={handleSubmit}>
          <TextField fullWidth isInvalid={!!titleError}>
            <Label className={styles.labelText}>{t('admin.surveys.createForm.surveyTitle')}</Label>
            <InputGroup aria-label={t('admin.surveys.createForm.surveyTitle')} fullWidth>
              <InputGroup.Input
                value={form.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setForm(prev => ({ ...prev, title: e.target.value }));
                  setTitleError('');
                }}
              />
            </InputGroup>
            <FieldError>{titleError}</FieldError>
          </TextField>

          <div className={styles.fieldLabel}>
            <span className={styles.labelText}>{t('admin.surveys.createForm.targetRole')}</span>
            <Select
              aria-label={t('admin.surveys.createForm.targetRole')}
              value={form.target}
              onChange={(value: string | null) => handleTargetChange((value ?? 'MENTOR') as SurveyTarget)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label={t('admin.surveys.createForm.targetRole')}>
                  <ListBox.Item id="MENTOR" textValue={t('admin.surveys.list.mentor')}>
                    {t('admin.surveys.list.mentor')}
                  </ListBox.Item>
                  <ListBox.Item id="INTERN" textValue={t('admin.surveys.list.intern')}>
                    {t('admin.surveys.list.intern')}
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <div className="space-y-3">
            <span className={styles.labelText}>{t('admin.surveys.createForm.criteria')}</span>
            {form.questions.map((q, i) => (
              <div className="flex gap-2 items-start" key={i}>
                <TextField fullWidth isInvalid={!q.title.trim() && createSurvey.isPending}>
                  <InputGroup aria-label={t('admin.surveys.createForm.criterion', { count: i + 1 })} fullWidth>
                    <InputGroup.Input
                      placeholder={t('admin.surveys.createForm.criterion', { count: i + 1 })}
                      value={q.title}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestionTitle(i, e.target.value)}
                    />
                  </InputGroup>
                  <FieldError>
                    {!q.title.trim() && createSurvey.isPending ? t('admin.surveys.createForm.required') : ''}
                  </FieldError>
                </TextField>
                {form.questions.length > 1 ? (
                  <Button
                    isIconOnly
                    aria-label={t('admin.surveys.createForm.removeCriterion')}
                    radius="lg"
                    size="sm"
                    variant="ghost"
                    onPress={() => removeQuestion(i)}
                  >
                    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </Button>
                ) : null}
              </div>
            ))}
            <Button radius="lg" size="sm" variant="outline" onPress={addQuestion}>
              {t('admin.surveys.createForm.addCriterion')}
            </Button>
          </div>

          {createSurvey.error ? (
            <PanelState
              description={createSurvey.error.message}
              title={t('admin.surveys.createForm.errorTitle')}
              tone="danger"
            />
          ) : null}

          <Button fullWidth isPending={createSurvey.isPending} radius="lg" size="lg" type="submit" variant="primary">
            {t('admin.surveys.createForm.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
