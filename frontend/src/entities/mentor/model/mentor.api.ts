import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assessmentsControllerAssignIntern,
  assessmentsControllerCreate,
  assessmentsControllerListAllInterns,
  assessmentsControllerListMentorInterns,
  assessmentsControllerMentorInternDetail,
} from '@shared/api/generated_api';
import type {
  CreateAssessmentPayload,
  MentorAllInternListItem,
  MentorInternDetail,
  MentorInternListItem,
} from './types';

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
export function useAllInternsQuery() {
  return useQuery({
    queryKey: ['all-interns'],
    queryFn: async () => (await assessmentsControllerListAllInterns()) as MentorAllInternListItem[],
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
