import React, { useState } from 'react';

const templates = [
  {
    name: 'Blank',
    content: '',
  },
  {
    name: 'Daily Reflection',
    content: 'Today I felt...\nWhat went well?\nWhat could be improved?\nGoals for tomorrow:',
  },
  {
    name: 'Gratitude',
    content: 'Three things I am grateful for today:\n1. \n2. \n3. ',
  },
  {
    name: 'Meeting Notes',
    content: 'Meeting Date: \nAttendees: \nAgenda: \nNotes: ',
  },
];

export const EntryTemplates: React.FC<{ onTemplateSelect: (content: string) => void }> = ({
  onTemplateSelect,
}) => {
  const [selected, setSelected] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelected(idx);
    onTemplateSelect(templates[idx].content);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor="template-select" style={{ fontWeight: 500, marginRight: 8 }}>
        Template:
      </label>
      <select id="template-select" value={selected} onChange={handleChange} style={{ padding: 4 }}>
        {templates.map((tpl, i) => (
          <option key={tpl.name} value={i}>
            {tpl.name}
          </option>
        ))}
      </select>
    </div>
  );
};
