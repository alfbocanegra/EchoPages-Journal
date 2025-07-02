import React from 'react';

type Variant = 'filled' | 'outlined' | 'error' | 'disabled';

interface ThemeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: Variant;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  className?: string;
}

const getInputStyles = (
  variant: Variant,
  error: boolean,
  disabled: boolean
): React.CSSProperties => {
  const base: React.CSSProperties = {
    background: 'var(--color-surface, #FFFFFF)',
    color: 'var(--color-onSurface, #1C1B1F)',
    borderRadius: 'var(--radius-medium, 12px)',
    border: '1px solid var(--color-outline, #C1C1C1)',
    padding: 'var(--spacing-2, 8px) var(--spacing-3, 12px)',
    fontSize: 'var(--font-size-body, 16px)',
    fontFamily: 'var(--font-family, system-ui)',
    outline: 'none',
    transition: 'border 0.15s, background 0.15s',
    width: '100%',
    boxSizing: 'border-box',
  };
  if (variant === 'outlined') {
    base.border = '2px solid var(--color-primary, #6750A4)';
  }
  if (variant === 'error' || error) {
    base.border = '1.5px solid var(--color-error, #B3261E)';
  }
  if (variant === 'disabled' || disabled) {
    base.background = 'var(--color-disabled, #E0E0E0)';
    base.color = 'var(--color-onSurface, #1C1B1F)';
    base.cursor = 'not-allowed';
  }
  return base;
};

const ThemeInput: React.FC<ThemeInputProps> = ({
  label,
  error,
  variant = 'filled',
  style,
  inputStyle,
  disabled = false,
  className,
  ...props
}) => {
  const isError = variant === 'error' || !!error;
  const isDisabled = variant === 'disabled' || disabled;
  const inputId = React.useId();
  return (
    <div
      style={{ margin: 'var(--spacing-2, 8px) 0', width: '100%', ...style }}
      className={className}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            color: 'var(--color-onSurface, #1C1B1F)',
            fontSize: 'var(--font-size-caption, 14px)',
            fontWeight: 500,
            marginBottom: 'var(--spacing-1, 4px)',
            fontFamily: 'var(--font-family, system-ui)',
            display: 'block',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{ ...getInputStyles(variant, isError, isDisabled), ...inputStyle }}
        disabled={isDisabled}
        aria-label={label}
        aria-invalid={isError ? 'true' : 'false'}
        aria-disabled={isDisabled ? 'true' : 'false'}
        {...props}
      />
      {isError && error && (
        <div
          style={{
            color: 'var(--color-error, #B3261E)',
            fontSize: 'var(--font-size-caption, 14px)',
            marginTop: 'var(--spacing-1, 4px)',
            fontFamily: 'var(--font-family, system-ui)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default ThemeInput;
