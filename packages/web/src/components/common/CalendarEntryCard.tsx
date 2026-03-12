import React from 'react';

export interface CalendarEntryCardProps {
  entry: {
    id: string;
    date: string | Date;
    content: string;
    mood?: {
      mood: string;
      intensity: number;
      emotions: string[];
    };
  };
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
    case 'Neutral':
      return '😐';
    default:
      return '🎭';
  }
}

const CalendarEntryCard: React.FC<CalendarEntryCardProps> = ({ entry }) => {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.13)',
        borderRadius: '14px',
        padding: '18px 22px',
        border: '4px solid green',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        marginBottom: '18px',
        maxWidth: 600,
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'green',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '2px 8px',
          zIndex: 1000,
          borderBottomRightRadius: '8px',
        }}
      >
        LIVE CARD!
      </div>
      <div
        style={{
          fontSize: '13px',
          color: 'rgba(40,40,40,0.7)',
          marginBottom: '6px',
          marginTop: '28px',
        }}
      >
        {new Date(entry.date).toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      {entry.mood && entry.mood.mood && (
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '10px' }}>
          {getMoodEmoji(entry.mood.mood)} {entry.mood.mood} ({entry.mood.intensity}/5)
        </div>
      )}
      <div style={{ fontSize: '15px', color: '#222', whiteSpace: 'pre-line' }}>{entry.content}</div>
    </div>
  );
};

export default CalendarEntryCard;
