import React, { useState } from 'react';

interface CalendarViewProps {
  entries: JournalEntry[];
  onDateSelect: (date: Date) => void;
  onEntrySelect?: (entry: JournalEntry) => void;
  selectedDate?: Date;
}

interface JournalEntry {
  id: string;
  date: Date;
  title?: string;
  content: string;
  mood?: {
    mood: string;
    intensity: number;
    emotions: string[];
  };
  wordCount?: number;
  attachments?: number;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOOD_COLORS: { [key: string]: string } = {
  Happy: '#4CAF50',
  Sad: '#2196F3',
  Angry: '#F44336',
  Anxious: '#FF9800',
  Tired: '#9C27B0',
  Calm: '#00BCD4',
  Thoughtful: '#795548',
  Excited: '#E91E63',
  Disappointed: '#607D8B',
  Content: '#8BC34A',
  Frustrated: '#FF5722',
};

export const CalendarViewFixed: React.FC<CalendarViewProps> = ({
  entries,
  onDateSelect,
  onEntrySelect,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper functions
  const getEntriesForDate = (date: Date): JournalEntry[] => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  const getDayIntensity = (date: Date): number => {
    const dayEntries = getEntriesForDate(date);
    if (dayEntries.length === 0) return 0;

    const totalWords = dayEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    if (totalWords === 0) return 1;
    if (totalWords < 100) return 2;
    if (totalWords < 300) return 3;
    if (totalWords < 500) return 4;
    return 5;
  };

  const getDominantMood = (date: Date): string | null => {
    const dayEntries = getEntriesForDate(date);
    if (dayEntries.length === 0) return null;

    const moodCounts: { [key: string]: number } = {};
    dayEntries.forEach(entry => {
      if (entry.mood?.mood) {
        moodCounts[entry.mood.mood] = (moodCounts[entry.mood.mood] || 0) + 1;
      }
    });

    const moodKeys = Object.keys(moodCounts);
    if (moodKeys.length === 0) return null;

    const dominantMood = moodKeys.reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b));

    return dominantMood || null;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Calculate month stats
  const calculateMonthStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });

    return {
      totalEntries: monthEntries.length,
      totalWords: monthEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0),
      writingDays: new Set(monthEntries.map(entry => new Date(entry.date).getDate())).size,
      averageMood:
        monthEntries.length > 0
          ? monthEntries.reduce((sum, entry) => sum + (entry.mood?.intensity || 3), 0) /
            monthEntries.length
          : 0,
    };
  };

  const calendarDays = generateCalendarDays();
  const monthStats = calculateMonthStats();

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
            📅 {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigateMonth('prev')}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => navigateMonth('next')}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Month Stats */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <div>📝 {monthStats.totalEntries} entries</div>
          <div>📊 {monthStats.writingDays} days</div>
          <div>📝 {monthStats.totalWords} words</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '2px',
        }}
      >
        {/* Day Headers */}
        {DAYS.map(day => (
          <div
            key={day}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '12px 8px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#555',
              borderRadius: '8px',
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  minHeight: '80px',
                  opacity: 0.5,
                  borderRadius: '8px',
                }}
              />
            );
          }

          const dayEntries = getEntriesForDate(date);
          const intensity = getDayIntensity(date);
          const dominantMood = getDominantMood(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <div
              key={index}
              onClick={() => onDateSelect(date)}
              style={{
                background: selected ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                minHeight: '80px',
                padding: '8px',
                cursor: 'pointer',
                border: today
                  ? '2px solid #007bff'
                  : selected
                  ? '2px solid #2196F3'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!selected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={e => {
                if (!selected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: today ? 'bold' : 'normal',
                  color: today ? '#007bff' : '#333',
                  marginBottom: '4px',
                }}
              >
                {date.getDate()}
              </div>

              {/* Writing Intensity Indicator */}
              {intensity > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: `rgba(0, 123, 255, ${intensity * 0.2})`,
                    border: `1px solid rgba(0, 123, 255, ${intensity * 0.4})`,
                  }}
                />
              )}

              {/* Mood Indicator */}
              {dominantMood && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: MOOD_COLORS[dominantMood] || '#ccc',
                    border: '1px solid #fff',
                  }}
                />
              )}

              {/* Entry Count */}
              {dayEntries.length > 0 && (
                <div
                  style={{
                    fontSize: '10px',
                    color: '#666',
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                  }}
                >
                  {dayEntries.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
