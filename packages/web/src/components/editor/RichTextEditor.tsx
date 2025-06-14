import React, { useRef } from 'react';

const toolbarButtons = [
  { cmd: 'bold', label: 'Bold', icon: 'B' },
  { cmd: 'italic', label: 'Italic', icon: 'I' },
  { cmd: 'underline', label: 'Underline', icon: 'U' },
  { cmd: 'insertUnorderedList', label: 'Bulleted List', icon: '•' },
  { cmd: 'insertOrderedList', label: 'Numbered List', icon: '1.' },
  { cmd: 'formatBlock', arg: 'H1', label: 'Heading 1', icon: 'H1' },
  { cmd: 'formatBlock', arg: 'H2', label: 'Heading 2', icon: 'H2' },
];

export const RichTextEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleCommand = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg || undefined);
    editorRef.current?.focus();
  };

  const handleImageUpload = () => {
    // Simulate image upload
    alert('Image upload not implemented.');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div role="toolbar" aria-label="Editor toolbar" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {toolbarButtons.map(btn => (
          <button
            key={btn.label}
            aria-label={btn.label}
            onClick={() => handleCommand(btn.cmd, btn.arg)}
            type="button"
            style={{ fontWeight: btn.cmd === 'bold' ? 'bold' : undefined }}
          >
            {btn.icon}
          </button>
        ))}
        <button aria-label="Insert Image" onClick={handleImageUpload} type="button">🖼️</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        aria-label="Journal entry editor"
        style={{
          minHeight: 200,
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: 16,
          outline: 'none',
          background: '#fff',
        }}
        tabIndex={0}
        suppressContentEditableWarning
      >
        <p>Start writing your journal entry...</p>
      </div>
      <div style={{ marginTop: 16, color: '#888' }}>
        <em>Multimedia support coming soon.</em>
      </div>
    </div>
  );
}; 