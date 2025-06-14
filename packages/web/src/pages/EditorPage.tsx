import React from 'react';
import { RichTextEditor } from '../components/editor/RichTextEditor';
import { getJWT } from '../services/authService';

export const EditorPage: React.FC = () => {
  const jwt = getJWT();
  if (!jwt) {
    return <div style={{ color: 'red', padding: 32 }}>You must be logged in to access the editor.</div>;
  }
  return (
    <div style={{ padding: 32 }}>
      <h2>New Journal Entry</h2>
      <RichTextEditor />
    </div>
  );
}; 