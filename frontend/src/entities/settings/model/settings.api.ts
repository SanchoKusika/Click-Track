import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsControllerMe } from '@shared/api/generated_api';
import { customInstance, resolveApiAssetUrl } from '@shared/api/api-instance';
import { useTranslation } from 'react-i18next';
import { toast } from '@shared/ui/heroui';
import type { MySettings, UpdateMySettingsPayload } from './types';

const SETTINGS_QUERY_KEY = ['my-settings'] as const;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function toRole(value: unknown): MySettings['role'] {
  if (value === 'ADMIN' || value === 'MENTOR' || value === 'INTERN') {
    return value;
  }

  return 'INTERN';
}

function normalizeSettings(value: unknown): MySettings {
  const input = value as Record<string, unknown>;

  return {
    id: typeof input.id === 'string' ? input.id : '',
    email: typeof input.email === 'string' ? input.email : '',
    fullName: typeof input.fullName === 'string' ? input.fullName : '',
    role: toRole(input.role),
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : '',
    phone: toNullableString(input.phone),
    photoUrl: resolveApiAssetUrl(toNullableString(input.photoUrl)),
  };
}

async function updateMySettings(payload: UpdateMySettingsPayload): Promise<MySettings> {
  const formData = new FormData();

  if (payload.phone !== undefined) {
    formData.append('phone', JSON.stringify(payload.phone));
  }

  if (payload.photo) {
    formData.append('photo', payload.photo);
  } else if (payload.removePhoto) {
    formData.append('removePhoto', 'true');
  }

  const response = await customInstance<unknown>({
    url: '/settings/me',
    method: 'PATCH',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  });

  return normalizeSettings(response);
}

export function useMySettingsQuery(enabled = true) {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => normalizeSettings(await settingsControllerMe()),
    enabled,
  });
}

export function useUpdateMySettingsMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: updateMySettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success(t('toasts.settingsUpdated'));
    },
  });
}
