import React from 'react';

export interface EntryCardProps {
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
  style?: React.CSSProperties;
}

export function getMoodEmoji(mood: string) {
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

const EntryCard: React.FC<EntryCardProps> = ({ entry, onEdit, onDelete, onClick, style }) => {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.2)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        ...style,
      }}
      onClick={onClick ? () => onClick(entry) : undefined}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'blue',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '2px 8px',
          zIndex: 1000,
          borderBottomRightRadius: '8px',
        }}
      >
        ENTRY CARD
      </div>
      {/* Action Buttons - always visible if handlers provided */}
      {(onEdit || onDelete) && (
        <div
          className="entry-actions"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '6px',
            zIndex: 10,
            opacity: 1,
            visibility: 'visible',
            transition: 'all 0.3s ease',
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
                fontSize: '18px',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '6px',
                transition: 'background 0.2s',
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
                fontSize: '18px',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      )}
      {/* First line: Date and time */}
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
        {new Date(entry.date).toLocaleString()}
      </div>
      {/* Second line: Mood (if present) and attachment icon */}
      {entry.mood && entry.mood.mood && (
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>
            {getMoodEmoji(entry.mood.mood)} Mood: {entry.mood.mood} ({entry.mood.intensity}/5)
          </span>
          {/* Attachment icon if images exist */}
          {entry.images && entry.images.length > 0 && (
            <span
              style={{
                marginLeft: 0,
                cursor: 'pointer',
                fontSize: '16px',
                verticalAlign: 'middle',
                color: '#ffd600',
                transition: 'transform 0.2s',
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
      )}
      {/* Third line: Entry content preview */}
      <div
        style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.95)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'pre-line',
          minHeight: '32px',
          marginBottom: '12px',
        }}
      >
        {entry.content.replace(/<[^>]+>/g, '').substring(0, 120)}
        {entry.content.replace(/<[^>]+>/g, '').length > 120 ? '...' : ''}
      </div>
      {/* Tags and folder (optional, can be kept or removed for minimalism) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          marginTop: 'auto',
        }}
      >
        <div>{entry.folder}</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {entry.tags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.2)',
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
    </div>
  );
};

export default EntryCard;
