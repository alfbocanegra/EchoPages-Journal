import React, { useState } from 'react';

const SUGGESTIONS = [
  'gratitude',
  'reflection',
  'work',
  'personal',
  'health',
  'meeting',
  'travel',
  'goal',
  'mood',
  'dream',
];

export const TagInput: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
}> = ({ tags, onChange }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setSuggestions(val ? SUGGESTIONS.filter(s => s.startsWith(val) && !tags.includes(s)) : []);
  };

  const handleAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
      setInput('');
      setSuggestions([]);
    }
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: 500 }}>Tags:</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              background: '#e0e0e0',
              borderRadius: 12,
              padding: '2px 10px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {tag}
            <button
              onClick={() => handleRemove(tag)}
              style={{
                marginLeft: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
              }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInput}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) handleAdd(input.trim());
          }}
          placeholder="Add tag..."
          style={{ minWidth: 80, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => handleAdd(s)}
              style={{
                background: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: '2px 8px',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
