type StatRowProps = {
  label: string;
  value: string | number;
  className?: string;
};

export function StatRow({ className, label, value }: StatRowProps) {
  return (
    <div className={className ?? 'flex items-center justify-between gap-3'}>
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--text)]">{value}</span>
    </div>
  );
}
