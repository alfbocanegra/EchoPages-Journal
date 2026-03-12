import React from 'react';

const FOLDERS = ['Inbox', 'Personal', 'Work', 'Health', 'Travel', 'Ideas', 'Archive'];

export const FolderSelect: React.FC<{
  folder: string;
  onChange: (folder: string) => void;
}> = ({ folder, onChange }) => (
  <div style={{ marginBottom: 16 }}>
    <label htmlFor="folder-select" style={{ fontWeight: 500, marginRight: 8 }}>
      Folder:
    </label>
    <select
      id="folder-select"
      value={folder}
      onChange={e => onChange(e.target.value)}
      style={{ padding: 4 }}
    >
      {FOLDERS.map(f => (
        <option key={f} value={f}>
          {f}
        </option>
      ))}
    </select>
  </div>
);
