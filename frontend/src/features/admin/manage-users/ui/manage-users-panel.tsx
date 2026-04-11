import { useCallback, useState } from 'react';
import {
  type AdminUser,
  useAdminUsersQuery,
  useDeleteUserMutation,
  useMentorOptionsQuery,
  useUpdateUserMutation,
} from '@entities/admin';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@shared/ui/heroui';
import { PanelState } from '@shared/ui/panel-state';
import { UserEditCard } from './user-edit-card';
import { UsersTable } from './users-table';

import styles from '../../styles.module.css';

export function ManageUsersPanel() {
  const { t } = useTranslation();
  const users = useAdminUsersQuery();
  const mentors = useMentorOptionsQuery();
  const updateUser = useUpdateUserMutation();
  const deleteUser = useDeleteUserMutation();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mentorOptions = mentors.data ?? [];
  const userList = users.data ?? [];

  const handleSave = useCallback(
    (editingUser: AdminUser) => {
      setSavingId(editingUser.id);
      void updateUser
        .mutateAsync({
          id: editingUser.id,
          payload: {
            fullName: editingUser.fullName,
            role: editingUser.role,
            mentorId: editingUser.role === 'INTERN' ? editingUser.internProfile?.mentorId : undefined,
          },
        })
        .finally(() => setSavingId(null));
    },
    [updateUser]
  );

  const handleDelete = useCallback(
    (userId: string) => {
      setDeletingId(userId);
      void deleteUser.mutateAsync(userId).finally(() => setDeletingId(null));
    },
    [deleteUser]
  );

  return (
    <Card className={styles.glassCard} radius="xl">
      <CardContent className="gap-6 p-6">
        {userList.length === 0 ? (
          <PanelState description={t('admin.users.panelEmptyDescription')} title={t('admin.users.panelEmptyTitle')} />
        ) : (
          <UsersTable users={userList} />
        )}

        <div className="space-y-4">
          {userList.map(user => (
            <UserEditCard
              key={user.id}
              isDeleting={deletingId === user.id}
              isSaving={savingId === user.id}
              mentorOptions={mentorOptions}
              user={user}
              onDelete={() => handleDelete(user.id)}
              onSave={handleSave}
            />
          ))}
        </div>

        {users.error ? (
          <PanelState description={users.error.message} title={t('admin.users.panelErrorTitle')} tone="danger" />
        ) : null}
      </CardContent>
    </Card>
  );
}
