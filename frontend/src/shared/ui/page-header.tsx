import type { ReactNode } from 'react';
import { Avatar } from '@shared/ui/heroui';

type ProfilePageHeaderProps = {
  fullName: string;
  email: string;
  avatarSrc?: string | null;
  endContent?: ReactNode;
};

type TitlePageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  endContent?: ReactNode;
};

type PageHeaderProps = ProfilePageHeaderProps | TitlePageHeaderProps;

export function PageHeader(props: PageHeaderProps) {
  if ('title' in props) {
    return (
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          {props.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{props.eyebrow}</p>
          ) : null}
          <h1 className="text-[32px] font-semibold tracking-tight text-[var(--text)] leading-tight">{props.title}</h1>
          {props.description ? <p className="text-[var(--muted)] max-w-3xl">{props.description}</p> : null}
        </div>
        {props.endContent ? <div className="shrink-0">{props.endContent}</div> : null}
      </div>
    );
  }

  const { fullName, email, avatarSrc, endContent } = props;

  return (
    <div className="rounded-[20px]  border border-[var(--border)] bg-[var(--surface)] p-6 flex items-center gap-6">
      <div className="shrink-0 rounded-full border-[6px] border-[var(--surface)] shadow-[0_2px_14px_rgba(0,0,0,0.1)] p-0.5">
        <Avatar className="h-[88px] w-[88px] text-2xl" name={fullName} src={avatarSrc ?? undefined} />
      </div>

      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        <h1 className="text-[32px] font-semibold tracking-tight text-[var(--text)] leading-tight">{fullName}</h1>

        <div className="flex items-center gap-2 text-[var(--muted)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M14 3H2C1.45 3 1 3.45 1 4V12C1 12.55 1.45 13 2 13H14C14.55 13 15 12.55 15 12V4C15 3.45 14.55 3 14 3ZM13.2 5L8 8.25L2.8 5V4.2L8 7.45L13.2 4.2V5Z"
              fill="currentColor"
            />
          </svg>

          <p className="text-base font-normal leading-tight">{email}</p>
        </div>
      </div>

      {endContent ? <div className="shrink-0">{endContent}</div> : null}
    </div>
  );
}
