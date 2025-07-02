import React, { useState } from 'react';

function toLocalISOString(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export const EntryMetadata: React.FC = () => {
  const [created, setCreated] = useState(() => new Date());
  const [edited, setEdited] = useState(() => new Date());
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
      <div>
        <label style={{ fontWeight: 500 }}>Created:</label>{' '}
        <input
          type="datetime-local"
          value={toLocalISOString(created)}
          onChange={e => setCreated(new Date(e.target.value))}
          style={{ marginLeft: 4 }}
          title="Created timestamp"
          placeholder="Created timestamp"
        />
      </div>
      <div>
        <label style={{ fontWeight: 500 }}>Last Edited:</label>{' '}
        <input
          type="datetime-local"
          value={toLocalISOString(edited)}
          onChange={e => setEdited(new Date(e.target.value))}
          style={{ marginLeft: 4 }}
          title="Last edited timestamp"
          placeholder="Last edited timestamp"
        />
      </div>
      <div style={{ color: '#888', fontSize: 14 }}>Timezone: {tz}</div>
    </div>
  );
};
