import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminControllerCreateUser,
  adminControllerDeleteUser,
  adminControllerListMentors,
  adminControllerListUsers,
  adminControllerUpdateUser,
} from '@shared/api/generated_api';
import { useTranslation } from 'react-i18next';
import { toast } from '@shared/ui/heroui';
import type { AdminUser, MentorOption, UserFormValues, UserUpdateValues } from './types';

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await adminControllerListUsers()) as AdminUser[],
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
