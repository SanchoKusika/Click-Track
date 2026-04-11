import type { ReactNode } from 'react';
import { Button, Card, CardContent } from '@shared/ui/heroui';

type PanelStateProps = {
  title: string;
  description: string;
  tone?: 'default' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function PanelState({ actionLabel, description, icon, onAction, title, tone = 'default' }: PanelStateProps) {
  const toneClasses =
    tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]';

  return (
    <Card className={`${toneClasses} shadow-[0_8px_24px_-18px_rgba(39,49,79,0.3)]`} radius="lg">
      <CardContent className="gap-4 p-6">
        {icon ? <div className="text-2xl">{icon}</div> : null}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm leading-6 text-inherit/80">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <div>
            <Button onPress={onAction} variant={tone === 'danger' ? 'danger' : 'primary'}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
