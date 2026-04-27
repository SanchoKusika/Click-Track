import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assessmentsControllerAssignIntern,
  assessmentsControllerCreate,
  assessmentsControllerListMentorInterns,
  assessmentsControllerMentorInternDetail,
} from '@shared/api/generated_api';
import { customInstance } from '@shared/api/api-instance';
import type {
  CreateAssessmentPayload,
  MentorAllInternListItem,
  MentorInternDetail,
  MentorInternListItem,
} from './types';
import type { Paginated, PaginationParams } from '@shared/api/pagination';

export function useMentorInternsQuery() {
  return useQuery({
    queryKey: ['mentor-interns'],
    queryFn: async () => (await assessmentsControllerListMentorInterns()) as MentorInternListItem[],
  });
}

export function useMentorInternDetailQuery(internId: string) {
  return useQuery({
    queryKey: ['mentor-intern-detail', internId],
    queryFn: async () => (await assessmentsControllerMentorInternDetail(internId)) as MentorInternDetail,
    enabled: Boolean(internId),
  });
}

export function useCreateAssessmentMutation(internId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAssessmentPayload) => assessmentsControllerCreate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mentor-interns'] });
      await queryClient.invalidateQueries({ queryKey: ['mentor-intern-detail', internId] });
      await queryClient.invalidateQueries({ queryKey: ['my-assessments'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
export function useAllInternsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['all-interns', params.page ?? 1, params.pageSize ?? 20],
    queryFn: () =>
      customInstance<Paginated<MentorAllInternListItem>>({
        method: 'GET',
        url: '/assessments/mentor/interns/all',
        params,
      }),
  });
}

export function useAssignInternMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (internId: string) => assessmentsControllerAssignIntern(internId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['all-interns'] });
      await queryClient.invalidateQueries({ queryKey: ['mentor-interns'] });
    },
  });
}
