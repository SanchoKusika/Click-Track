import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@shared/ui/heroui';

type SectionPanelProps = {
  title: string;
  subtitle?: string;
  endContent?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

export function SectionPanel({ children, contentClassName, endContent, subtitle, title }: SectionPanelProps) {
  return (
    <Card
      className="border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_28px_-18px_rgba(0,0,0,0.2)]"
      radius="lg"
    >
      <CardHeader className="items-start justify-between gap-3 p-6 pb-4">
        <div className="space-y-1">
          <h2 className="text-[34px] leading-none font-bold text-[var(--text)]">{title}</h2>
          {subtitle ? <p className="text-sm text-[var(--muted)]">{subtitle}</p> : null}
        </div>
        {endContent ? <div>{endContent}</div> : null}
      </CardHeader>
      <CardContent className={contentClassName ?? 'gap-4 px-6 pb-6 pt-2'}>{children}</CardContent>
    </Card>
  );
}
