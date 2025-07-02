import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ThemeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  variant?: Variant;
  style?: React.CSSProperties;
  className?: string;
}

const getButtonStyles = (variant: Variant, disabled: boolean): React.CSSProperties => {
  if (disabled) {
    return {
      background: 'rgba(156, 163, 175, 0.5)',
      color: 'rgba(107, 114, 128, 0.8)',
      border: 'none',
      cursor: 'not-allowed',
      boxShadow: 'none',
    };
  }
  switch (variant) {
    case 'secondary':
      return {
        background: 'linear-gradient(45deg, #6b7280, #4b5563)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
      };
    case 'outline':
      return {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#3b82f6',
        border: '2px solid #3b82f6',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
        backdropFilter: 'blur(10px)',
      };
    case 'danger':
      return {
        background: 'linear-gradient(45deg, #ef4444, #dc2626)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
      };
    case 'primary':
    default:
      return {
        background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
      };
  }
};

const ThemeButton: React.FC<ThemeButtonProps> = ({
  title,
  variant = 'primary',
  disabled = false,
  style,
  className,
  ...props
}) => {
  const buttonStyles: React.CSSProperties = {
    ...getButtonStyles(variant, disabled),
    borderRadius: 12,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    padding: '0 20px',
    height: 40,
    minHeight: 40,
    minWidth: 80,
    margin: 0,
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };
  return (
    <button
      type="button"
      style={buttonStyles}
      className={className}
      disabled={disabled}
      aria-label={title}
      tabIndex={0}
      onMouseOver={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(107, 114, 128, 0.4)';
          } else if (variant === 'danger') {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.4)';
          } else if (variant === 'outline') {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
          }
        }
      }}
      onMouseOut={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 114, 128, 0.3)';
          } else if (variant === 'danger') {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
          } else if (variant === 'outline') {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
          }
        }
      }}
      {...props}
    >
      {title}
    </button>
  );
};

export default ThemeButton;
