import type { ReactNode } from 'react';
import { Card, CardContent } from '@shared/ui/heroui';

type MetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Card
      className="border rounded-[20px] border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_24px_-18px_rgba(0,0,0,0.2)]"
      radius="lg"
    >
      <CardContent className="gap-3 p-6">
        <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]">{label}</div>
        <div className="text-3xl font-semibold tracking-tight text-[var(--text)]">{value}</div>
        {hint ? <div className="text-sm text-[var(--muted)]">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
