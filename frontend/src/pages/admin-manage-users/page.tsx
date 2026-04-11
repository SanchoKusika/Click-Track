import { ManageUsersPanel } from '@features/admin/manage-users';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@shared/ui/page-header';

export function AdminManageUsersPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-6">
      <PageHeader
        description={t('admin.manageUsersPage.description')}
        eyebrow={t('admin.common.control')}
        title={t('admin.manageUsersPage.title')}
      />
      <ManageUsersPanel />
    </section>
  );
}
