import React, { useEffect, useRef } from 'react';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  accessibilityLabel?: string;
  descriptionId?: string;
}

const ThemeModal: React.FC<ThemeModalProps> = ({
  visible,
  onClose,
  title,
  children,
  style,
  className,
  accessibilityLabel,
  descriptionId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const generatedDescId = React.useId();
  const descId = descriptionId || generatedDescId;

  useEffect(() => {
    if (!visible) return;
    // Save the last focused element
    lastFocusedElement.current = document.activeElement as HTMLElement;
    // Focus the modal
    modalRef.current?.focus();
    // Trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusableEls = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableEls || focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      lastFocusedElement.current?.focus();
    };
  }, [visible, onClose]);

  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={accessibilityLabel || title || 'Modal'}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={descId}
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          background: 'var(--color-surface, #FFFFFF)',
          borderRadius: 'var(--radius-large, 24px)',
          boxShadow: '0 4px var(--elevation-modal, 16px) rgba(0,0,0,0.12)',
          padding: 'var(--spacing-5, 24px)',
          minWidth: 280,
          maxWidth: 400,
          width: '90%',
          position: 'relative',
          outline: 'none',
          ...style,
        }}
        className={className}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {title && (
          <div
            id={titleId}
            style={{
              fontSize: 'var(--font-size-heading, 24px)',
              fontWeight: 700,
              color: 'var(--color-onSurface, #1C1B1F)',
              marginBottom: 'var(--spacing-3, 16px)',
              fontFamily: 'var(--font-family, system-ui)',
              textAlign: 'center',
            }}
          >
            {title}
          </div>
        )}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: 'var(--spacing-2, 8px)',
            right: 'var(--spacing-2, 8px)',
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: 'var(--color-onSurface, #1C1B1F)',
            fontWeight: 'bold',
            cursor: 'pointer',
            lineHeight: 1,
            zIndex: 10,
          }}
        >
          ×
        </button>
        <div id={descId} style={{ marginTop: 'var(--spacing-2, 8px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
