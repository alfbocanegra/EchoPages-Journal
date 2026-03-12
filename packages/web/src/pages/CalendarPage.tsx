import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarView } from '../components/journal/CalendarView';
import EntryCardStrict from '../components/common/EntryCardStrict';
import { useAuth } from '../context/AuthContext';
import { getEntries } from '../utils/storage';
import type { Entry } from '../components/editor/EntryList';
import CalendarEntryCard from '../components/common/CalendarEntryCard';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { passphrase } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [calendarViewMode, setCalendarViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!passphrase) return;
    getEntries(passphrase).then(setEntries);
  }, [passphrase]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEntrySelect = (entry: any) => {
    navigate('/editor', { state: { entry } });
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '16px 24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/favicon-48x48.png"
            alt="EchoPages"
            style={{ width: '32px', height: '32px' }}
            onError={e => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.textContent = '📖 EchoPages';
            }}
          />
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #fff, #e3f2fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            EchoPages
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/entries')}
            style={{
              height: '40px',
              padding: '0 16px',
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
            }}
          >
            📝 Entries
          </button>

          <button
            onClick={() => navigate('/editor')}
            style={{
              height: '40px',
              padding: '0 16px',
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.3)';
            }}
          >
            ✏️ Write
          </button>

          <button
            onClick={handleLogout}
            style={{
              height: '40px',
              padding: '0 16px',
              background: 'linear-gradient(45deg, #f44336, #d32f2f)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <CalendarView
          entries={entries}
          onDateSelect={handleDateSelect}
          onEntrySelect={handleEntrySelect}
          selectedDate={selectedDate}
        />

        {/* Selected Date Info */}
        {selectedDate && (
          <div
            style={{
              marginTop: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                color: 'white',
                fontSize: '18px',
              }}
            >
              📅{' '}
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            {/* Grid/List Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setCalendarViewMode('grid')}
                title="Grid view"
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background:
                    calendarViewMode === 'grid' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                📱
              </button>
              <button
                onClick={() => setCalendarViewMode('list')}
                title="List view"
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background:
                    calendarViewMode === 'list' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                📋
              </button>
            </div>
            {/* Entry Cards for selected date */}
            <div
              style={{
                marginBottom: '8px',
                color: 'red',
                fontWeight: 'bold',
                fontSize: '20px',
              }}
            >
              DIRECT FROM CALENDARPAGE
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'flex-start',
                marginTop: '8px',
              }}
            >
              {entries
                .filter(
                  entry =>
                    selectedDate &&
                    new Date(entry.date).toDateString() === selectedDate.toDateString()
                )
                .map(entry => (
                  <CalendarEntryCard key={entry.id} entry={entry} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
