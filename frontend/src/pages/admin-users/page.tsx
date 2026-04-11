import { useState } from 'react';
import {
  type AdminUser,
  useAdminUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useMentorOptionsQuery,
  useUpdateUserMutation,
} from '@entities/admin';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, CardHeader, Chip } from '@shared/ui/heroui';
import { PageHeader } from '@shared/ui/page-header';
import { PanelState } from '@shared/ui/panel-state';

import styles from './styles.module.css';

type CreateUserFormState = {
  email: string;
  fullName: string;
  password: string;
  role: 'ADMIN' | 'MENTOR' | 'INTERN';
  mentorId: string;
};

export function AdminUsersPage() {
  const { t } = useTranslation();
  const users = useAdminUsersQuery();
  const mentors = useMentorOptionsQuery();
  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
  const deleteUser = useDeleteUserMutation();
  const [formState, setFormState] = useState<CreateUserFormState>({
    email: '',
    fullName: '',
    password: '',
    role: 'INTERN',
    mentorId: '',
  });
  const [editingUsers, setEditingUsers] = useState<Record<string, AdminUser>>({});

  const mentorOptions = mentors.data ?? [];

  return (
    <section className={styles.pageContainer}>
      <PageHeader
        description={t('admin.manageUsersPage.description')}
        eyebrow={t('admin.common.control')}
        title={t('admin.manageUsersPage.title')}
      />

      <div className={styles.gridContainer}>
        <Card className={styles.glassCard} radius="xl">
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>{t('admin.createUserPage.title')}</div>
            <div className={styles.cardDescription}>{t('admin.createUserPage.description')}</div>
          </CardHeader>
          <div className={styles.divider} />
          <CardContent className="p-6">
            <form
              className={styles.form}
              onSubmit={event => {
                event.preventDefault();
                void createUser
                  .mutateAsync({
                    email: formState.email,
                    fullName: formState.fullName,
                    password: formState.password,
                    role: formState.role,
                    mentorId: formState.role === 'INTERN' ? formState.mentorId : undefined,
                  })
                  .then(() => {
                    setFormState({
                      email: '',
                      fullName: '',
                      password: '',
                      role: 'INTERN',
                      mentorId: '',
                    });
                  });
              }}
            >
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>{t('admin.createForm.fullName')}</span>
                <input
                  className={styles.input}
                  value={formState.fullName}
                  onChange={event => setFormState(prev => ({ ...prev, fullName: event.target.value }))}
                />
              </label>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>{t('admin.createForm.email')}</span>
                <input
                  className={styles.input}
                  value={formState.email}
                  onChange={event => setFormState(prev => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>{t('admin.createForm.password')}</span>
                <input
                  className={styles.input}
                  type="password"
                  value={formState.password}
                  onChange={event => setFormState(prev => ({ ...prev, password: event.target.value }))}
                />
              </label>

              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>{t('admin.common.role')}</span>
                <select
                  className={styles.select}
                  value={formState.role}
                  onChange={event => {
                    const value = event.target.value as CreateUserFormState['role'];
                    setFormState(prev => ({ ...prev, role: value, mentorId: value === 'INTERN' ? prev.mentorId : '' }));
                  }}
                >
                  <option value="INTERN">{t('roles.byCode.INTERN')}</option>
                  <option value="MENTOR">{t('roles.byCode.MENTOR')}</option>
                  <option value="ADMIN">{t('roles.byCode.ADMIN')}</option>
                </select>
              </label>

              {formState.role === 'INTERN' ? (
                <label className={styles.fieldLabel}>
                  <span className={styles.labelText}>{t('admin.common.assignedMentor')}</span>
                  <select
                    className={styles.select}
                    value={formState.mentorId}
                    onChange={event => setFormState(prev => ({ ...prev, mentorId: event.target.value }))}
                  >
                    <option value="">{t('admin.common.selectMentor')}</option>
                    {mentorOptions.map(mentor => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.fullName} ({mentor.email})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {createUser.error ? (
                <PanelState
                  description={createUser.error.message}
                  title={t('admin.createForm.errorTitle')}
                  tone="danger"
                />
              ) : null}

              <Button fullWidth isLoading={createUser.isPending} radius="lg" size="lg" type="submit" variant="primary">
                {createUser.isPending ? `${t('admin.createForm.submit')}...` : t('admin.createForm.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={styles.glassCard} radius="xl">
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>{t('admin.manageUsersPage.title')}</div>
            <div className={styles.cardDescription}>{t('admin.manageUsersPage.description')}</div>
          </CardHeader>
          <div className={styles.divider} />
          <CardContent className="gap-6 p-6">
            {(users.data ?? []).length === 0 ? (
              <PanelState
                description={t('admin.users.panelEmptyDescription')}
                title={t('admin.users.panelEmptyTitle')}
              />
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.tableHeadCell}>{t('admin.users.columns.user')}</th>
                      <th className={styles.tableHeadCell}>{t('admin.users.columns.role')}</th>
                      <th className={styles.tableHeadCell}>{t('admin.users.columns.mentor')}</th>
                      <th className={styles.tableHeadCell}>{t('admin.users.columns.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(users.data ?? []).map(user => (
                      <tr className={styles.tableRow} key={user.id}>
                        <td className={styles.tableCell}>
                          <div className="space-y-1">
                            <div className={styles.userName}>{user.fullName}</div>
                            <div className={styles.userEmail}>{user.email}</div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <Chip
                            color={user.role === 'ADMIN' ? 'warning' : user.role === 'MENTOR' ? 'accent' : 'success'}
                            size="sm"
                            variant="soft"
                          >
                            {t(`roles.byCode.${user.role}`)}
                          </Chip>
                        </td>
                        <td className={styles.tableCell}>
                          {user.internProfile?.mentor?.fullName ?? t('admin.common.notAssigned')}
                        </td>
                        <td className={styles.tableCell}>
                          {user.internProfile ? t('admin.common.linked') : t('admin.common.standalone')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="space-y-4">
              {(users.data ?? []).map(user => {
                const editingUser = editingUsers[user.id] ?? user;

                return (
                  <Card className={styles.editCard} key={user.id} radius="lg">
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
                        <label className={styles.fieldLabel}>
                          <span className={styles.labelText}>{t('admin.createForm.fullName')}</span>
                          <input
                            className={styles.input}
                            value={editingUser.fullName}
                            onChange={event =>
                              setEditingUsers(prev => ({
                                ...prev,
                                [user.id]: { ...editingUser, fullName: event.target.value },
                              }))
                            }
                          />
                        </label>
                        <label className={styles.fieldLabel}>
                          <span className={styles.labelText}>{t('admin.createForm.email')}</span>
                          <input className={styles.readOnlyInput} readOnly value={user.email} />
                        </label>
                        <label className={styles.fieldLabel}>
                          <span className={styles.labelText}>{t('admin.common.role')}</span>
                          <select
                            className={styles.select}
                            value={editingUser.role}
                            onChange={event => {
                              const value = event.target.value as AdminUser['role'];
                              setEditingUsers(prev => ({
                                ...prev,
                                [user.id]: {
                                  ...editingUser,
                                  role: value,
                                  internProfile: value === 'INTERN' ? (editingUser.internProfile ?? null) : null,
                                },
                              }));
                            }}
                          >
                            <option value="INTERN">{t('roles.byCode.INTERN')}</option>
                            <option value="MENTOR">{t('roles.byCode.MENTOR')}</option>
                            <option value="ADMIN">{t('roles.byCode.ADMIN')}</option>
                          </select>
                        </label>
                        {editingUser.role === 'INTERN' ? (
                          <label className={styles.fieldLabel}>
                            <span className={styles.labelText}>{t('admin.common.mentor')}</span>
                            <select
                              className={styles.select}
                              value={editingUser.internProfile?.mentorId ?? ''}
                              onChange={event => {
                                const value = event.target.value;
                                setEditingUsers(prev => ({
                                  ...prev,
                                  [user.id]: {
                                    ...editingUser,
                                    internProfile: value
                                      ? {
                                          id: editingUser.internProfile?.id ?? '',
                                          mentorId: value,
                                          mentor: mentorOptions.find(mentor => mentor.id === value) ?? {
                                            id: value,
                                            fullName: t('admin.common.selectMentor'),
                                            email: '',
                                          },
                                        }
                                      : null,
                                  },
                                }));
                              }}
                            >
                              <option value="">{t('admin.common.selectMentor')}</option>
                              {mentorOptions.map(mentor => (
                                <option key={mentor.id} value={mentor.id}>
                                  {mentor.fullName} ({mentor.email})
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <label className={styles.fieldLabel}>
                            <span className={styles.labelText}>{t('admin.common.assignedMentor')}</span>
                            <input
                              className={styles.readOnlyInput}
                              readOnly
                              value={user.internProfile?.mentor?.fullName ?? t('admin.common.notApplicable')}
                            />
                          </label>
                        )}
                      </div>

                      <div className={styles.actionsRow}>
                        <Button
                          isLoading={updateUser.isPending}
                          radius="lg"
                          variant="primary"
                          onPress={() =>
                            void updateUser.mutateAsync({
                              id: user.id,
                              payload: {
                                fullName: editingUser.fullName,
                                role: editingUser.role,
                                mentorId:
                                  editingUser.role === 'INTERN' ? editingUser.internProfile?.mentorId : undefined,
                              },
                            })
                          }
                        >
                          {t('admin.common.saveChanges')}
                        </Button>
                        <Button
                          isLoading={deleteUser.isPending}
                          radius="lg"
                          variant="danger"
                          onPress={() => void deleteUser.mutateAsync(user.id)}
                        >
                          {t('admin.common.deleteUser')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {users.error ? (
              <PanelState description={users.error.message} title={t('admin.users.panelErrorTitle')} tone="danger" />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
