import type { ComponentProps, ReactNode } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import {
  Avatar as HeroAvatar,
  Breadcrumbs as HeroBreadcrumbs,
  BreadcrumbsItem as HeroBreadcrumbsItem,
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
  ToastProvider as HeroToastProvider,
  ToggleButton as HeroToggleButton,
  ToggleButtonGroup as HeroToggleButtonGroup,
  Tooltip as HeroTooltip,
  toast,
} from '@heroui/react';

type AvatarCompatProps = Omit<ComponentProps<typeof HeroAvatar>, 'children'> & {
  src?: string;
  name?: string;
  alt?: string;
  children?: ReactNode;
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
    return jsx(HeroAvatar, { ...props, children });
  }

  return jsxs(HeroAvatar, {
    ...props,
    children: [
      typeof src === 'string' && src.length > 0
        ? jsx(HeroAvatar.Image, { alt: alt ?? name, src }, 'avatar-image')
        : null,
      jsx(HeroAvatar.Fallback, { children: getAvatarInitials(name) }, 'avatar-fallback'),
    ],
  });
}

export const Avatar = AvatarCompat;
export const BreadcrumbItem = HeroBreadcrumbsItem;
export const Breadcrumbs = HeroBreadcrumbs;
export const Button = HeroButton;
export const Card = HeroCard;
export const CardContent = HeroCardContent;
export const CardFooter = HeroCardFooter;
export const CardHeader = HeroCardHeader;
export const Chip = HeroChip;
export const FieldError = HeroFieldError;
export const Input = HeroInput;
export const InputGroup = HeroInputGroup;
export const Label = HeroLabel;
export const ListBox = HeroListBox;
export const RouterProvider = HeroRouterProvider;
export const Select = HeroSelect;
export const Skeleton = HeroSkeleton;
export const Table = HeroTable;
export const TextArea = HeroTextArea;
export const TextField = HeroTextField;
export const ToastProvider = HeroToastProvider;
export const ToggleButton = HeroToggleButton;
export const ToggleButtonGroup = HeroToggleButtonGroup;
export const Tooltip = HeroTooltip;
export { toast };
