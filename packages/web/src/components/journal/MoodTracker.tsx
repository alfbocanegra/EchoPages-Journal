import React, { useState } from 'react';

interface MoodTrackerProps {
  onMoodChange: (mood: MoodEntry) => void;
  initialMood?: MoodEntry;
}

interface MoodEntry {
  mood: string;
  intensity: number; // 1-5 scale
  emotions: string[];
  note?: string;
  timestamp: Date;
}

const MOODS = [
  { emoji: '😊', name: 'Happy', color: '#4CAF50' },
  { emoji: '😢', name: 'Sad', color: '#2196F3' },
  { emoji: '😠', name: 'Angry', color: '#F44336' },
  { emoji: '😰', name: 'Anxious', color: '#FF9800' },
  { emoji: '😴', name: 'Tired', color: '#9C27B0' },
  { emoji: '😌', name: 'Calm', color: '#00BCD4' },
  { emoji: '🤔', name: 'Thoughtful', color: '#795548' },
  { emoji: '😍', name: 'Excited', color: '#E91E63' },
  { emoji: '😔', name: 'Disappointed', color: '#607D8B' },
  { emoji: '😊', name: 'Content', color: '#8BC34A' },
];

const EMOTIONS = [
  'Grateful',
  'Hopeful',
  'Proud',
  'Loved',
  'Peaceful',
  'Energetic',
  'Frustrated',
  'Overwhelmed',
  'Lonely',
  'Worried',
  'Confused',
  'Stressed',
  'Motivated',
  'Creative',
  'Focused',
  'Relaxed',
  'Inspired',
  'Confident',
];

// Defensive normalization for initialMood prop
function normalizeMood(mood: any) {
  if (
    mood &&
    typeof mood === 'object' &&
    'mood' in mood &&
    'intensity' in mood &&
    Array.isArray(mood.emotions)
  ) {
    return mood;
  }
  return undefined;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodChange, initialMood }) => {
  const safeMood = normalizeMood(initialMood);
  const [selectedMood, setSelectedMood] = useState(safeMood?.mood || '');
  const [intensity, setIntensity] = useState(safeMood?.intensity || 3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(safeMood?.emotions || []);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMoodSelect = (moodName: string) => {
    setSelectedMood(moodName);
    updateMoodEntry(moodName, intensity, selectedEmotions, '');
  };

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    updateMoodEntry(selectedMood, newIntensity, selectedEmotions, '');
  };

  const handleEmotionToggle = (emotion: string) => {
    const newEmotions = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter(e => e !== emotion)
      : [...selectedEmotions, emotion];

    setSelectedEmotions(newEmotions);
    updateMoodEntry(selectedMood, intensity, newEmotions, '');
  };

  const updateMoodEntry = (mood: string, intensity: number, emotions: string[], note: string) => {
    if (mood) {
      const moodEntry: MoodEntry = {
        mood,
        intensity,
        emotions,
        note: note || undefined,
        timestamp: new Date(),
      };
      onMoodChange(moodEntry);
    }
  };

  const getSelectedMoodData = () => {
    return MOODS.find(m => m.name === selectedMood);
  };

  const getIntensityLabel = (level: number) => {
    const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return labels[level - 1];
  };

  return (
    <div
      style={{
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        background: '#fafafa',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🎭</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Mood Tracker</div>
            {selectedMood && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {getSelectedMoodData()?.emoji} {selectedMood} • {getIntensityLabel(intensity)}
                {selectedEmotions.length > 0 && ` • ${selectedEmotions.length} emotions`}
              </div>
            )}
          </div>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#666',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          ▼
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '16px' }}>
          {/* Mood Selection */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}
            >
              How are you feeling?
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '8px',
              }}
            >
              {MOODS.map(mood => (
                <button
                  key={mood.name}
                  onClick={() => handleMoodSelect(mood.name)}
                  style={{
                    padding: '8px 4px',
                    border:
                      selectedMood === mood.name ? `2px solid ${mood.color}` : '1px solid #ddd',
                    borderRadius: '8px',
                    background: selectedMood === mood.name ? `${mood.color}15` : '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>{mood.emoji}</div>
                  <div>{mood.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Scale */}
          {selectedMood && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}
              >
                Intensity: {getIntensityLabel(intensity)}
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => handleIntensityChange(level)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: intensity === level ? '2px solid #007bff' : '1px solid #ddd',
                      background: intensity >= level ? '#007bff' : '#fff',
                      color: intensity >= level ? '#fff' : '#666',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emotion Tags */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}
            >
              What emotions are you experiencing? (Optional)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOTIONS.map(emotion => (
                <button
                  key={emotion}
                  onClick={() => handleEmotionToggle(emotion)}
                  style={{
                    padding: '4px 8px',
                    border: selectedEmotions.includes(emotion)
                      ? '1px solid #007bff'
                      : '1px solid #ddd',
                    borderRadius: '16px',
                    background: selectedEmotions.includes(emotion) ? '#007bff' : '#fff',
                    color: selectedEmotions.includes(emotion) ? '#fff' : '#666',
                    cursor: 'pointer',
                    fontSize: '11px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
