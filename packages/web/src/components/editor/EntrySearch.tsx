import React, { useState } from 'react';

const TAGS = [
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
const FOLDERS = ['Inbox', 'Personal', 'Work', 'Health', 'Travel', 'Ideas', 'Archive'];

export interface EntrySearchFilters {
  text: string;
  tag: string;
  folder: string;
}

export interface EntrySearchProps {
  filters: EntrySearchFilters;
  onChange: (filters: EntrySearchFilters) => void;
  search: string | null;
  onSearch: (search: string) => void;
  onViewChange?: (view: 'list' | 'calendar') => void;
  currentView?: 'list' | 'calendar';
}

export const EntrySearch: React.FC<EntrySearchProps> = ({
  filters: _filters,
  onChange,
  search,
  onSearch,
  onViewChange,
  currentView,
}) => {
  const [text] = useState('');
  const [tag, setTag] = useState('');
  const [folder, setFolder] = useState('');

  const handleSearch = () => {
    onChange({ text, tag, folder });
  };

  const inputStyle = {
    height: 40,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.2)',
    fontSize: 14,
    fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.9)',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  const buttonStyle = {
    height: 40,
    minHeight: 40,
    padding: '0 16px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'stretch',
        flexWrap: 'wrap',
      }}
    >
      {/* Search Input */}
      <input
        type="text"
        value={search || ''}
        onChange={e => onSearch(e.target.value)}
        placeholder="Search entries..."
        style={{
          ...inputStyle,
          flex: 1,
          minWidth: 200,
        }}
      />

      {/* Tag Filter */}
      <select
        value={tag}
        onChange={e => setTag(e.target.value)}
        style={{
          ...inputStyle,
          minWidth: 120,
          cursor: 'pointer',
        }}
        aria-label="Filter by tag"
        title="Filter by tag"
      >
        <option value="">All Tags</option>
        {TAGS.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Folder Filter */}
      <select
        value={folder}
        onChange={e => setFolder(e.target.value)}
        style={{
          ...inputStyle,
          minWidth: 120,
          cursor: 'pointer',
        }}
        aria-label="Filter by folder"
        title="Filter by folder"
      >
        <option value="">All Folders</option>
        {FOLDERS.map(f => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        style={{
          ...buttonStyle,
          background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
        }}
      >
        🔍 Search
      </button>

      {/* View Toggle Button */}
      {onViewChange && (
        <button
          onClick={() => onViewChange(currentView === 'calendar' ? 'list' : 'calendar')}
          style={{
            ...buttonStyle,
            background:
              currentView === 'calendar'
                ? 'linear-gradient(45deg, #10b981, #059669)'
                : 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
            color: 'white',
            boxShadow:
              currentView === 'calendar'
                ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                : '0 2px 8px rgba(139, 92, 246, 0.3)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow =
              currentView === 'calendar'
                ? '0 4px 12px rgba(16, 185, 129, 0.4)'
                : '0 4px 12px rgba(139, 92, 246, 0.4)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow =
              currentView === 'calendar'
                ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                : '0 2px 8px rgba(139, 92, 246, 0.3)';
          }}
          aria-label={
            currentView === 'calendar' ? 'Switch to list view' : 'Switch to calendar view'
          }
        >
          {currentView === 'calendar' ? '📋 List View' : '📅 Calendar View'}
        </button>
      )}
    </div>
  );
};
