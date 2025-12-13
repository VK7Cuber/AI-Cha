import clsx from 'clsx';
import { ReactNode } from 'react';

type Variant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variantMap: Record<Variant, string> = {
  default: 'bg-surface border border-grayLight',
  elevated: 'bg-surfaceElevated shadow-lg border border-grayLight',
  outlined: 'bg-surface border-2 border-primary/40'
};

export function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-3xl p-4 sm:p-5 transition-shadow',
        variantMap[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;

