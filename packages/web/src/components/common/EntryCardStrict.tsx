import React from 'react';

export interface EntryCardStrictProps {
  entry: {
    id: string;
    title?: string;
    tags?: string[];
    folder?: string;
    date: string;
    content: string;
    images?: string[];
    mood?: {
      mood: string;
      intensity: number;
      emotions: string[];
      note?: string;
    };
  };
  onEdit?: (entry: any) => void;
  onDelete?: (id: string) => void;
  onClick?: (entry: any) => void;
}

function getMoodEmoji(mood: string) {
  switch (mood) {
    case 'Happy':
      return '😊';
    case 'Sad':
      return '😢';
    case 'Angry':
      return '😠';
    case 'Anxious':
      return '😰';
    case 'Tired':
      return '😴';
    case 'Calm':
      return '😌';
    case 'Thoughtful':
      return '🤔';
    case 'Excited':
      return '😍';
    case 'Disappointed':
      return '😔';
    case 'Content':
      return '😊';
    case 'Frustrated':
      return '😤';
    default:
      return '🎭';
  }
}

const EntryCardStrict: React.FC<EntryCardStrictProps> = ({ entry, onEdit, onDelete, onClick }) => {
  return (
    <div
      className="entry-card-strict"
      style={{
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(14px)',
        borderRadius: '18px',
        padding: '22px',
        border: '1.5px solid rgba(255,255,255,0.22)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        position: 'relative',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        maxWidth: '100%',
      }}
      onClick={onClick ? () => onClick(entry) : undefined}
    >
      {/* Action Buttons - hover only */}
      {(onEdit || onDelete) && (
        <div
          className="entry-actions-strict"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s',
          }}
        >
          {onEdit && (
            <button
              onClick={e => {
                e.stopPropagation();
                onEdit(entry);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2196F3',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '7px',
                transition: 'background 0.2s',
                pointerEvents: 'auto',
              }}
              title="Edit"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#f44336',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '7px',
                transition: 'background 0.2s',
                pointerEvents: 'auto',
              }}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      )}
      {/* First line: Date and time */}
      <div
        style={{
          fontSize: '12px',
          color: 'rgba(40,40,40,0.65)',
          marginBottom: '7px',
          fontWeight: 500,
        }}
      >
        {new Date(entry.date).toLocaleString()}
      </div>
      {/* Second line: Mood (if present) and attachment icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        {entry.mood && entry.mood.mood && (
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{getMoodEmoji(entry.mood.mood)}</span>
            <span>{entry.mood.mood}</span>
          </span>
        )}
        {entry.images && entry.images.length > 0 && (
          <span
            style={{
              marginLeft: 0,
              cursor: 'pointer',
              fontSize: '16px',
              verticalAlign: 'middle',
              color: '#ffd600',
              display: 'inline-block',
            }}
            title={`View ${entry.images.length} attachment${entry.images.length > 1 ? 's' : ''}`}
            onClick={e => {
              e.stopPropagation(); /* handle attachment preview if needed */
            }}
          >
            📎
          </span>
        )}
      </div>
      {/* Third line: Entry content preview */}
      <div
        style={{
          fontSize: '15px',
          color: '#222',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'pre-line',
          minHeight: '32px',
          marginBottom: '10px',
          fontWeight: 500,
        }}
      >
        {entry.content.replace(/<[^>]+>/g, '').substring(0, 120)}
        {entry.content.replace(/<[^>]+>/g, '').length > 120 ? '...' : ''}
      </div>
      {/* Tags and folder (optional, minimal) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'rgba(40,40,40,0.45)',
          marginTop: 'auto',
        }}
      >
        <div>{entry.folder}</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {entry.tags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                background: 'rgba(0,0,0,0.07)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        .entry-card-strict:hover .entry-actions-strict {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
};

export default EntryCardStrict;
