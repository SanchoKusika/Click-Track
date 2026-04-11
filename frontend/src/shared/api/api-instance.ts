import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import i18n from '@shared/i18n/config';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

function getApiOrigin() {
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';

  return new URL(API_BASE_URL, appOrigin).origin;
}

export function resolveApiAssetUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  // Absolute URLs and browser-generated URLs should be used as-is.
  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized;
  }

  try {
    return new URL(normalized, `${getApiOrigin()}/`).toString();
  } catch {
    return normalized;
  }
}

apiInstance.interceptors.request.use(config => {
  const sessionRaw = localStorage.getItem('click_intern_session');

  if (!sessionRaw) {
    return config;
  }

  try {
    const session = JSON.parse(sessionRaw) as { accessToken?: string | null };

    if (session.accessToken) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${session.accessToken}`,
      } as typeof config.headers;
    }
  } catch {
    localStorage.removeItem('click_intern_session');
  }

  return config;
});

export async function customInstance<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiInstance.request<T>(config);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string | string[] }>;
    const responseMessage = axiosError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      throw new Error(responseMessage.join(', '));
    }

    if (typeof responseMessage === 'string') {
      throw new Error(responseMessage);
    }

    throw new Error(axiosError.message || i18n.t('api.requestFailed'));
  }
}
