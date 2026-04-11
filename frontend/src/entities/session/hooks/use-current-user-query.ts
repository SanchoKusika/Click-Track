import { useQuery } from '@tanstack/react-query';
import { usersControllerMe } from '@shared/api/generated_api';

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: usersControllerMe,
    enabled,
    retry: false,
  });
}
