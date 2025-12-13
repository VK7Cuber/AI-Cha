import { ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'outline';
type Size = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

const sizeMap: Record<Size, string> = {
  small: 'min-h-[4.4rem] px-6 text-h2',
  medium: 'min-h-[5rem] px-7 text-h1',
  large: 'min-h-[5.8rem] px-8 text-h1'
};

const variantMap: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primaryHover active:bg-primaryActive shadow-lg hover:scale-[1.02] active:scale-[0.99]',
  secondary:
    'bg-gray text-white hover:bg-grayLight active:bg-gray shadow-md hover:scale-[1.02] active:scale-[0.99]',
  outline:
    'border-2 border-primary text-primary bg-white hover:bg-primary/5 active:bg-primary/10 hover:scale-[1.02] active:scale-[0.99]'
};

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(base, sizeMap[size], variantMap[variant], fullWidth && 'w-full', className)}
      aria-busy={loading}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {leftIcon}
      {loading ? 'Загрузка...' : children}
      {rightIcon}
    </button>
  );
}

export default Button;

