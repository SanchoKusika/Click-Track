import { CreateUserForm } from '@features/admin/create-user';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@shared/ui/page-header';
import { CreateUserInfoCard } from './ui/create-user-info-card';

export function AdminCreateUserPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-6">
      <PageHeader
        description={t('admin.createUserPage.description')}
        eyebrow={t('admin.common.control')}
        title={t('admin.createUserPage.title')}
      />
      <div className="grid grid-cols-2 gap-6 items-stretch">
        <CreateUserForm />
        <CreateUserInfoCard />
      </div>
    </section>
  );
}
