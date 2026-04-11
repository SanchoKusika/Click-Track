import { type CSSProperties, type SyntheticEvent, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySurveyByIdQuery, useSubmitSurveyMutation } from '@entities/surveys';
import type { MySurvey } from '@entities/surveys';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, CardHeader, Chip, Tooltip } from '@shared/ui/heroui';
import { PanelState } from '@shared/ui/panel-state';
import { RatingStars } from '@shared/ui/rating-stars';
import { APP_ROUTES } from '@shared/config/routes';

export const SURVEY_FILL_FORM_ID = 'survey-fill-form';

type FormatType = 'bold' | 'italic' | 'underline' | 'strikeThrough';

interface RichEditorProps {
  value: string;
  isInvalid?: boolean;
  placeholder?: string;
  onChange: (html: string) => void;
}

function RichEditor({ value, isInvalid, placeholder, onChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<FormatType>>(new Set());

  const updateActiveFormats = useCallback(() => {
    const formats: FormatType[] = ['bold', 'italic', 'underline', 'strikeThrough'];
    setActiveFormats(new Set(formats.filter(f => document.queryCommandState(f))));
  }, [setActiveFormats]);

  const applyFormat = (format: FormatType) => {
    editorRef.current?.focus();
    document.execCommand(format, false);
    updateActiveFormats();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const tools: { format: FormatType; label: string; style: CSSProperties }[] = [
    { format: 'bold', label: 'B', style: { fontWeight: 700 } },
    { format: 'italic', label: 'I', style: { fontStyle: 'italic' } },
    { format: 'underline', label: 'U', style: { textDecoration: 'underline' } },
    { format: 'strikeThrough', label: 'S', style: { textDecoration: 'line-through' } },
  ];

  return (
    <div
      className={`flex flex-col w-full rounded-2xl border transition-colors ${
        isInvalid
          ? 'border-danger/60 shadow-[0_0_12px_rgba(243,28,63,0.1)]'
          : 'border-(--border) hover:border-(--primary)/40 focus-within:border-(--primary) focus-within:shadow-[0_0_16px_rgba(0,112,240,0.1)]'
      } bg-(--surface)`}
    >
      <div className="flex items-center gap-1 px-3 py-2 border-b border-(--border) bg-(--bg) rounded-t-2xl">
        {tools.map(({ format, label, style }) => (
          <Tooltip key={format} content={format} delay={400} size="sm">
            <Button
              isIconOnly
              size="sm"
              variant={activeFormats.has(format) ? 'flat' : 'light'}
              color={activeFormats.has(format) ? 'primary' : 'default'}
              className="w-8 h-8 min-w-0 text-sm rounded-lg text-(--muted)"
              style={style}
              onPress={() => applyFormat(format)}
            >
              {label}
            </Button>
          </Tooltip>
        ))}
        <div className="w-px h-5 bg-(--border) mx-2" />
        <Tooltip content="Clear formatting" delay={400} size="sm">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            className="w-8 h-8 min-w-0 text-sm rounded-lg opacity-70 hover:opacity-100"
            onPress={() => {
              editorRef.current?.focus();
              document.execCommand('removeFormat', false);
              if (editorRef.current) onChange(editorRef.current.innerHTML);
              setActiveFormats(new Set());
            }}
          >
            ✕
          </Button>
        </Tooltip>
      </div>

      <div className="relative flex-1 w-full p-4">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[120px] w-full text-sm text-(--text) outline-none leading-relaxed"
          dangerouslySetInnerHTML={value ? undefined : { __html: '' }}
          onInput={e => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onSelect={updateActiveFormats}
        />
        {!value && (
          <p className="absolute top-4 left-4 text-sm text-(--muted) pointer-events-none select-none">{placeholder}</p>
        )}
      </div>
    </div>
  );
}

function SurveyForm({ survey }: { survey: MySurvey }) {
  const { t } = useTranslation();
  const submitSurvey = useSubmitSurveyMutation();
  const navigate = useNavigate();

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);

  const missingScore = (id: string) => !scores[id] || scores[id] === 0;
  const missingComment = (id: string) => {
    const text = (comments[id] ?? '').replace(/<[^>]*>/g, '').trim();
    return !text;
  };

  const completedCount = survey.questions.filter(q => !missingScore(q.id) && !missingComment(q.id)).length;

  const progressValue = Math.round((completedCount / survey.questions.length) * 100);

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setAttempted(true);

    const hasErrors = survey.questions.some(q => missingScore(q.id) || missingComment(q.id));
    if (hasErrors) return;

    const answers = survey.questions.map(q => ({
      questionId: q.id,
      score: scores[q.id],
      comment: comments[q.id] ?? '',
    }));

    void submitSurvey.mutateAsync({ id: survey.id, payload: { answers } }).then(() => navigate(APP_ROUTES.surveys));
  }

  return (
    <form className="flex flex-col gap-6 w-full" id={SURVEY_FILL_FORM_ID} onSubmit={handleSubmit}>
      <Card className="w-full border-none shadow-md bg-gradient-to-r from-default-50 to-default-100" radius="lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground">{t('surveys.fill.completionProgress')}</span>
                <span className="text-sm text-default-500 font-medium">
                  {t('surveys.fill.answeredOf', { completed: completedCount, total: survey.questions.length })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {progressValue === 100 && (
                <Chip size="md" color="success" variant="shadow" className="font-bold tracking-wide">
                  {t('surveys.fill.done')}
                </Chip>
              )}
              <Button isLoading={submitSurvey.isPending} radius="lg" size="sm" type="submit" variant="primary">
                {t('surveys.fill.submit')}
              </Button>
            </div>
          </div>
          <div className="w-full h-2.5 bg-default-200/60 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-in-out relative ${
                progressValue === 100 ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${progressValue}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {survey.questions.map((q, idx) => {
          const scoreError = attempted && missingScore(q.id);
          const commentError = attempted && missingComment(q.id);
          const hasError = scoreError || commentError;
          const isDone = !missingScore(q.id) && !missingComment(q.id);

          return (
            <Card
              key={q.id}
              className={`shadow-sm transition-all duration-300 w-full flex flex-col ${
                hasError
                  ? 'border-2 border-danger/40 bg-danger-50/10'
                  : isDone
                    ? 'border border-success/30 bg-success-50/10'
                    : 'border border-default-200 hover:shadow-md'
              }`}
              radius="lg"
            >
              <CardHeader className="flex flex-row items-center gap-4 px-6 pt-6 pb-2">
                <Chip
                  size="md"
                  variant="shadow"
                  color={hasError ? 'danger' : isDone ? 'success' : 'primary'}
                  className="min-w-[32px] h-8 text-sm font-bold shrink-0"
                >
                  {idx + 1}
                </Chip>
                <h3 className="text-lg font-semibold text-foreground leading-none m-0">{q.title}</h3>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 gap-6 px-6 pb-6 pt-4 w-full">
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-default-50/80 border border-default-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-default-600 uppercase tracking-wide">
                      {t('surveys.fill.ratingLabel')}
                    </span>
                    <span className="text-danger text-lg leading-none">*</span>
                  </div>
                  <RatingStars
                    readOnly={false}
                    size="md"
                    value={scores[q.id] ?? 0}
                    onChange={v => setScores(prev => ({ ...prev, [q.id]: v }))}
                  />
                  {scoreError && (
                    <span className="text-sm text-danger font-medium animate-appearance-in">
                      {t('surveys.fill.ratingRequired')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1 gap-3 w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-default-600 uppercase tracking-wide">
                      {t('surveys.fill.commentLabel')}
                    </span>
                    <span className="text-danger text-lg leading-none">*</span>
                  </div>
                  <RichEditor
                    isInvalid={commentError}
                    placeholder={t('surveys.fill.commentPlaceholder')}
                    value={comments[q.id] ?? ''}
                    onChange={html => setComments(prev => ({ ...prev, [q.id]: html }))}
                  />
                  {commentError && (
                    <span className="text-sm text-danger font-medium animate-appearance-in">
                      {t('surveys.fill.commentRequired')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {submitSurvey.error ? (
        <PanelState description={submitSurvey.error.message} title={t('surveys.fill.submitErrorTitle')} tone="danger" />
      ) : null}
    </form>
  );
}

export function SurveyFillForm({ surveyId }: { surveyId: string }) {
  const { t } = useTranslation();
  const { data: survey, isLoading } = useMySurveyByIdQuery(surveyId);

  if (isLoading) return <p className="text-sm text-default-400">{t('surveys.fill.loading')}</p>;

  if (!survey) {
    return (
      <PanelState
        description={t('surveys.fill.notFoundDescription')}
        title={t('surveys.fill.notFoundTitle')}
        tone="danger"
      />
    );
  }

  if (survey.isCompleted) {
    return (
      <PanelState
        description={t('surveys.fill.alreadyCompletedDescription')}
        title={t('surveys.fill.alreadyCompletedTitle')}
      />
    );
  }

  if (survey.questions.length === 0) {
    return (
      <PanelState description={t('surveys.fill.emptySurveyDescription')} title={t('surveys.fill.emptySurveyTitle')} />
    );
  }

  return <SurveyForm survey={survey} />;
}
