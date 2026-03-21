import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarViewFixed } from '../components/journal/CalendarViewFixed';
import { useAuth } from '../context/AuthContext';
import { getEntries, deleteEntry } from '../utils/storage';
import { Entry } from '../components/editor/EntryList';
import { isJWTExpired, logout } from '../services/authService';
import AppHeader from '../components/common/AppHeader';

export const CalendarPageWorking: React.FC = () => {
  const navigate = useNavigate();
  const { jwt, passphrase } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [attachmentPreview, setAttachmentPreview] = useState<string[] | null>(null);

  useEffect(() => {
    if (!jwt || isJWTExpired()) {
      logout();
      navigate('/');
      return;
    }
    loadEntries();
  }, [jwt, passphrase]);

  const loadEntries = async () => {
    if (!passphrase) return;
    try {
      const loadedEntries = await getEntries(passphrase);
      setEntries(loadedEntries);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setLoading(false);
    }
  };

  // Convert Entry[] to the format expected by CalendarViewFixed
  const calendarEntries = entries.map(entry => ({
    id: entry.id,
    date: new Date(entry.date),
    title: entry.title,
    content: entry.content,
    mood: {
      mood: 'Neutral',
      intensity: 3,
      emotions: [],
    },
    wordCount: entry.content
      .replace(/<[^>]+>/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0).length,
    attachments: entry.images ? entry.images.length : 0,
    images: entry.images || [],
  }));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEntryEdit = (entry: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Find the original entry from the entries array to get the proper Entry type
    const originalEntry = entries.find(e => e.id === entry.id);
    if (originalEntry) {
      navigate('/editor', { state: { editEntry: originalEntry } });
    }
  };

  const handleEntryDelete = async (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!passphrase) return;

    const entry = entries.find(e => e.id === entryId);
    const entryTitle = entry?.title || 'this entry';

    if (confirm(`Are you sure you want to delete "${entryTitle}"?`)) {
      try {
        await deleteEntry(entryId, passphrase);
        await loadEntries(); // Reload entries after deletion
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const _handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  const _navButtonStyle = {
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
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      {/* Unified App Header */}
      <AppHeader />

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              color: 'white',
              fontSize: '18px',
            }}
          >
            Loading your entries...
          </div>
        ) : (
          <CalendarViewFixed
            entries={calendarEntries}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        )}

        {/* Selected Date Info */}
        {selectedDate && !loading && (
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

            {calendarEntries.filter(
              entry => entry.date.toDateString() === selectedDate.toDateString()
            ).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {calendarEntries
                  .filter(entry => entry.date.toDateString() === selectedDate.toDateString())
                  .map(entry => (
                    <div
                      key={entry.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        cursor: 'pointer',
                        minWidth: '260px',
                        maxWidth: '600px',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        const actionButtons = e.currentTarget.querySelector(
                          '.entry-actions'
                        ) as HTMLElement;
                        if (actionButtons) {
                          actionButtons.style.opacity = '1';
                          actionButtons.style.visibility = 'visible';
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        const actionButtons = e.currentTarget.querySelector(
                          '.entry-actions'
                        ) as HTMLElement;
                        if (actionButtons) {
                          actionButtons.style.opacity = '0';
                          actionButtons.style.visibility = 'hidden';
                        }
                      }}
                    >
                      {/* Action Buttons (Edit/Delete) */}
                      <div
                        className="entry-actions"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          display: 'flex',
                          gap: '8px',
                          opacity: '0',
                          visibility: 'hidden',
                          transition: 'all 0.3s ease',
                          zIndex: 10,
                        }}
                      >
                        <button
                          onClick={e => handleEntryEdit(entry, e)}
                          style={{
                            background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.4)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.3)';
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={e => handleEntryDelete(entry.id, e)}
                          style={{
                            background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      {/* First line: Date and time */}
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.7)',
                          marginBottom: '4px',
                        }}
                      >
                        {entry.date.toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {/* Second line: Mood */}
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: 'white',
                          marginBottom: '4px',
                        }}
                      >
                        {entry.mood ? ` ${entry.mood.mood} (${entry.mood.intensity}/5)` : ''}
                      </div>
                      {/* Third line: Entry content */}
                      <div style={{ fontSize: '15px', color: 'white' }}>
                        {entry.content.replace(/<[^>]+>/g, '')}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: '20px',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  No entries for this date
                </div>
                <button
                  onClick={() => navigate('/editor', { state: { selectedDate } })}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '8px',
                  }}
                >
                  ✏️ Create Entry for This Date
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attachment Preview Modal */}
      {attachmentPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setAttachmentPreview(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflow: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setAttachmentPreview(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 18,
                background: 'none',
                border: 'none',
                fontSize: '28px',
                color: '#666',
                cursor: 'pointer',
              }}
              title="Close preview"
            >
              ×
            </button>
            <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Attachments</h3>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}
            >
              {attachmentPreview.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Attachment ${idx + 1}`}
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
