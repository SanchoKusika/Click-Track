import type { AdminUser } from '@entities/admin';
import { useTranslation } from 'react-i18next';
import { Chip, Table } from '@shared/ui/heroui';

import styles from '../../styles.module.css';

interface UsersTableProps {
  users: AdminUser[];
}

export function UsersTable({ users }: UsersTableProps) {
  const { t } = useTranslation();

  return (
    <Table>
      <Table.ScrollContainer style={{ minWidth: 500 }}>
        <Table.Content aria-label={t('admin.users.tableAria')}>
          <Table.Header>
            <Table.Column id="user" isRowHeader>
              {t('admin.users.columns.user')}
            </Table.Column>
            <Table.Column id="role">{t('admin.users.columns.role')}</Table.Column>
            <Table.Column id="mentor">{t('admin.users.columns.mentor')}</Table.Column>
            <Table.Column id="status">{t('admin.users.columns.status')}</Table.Column>
          </Table.Header>
          <Table.Body items={users}>
            {(user: AdminUser) => (
              <Table.Row id={user.id}>
                <Table.Cell>
                  <div className="space-y-1">
                    <div className={styles.userName}>{user.fullName}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Chip
                    color={user.role === 'ADMIN' ? 'warning' : user.role === 'MENTOR' ? 'accent' : 'success'}
                    size="sm"
                    variant="soft"
                  >
                    {t(`roles.byCode.${user.role}`)}
                  </Chip>
                </Table.Cell>
                <Table.Cell>{user.internProfile?.mentor?.fullName ?? t('admin.common.notAssigned')}</Table.Cell>
                <Table.Cell>{user.internProfile ? t('admin.common.linked') : t('admin.common.standalone')}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
