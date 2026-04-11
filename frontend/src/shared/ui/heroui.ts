import type { ComponentType, ReactNode } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import {
  Avatar as HeroAvatar,
  Button as HeroButton,
  Card as HeroCard,
  CardContent as HeroCardContent,
  CardFooter as HeroCardFooter,
  CardHeader as HeroCardHeader,
  Chip as HeroChip,
  FieldError as HeroFieldError,
  Input as HeroInput,
  InputGroup as HeroInputGroup,
  Label as HeroLabel,
  ListBox as HeroListBox,
  RouterProvider as HeroRouterProvider,
  Select as HeroSelect,
  Skeleton as HeroSkeleton,
  Table as HeroTable,
  TextArea as HeroTextArea,
  TextField as HeroTextField,
  Tooltip as HeroTooltip,
  ToastProvider as HeroToastProvider,
  Breadcrumbs as HeroBreadcrumbs,
  BreadcrumbsItem as HeroBreadcrumbsItem,
  ToggleButtonGroup as HeroToggleButtonGroup,
  ToggleButton as HeroToggleButton,
  toast,
} from '@heroui/react';

type LooseProps = Record<string, unknown> & { children?: unknown };
type LooseComponent<T = LooseProps> = ComponentType<T>;
type LooseCompoundComponent = LooseComponent<LooseProps> & {
  [key: string]: LooseComponent<LooseProps>;
};

type AvatarCompatProps = LooseProps & {
  src?: string;
  name?: string;
  alt?: string;
  className?: string;
};

function getAvatarInitials(name: string | undefined): string {
  if (!name) {
    return '?';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return '?';
  }

  const initials = parts
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase();

  return initials || '?';
}

function AvatarCompat({ alt, children, name, src, ...props }: AvatarCompatProps) {
  if (children !== undefined && children !== null) {
    return jsx(HeroAvatar, { ...props, children: children as ReactNode });
  }

  const fallbackLabel = typeof name === 'string' ? name : undefined;

  return jsxs(HeroAvatar, {
    ...props,
    children: [
      typeof src === 'string' && src.length > 0
        ? jsx(HeroAvatar.Image, { alt: alt ?? fallbackLabel, src }, 'avatar-image')
        : null,
      jsx(HeroAvatar.Fallback, { children: getAvatarInitials(fallbackLabel) }, 'avatar-fallback'),
    ],
  });
}

export const RouterProvider = HeroRouterProvider as unknown as LooseComponent;
export const Card = HeroCard as unknown as LooseComponent;
export const CardHeader = HeroCardHeader as unknown as LooseComponent;
export const CardContent = HeroCardContent as unknown as LooseComponent;
export const CardFooter = HeroCardFooter as unknown as LooseComponent;
export const Button = HeroButton as unknown as LooseComponent;
export const Chip = HeroChip as unknown as LooseComponent;
export const Input = HeroInput as unknown as LooseComponent;
export const Avatar = Object.assign(AvatarCompat as unknown as LooseComponent, {
  Root: HeroAvatar.Root as unknown as LooseComponent,
  Image: HeroAvatar.Image as unknown as LooseComponent,
  Fallback: HeroAvatar.Fallback as unknown as LooseComponent,
}) as unknown as LooseCompoundComponent;
export const Tooltip = HeroTooltip as unknown as LooseComponent;
export const Skeleton = HeroSkeleton as unknown as LooseComponent;
export const ToastProvider = HeroToastProvider as unknown as LooseComponent;
export { toast };
export const Select = HeroSelect as unknown as LooseCompoundComponent;
export const Table = HeroTable as unknown as LooseCompoundComponent;
export const ListBox = HeroListBox as unknown as LooseCompoundComponent;
export const FieldError = HeroFieldError as unknown as LooseComponent;
export const InputGroup = HeroInputGroup as unknown as LooseCompoundComponent;
export const Label = HeroLabel as unknown as LooseComponent;
export const TextArea = HeroTextArea as unknown as LooseComponent;
export const TextField = HeroTextField as unknown as LooseComponent;
export const Breadcrumbs = HeroBreadcrumbs;
export const BreadcrumbItem = HeroBreadcrumbsItem;
export const ToggleButtonGroup = HeroToggleButtonGroup as unknown as LooseCompoundComponent;
export const ToggleButton = HeroToggleButton as unknown as LooseCompoundComponent;
