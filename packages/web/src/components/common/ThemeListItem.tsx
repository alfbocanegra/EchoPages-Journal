import React from 'react';

interface ThemeListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  rightActions?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  selected?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  subtitleStyle?: React.CSSProperties;
  className?: string;
  accessibilityLabel?: string;
}

const ThemeListItem: React.FC<ThemeListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  rightActions,
  onClick,
  selected = false,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
  className,
  accessibilityLabel,
  ...props
}) => {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={accessibilityLabel || title}
      aria-disabled={disabled ? 'true' : 'false'}
      onClick={disabled ? undefined : onClick}
      onKeyDown={e => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          onClick?.(e as any);
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: selected ? 'var(--color-secondary, #625B71)' : 'var(--color-surface, #FFFFFF)',
        borderRadius: 'var(--radius-medium, 12px)',
        padding: 'var(--spacing-3, 12px) var(--spacing-4, 16px)',
        margin: 'var(--spacing-1, 4px) 0',
        minHeight: 56,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        ...style,
      }}
      className={className}
      {...props}
    >
      {leading && <div style={{ marginRight: 'var(--spacing-3, 12px)' }}>{leading}</div>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span
          style={{
            color: 'var(--color-onSurface, #1C1B1F)',
            fontSize: 'var(--font-size-body, 16px)',
            fontWeight: 500,
            fontFamily: 'var(--font-family, system-ui)',
            ...titleStyle,
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              color: 'var(--color-onSurface, #1C1B1F)',
              fontSize: 'var(--font-size-caption, 14px)',
              fontFamily: 'var(--font-family, system-ui)',
              marginTop: 2,
              ...subtitleStyle,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {trailing && <div style={{ marginLeft: 'var(--spacing-3, 12px)' }}>{trailing}</div>}
      {rightActions && (
        <div style={{ marginLeft: 'var(--spacing-2, 8px)', display: 'flex', alignItems: 'center' }}>
          {rightActions}
        </div>
      )}
    </div>
  );
};

export default ThemeListItem;
