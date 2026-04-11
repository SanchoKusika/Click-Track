type RatingStarsProps = {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  readOnly?: boolean;
  onChange?: (value: number) => void;
};

function StarIcon({ filled, size }: { filled: boolean; size: 'sm' | 'md' }) {
  const dimension = size === 'sm' ? 14 : 18;

  return (
    <svg fill={filled ? 'var(--primary)' : '#cbd5e1'} height={dimension} viewBox="0 0 24 24" width={dimension}>
      <path d="M12 2.25l2.88 5.84 6.45.94-4.67 4.55 1.1 6.42L12 16.98 6.24 20l1.1-6.42-4.67-4.55 6.45-.94L12 2.25z" />
    </svg>
  );
}

export function RatingStars({
  max = 5,
  onChange,
  readOnly = true,
  showValue = false,
  size = 'md',
  value,
}: RatingStarsProps) {
  const filledCount = Math.max(0, Math.min(max, Math.round(value)));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) =>
          readOnly ? (
            <StarIcon filled={index < filledCount} key={index} size={size} />
          ) : (
            <button
              className="cursor-pointer transition-opacity hover:opacity-80"
              key={index}
              type="button"
              onClick={() => onChange?.(index + 1)}
            >
              <StarIcon filled={index < filledCount} size={size} />
            </button>
          )
        )}
      </div>
      {showValue ? <span className="text-sm font-semibold text-[var(--text)]">{value.toFixed(1)}</span> : null}
    </div>
  );
}
