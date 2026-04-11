import { memo, useState, type ChangeEvent } from 'react';
import type { AdminUser, MentorOption } from '@entities/admin';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Chip, Input, ListBox, Select } from '@shared/ui/heroui';

import styles from '../../styles.module.css';

interface UserEditCardProps {
  user: AdminUser;
  mentorOptions: MentorOption[];
  isSaving: boolean;
  isDeleting: boolean;
  onSave: (editingUser: AdminUser) => void;
  onDelete: () => void;
}

export const UserEditCard = memo(function UserEditCard({
  user,
  mentorOptions,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
}: UserEditCardProps) {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState<AdminUser>(user);

  function handleRoleChange(value: AdminUser['role']) {
    setEditingUser(prev => ({
      ...prev,
      role: value,
      internProfile: value === 'INTERN' ? (prev.internProfile ?? null) : null,
    }));
  }

  function handleMentorChange(mentorId: string) {
    setEditingUser(prev => ({
      ...prev,
      internProfile: mentorId
        ? {
            id: prev.internProfile?.id ?? '',
            mentorId,
            mentor: mentorOptions.find(m => m.id === mentorId) ?? {
              id: mentorId,
              fullName: t('admin.common.selectMentor'),
              email: '',
            },
          }
        : null,
    }));
  }

  return (
    <Card className={styles.editCard} radius="lg">
      <CardContent className="gap-4 p-5">
        <div className={styles.editCardHeader}>
          <div>
            <div className={styles.editCardTitle}>{user.fullName}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
          <Chip color="default" radius="full" variant="soft">
            {t('admin.common.editCard')}
          </Chip>
        </div>

        <div className={styles.editGrid}>
          <div className={styles.fieldLabel}>
            <span className={styles.labelText}>{t('admin.createForm.fullName')}</span>
            <div className="w-full">
              <Input
                aria-label={t('admin.createForm.fullName')}
                className="w-full"
                value={editingUser.fullName}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEditingUser(prev => ({ ...prev, fullName: event.target.value }))
                }
              />
            </div>
          </div>

          <div className={styles.fieldLabel}>
            <span className={styles.labelText}>{t('admin.createForm.email')}</span>
            <div className="w-full">
              <Input
                aria-label={t('admin.createForm.email')}
                className="w-full"
                readOnly
                value={user.email}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className={styles.fieldLabel}>
            <span className={styles.labelText}>{t('admin.common.role')}</span>
            <Select
              aria-label={t('admin.common.role')}
              value={editingUser.role}
              onChange={(value: string | null) => handleRoleChange((value ?? 'INTERN') as AdminUser['role'])}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label={t('admin.common.role')}>
                  <ListBox.Item id="INTERN" textValue={t('roles.byCode.INTERN')}>
                    {t('roles.byCode.INTERN')}
                  </ListBox.Item>
                  <ListBox.Item id="MENTOR" textValue={t('roles.byCode.MENTOR')}>
                    {t('roles.byCode.MENTOR')}
                  </ListBox.Item>
                  <ListBox.Item id="ADMIN" textValue={t('roles.byCode.ADMIN')}>
                    {t('roles.byCode.ADMIN')}
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {editingUser.role === 'INTERN' ? (
            <div className={styles.fieldLabel}>
              <span className={styles.labelText}>{t('admin.common.mentor')}</span>
              <Select
                aria-label={t('admin.common.mentor')}
                value={editingUser.internProfile?.mentorId ?? null}
                onChange={(value: string | null) => handleMentorChange(value ? String(value) : '')}
              >
                <Select.Trigger>
                  <Select.Value>
                    {editingUser.internProfile?.mentorId ? undefined : t('admin.common.selectMentor')}
                  </Select.Value>
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox aria-label={t('admin.common.mentor')}>
                    {mentorOptions.map(mentor => (
                      <ListBox.Item key={mentor.id} id={mentor.id} textValue={`${mentor.fullName} (${mentor.email})`}>
                        {mentor.fullName} ({mentor.email})
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          ) : (
            <div className={styles.fieldLabel}>
              <span className={styles.labelText}>{t('admin.common.assignedMentor')}</span>
              <div className="w-full">
                <Input
                  aria-label={t('admin.common.assignedMentor')}
                  className="w-full"
                  disabled
                  readOnly
                  value={user.internProfile?.mentor?.fullName ?? t('admin.common.notApplicable')}
                  onChange={() => {}}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.actionsRow}>
          <Button isPending={isSaving} radius="lg" variant="primary" onPress={() => onSave(editingUser)}>
            {t('admin.common.saveChanges')}
          </Button>
          <Button isPending={isDeleting} radius="lg" variant="danger" onPress={onDelete}>
            {t('admin.common.deleteUser')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
