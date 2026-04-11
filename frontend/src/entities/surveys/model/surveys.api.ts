import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customInstance } from '@shared/api/api-instance';
import { useTranslation } from 'react-i18next';
import { toast } from '@shared/ui/heroui';
import type { CreateSurveyPayload, MySurvey, SubmitSurveyPayload, SurveyListItem, SurveyResponseView } from './types';

export function useAdminSurveysQuery() {
  return useQuery({
    queryKey: ['admin-surveys'],
    queryFn: () => customInstance<SurveyListItem[]>({ method: 'GET', url: '/surveys' }),
  });
}

export function useCreateSurveyMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSurveyPayload) =>
      customInstance<SurveyListItem>({ method: 'POST', url: '/surveys', data: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
      toast.success(t('toasts.surveyCreated'));
    },
  });
}

export function useDeleteSurveyMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customInstance<void>({ method: 'DELETE', url: `/surveys/${id}` }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
      toast.success(t('toasts.surveyDeleted'));
    },
  });
}

export function useSurveyResponsesQuery(surveyId: string | null) {
  return useQuery({
    queryKey: ['survey-responses', surveyId],
    queryFn: () =>
      customInstance<SurveyResponseView[]>({
        method: 'GET',
        url: `/surveys/responses/${surveyId}`,
      }),
    enabled: !!surveyId,
  });
}

export function useMySurveysQuery() {
  return useQuery({
    queryKey: ['my-surveys'],
    queryFn: () => customInstance<MySurvey[]>({ method: 'GET', url: '/surveys/my' }),
  });
}

export function useMySurveyByIdQuery(id: string) {
  return useQuery({
    queryKey: ['my-surveys', id],
    queryFn: () =>
      customInstance<MySurvey[]>({ method: 'GET', url: '/surveys/my' }).then(
        list => list.find(s => s.id === id) ?? null
      ),
  });
}

export function useSubmitSurveyMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubmitSurveyPayload }) =>
      customInstance<void>({ method: 'POST', url: `/surveys/${id}/respond`, data: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-surveys'] });
      toast.success(t('toasts.surveySubmitted'));
    },
  });
}
