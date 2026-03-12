import React, { useRef, useState } from 'react';

export const QuickEntry: React.FC<{ onSave: (content: string) => Promise<void> }> = ({
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await onSave(content);
    setContent('');
    setSaving(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {saving ? (
        <div
          style={{
            height: 80,
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s infinite',
            border: '2px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <span
            style={{
              color: '#3b82f6',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>💾</span>
            Saving your quick thought...
          </span>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="✨ Jot down a quick thought... (Cmd/Ctrl + Enter to save)"
          style={{
            width: '100%',
            minHeight: 80,
            padding: 16,
            borderRadius: 12,
            border: '2px solid rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.8)',
            fontSize: 14,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            resize: 'vertical',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(0,0,0,0.1)';
            e.target.style.boxShadow = 'none';
          }}
          autoFocus
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {content.trim() && (
          <button
            onClick={() => {
              setContent('');
              textareaRef.current?.focus();
            }}
            style={{
              height: 40,
              minHeight: 40,
              padding: '0 16px',
              borderRadius: 8,
              border: '2px solid #6b7280',
              background: 'transparent',
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#6b7280';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            Clear
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          style={{
            height: 40,
            minHeight: 40,
            padding: '0 20px',
            borderRadius: 8,
            border: 'none',
            background:
              saving || !content.trim()
                ? 'rgba(156, 163, 175, 0.5)'
                : 'linear-gradient(45deg, #10b981, #059669)',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving || !content.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: saving || !content.trim() ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
          onMouseOver={e => {
            if (!saving && content.trim()) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }
          }}
          onMouseOut={e => {
            if (!saving && content.trim()) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
            }
          }}
        >
          <span>⚡</span>
          {saving ? 'Saving...' : 'Quick Save'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
