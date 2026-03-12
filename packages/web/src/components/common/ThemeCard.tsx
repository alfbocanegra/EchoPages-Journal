import React from 'react';

type Variant = 'filled' | 'outlined' | 'tonal';

interface ThemeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: Variant;
  style?: React.CSSProperties;
  className?: string;
  labelledById?: string;
}

const getCardStyles = (variant: Variant): React.CSSProperties => {
  switch (variant) {
    case 'outlined':
      return {
        background: 'var(--color-surface, #FFFFFF)',
        border: '1.5px solid var(--color-outline, #C1C1C1)',
      };
    case 'tonal':
      return {
        background: 'var(--color-secondary, #625B71)',
        border: 'none',
      };
    case 'filled':
    default:
      return {
        background: 'var(--color-surface, #FFFFFF)',
        border: 'none',
      };
  }
};

const ThemeCard: React.FC<ThemeCardProps> = ({
  children,
  variant = 'filled',
  style,
  className,
  labelledById,
  ...props
}) => {
  const cardStyles: React.CSSProperties = {
    ...getCardStyles(variant),
    borderRadius: 'var(--radius-large, 24px)',
    boxShadow: '0 2px var(--elevation-card, 4px) rgba(0,0,0,0.08)',
    padding: 'var(--spacing-4, 16px)',
    margin: 'var(--spacing-2, 8px) 0',
    minWidth: 220,
    ...style,
  };
  return (
    <div
      style={cardStyles}
      className={className}
      tabIndex={0}
      role="region"
      aria-labelledby={labelledById}
      {...props}
    >
      {children}
    </div>
  );
};

export default ThemeCard;
