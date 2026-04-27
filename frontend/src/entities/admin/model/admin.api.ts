import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminControllerCreateUser,
  adminControllerDeleteUser,
  adminControllerListMentors,
  adminControllerUpdateUser,
} from '@shared/api/generated_api';
import { customInstance } from '@shared/api/api-instance';
import { useTranslation } from 'react-i18next';
import { toast } from '@shared/ui/heroui';
import type { AdminUser, MentorOption, UserFormValues, UserUpdateValues } from './types';
import type { Paginated, PaginationParams } from '@shared/api/pagination';

export function useAdminUsersQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['admin-users', params.page ?? 1, params.pageSize ?? 20],
    queryFn: () =>
      customInstance<Paginated<AdminUser>>({
        method: 'GET',
        url: '/admin/users',
        params,
      }),
  });
}

export function useMentorOptionsQuery() {
  return useQuery({
    queryKey: ['admin-mentors'],
    queryFn: async () => (await adminControllerListMentors()) as MentorOption[],
  });
}

export function useCreateUserMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UserFormValues) => adminControllerCreateUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      toast.success(t('toasts.userCreated'));
    },
  });
}

export function useUpdateUserMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UserUpdateValues }) =>
      adminControllerUpdateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      toast.success(t('toasts.userUpdated'));
    },
  });
}

export function useDeleteUserMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => adminControllerDeleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      toast.success(t('toasts.userDeleted'));
    },
  });
}
