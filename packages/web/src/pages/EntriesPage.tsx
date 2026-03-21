import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEntries, deleteEntry } from '../utils/storage';
import { Entry } from '../components/editor/EntryList';
import { logout, isJWTExpired } from '../services/authService';
import EntryCardStrict from '../components/common/EntryCardStrict';
import AppHeader from '../components/common/AppHeader';
import { TextField } from '@mui/material';

interface EntryStats {
  totalEntries: number;
  totalWords: number;
  entriesThisMonth: number;
  entriesThisYear: number;
  currentStreak: number;
  longestStreak: number;
  averageWordsPerEntry: number;
  mostUsedTags: { tag: string; count: number }[];
  entriesByMonth: { month: string; count: number }[];
}

export const EntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { jwt, passphrase } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<EntryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [viewMode, _setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterTag, _setFilterTag] = useState<string>('');
  const [filterFolder, _setFilterFolder] = useState<string>('');
  const [searchQuery, _setSearchQuery] = useState<string>('');
  const [attachmentPreview, setAttachmentPreview] = useState<string[] | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

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
      calculateStats(loadedEntries);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setLoading(false);
    }
  };

  const calculateStats = (entries: Entry[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalWords = entries.reduce((sum, entry) => {
      const wordCount = entry.content
        .replace(/<[^>]+>/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0).length;
      return sum + wordCount;
    }, 0);

    const entriesThisMonth = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    }).length;

    const entriesThisYear = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear;
    }).length;

    // Calculate streaks
    const sortedDates = entries
      .map(entry => new Date(entry.date).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (currentDate.toDateString() === expectedDate.toDateString()) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Most used tags
    const tagCounts: { [key: string]: number } = {};
    entries.forEach(entry => {
      entry.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const mostUsedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Entries by month for the last 12 months
    const entriesByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const count = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === date.getMonth() && entryDate.getFullYear() === date.getFullYear()
        );
      }).length;
      entriesByMonth.push({ month: monthName, count });
    }

    setStats({
      totalEntries: entries.length,
      totalWords,
      entriesThisMonth,
      entriesThisYear,
      currentStreak,
      longestStreak,
      averageWordsPerEntry: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
      mostUsedTags,
      entriesByMonth,
    });
  };

  const handleDeleteEntry = async (id: string) => {
    if (!passphrase) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(id, passphrase);
      await loadEntries();
    }
  };

  const handleEditEntry = (entry: Entry) => {
    // Navigate to editor with entry data
    navigate('/editor', { state: { editEntry: entry } });
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || entry.tags?.includes(filterTag);
    const matchesFolder = !filterFolder || entry.folder === filterFolder;
    const entryDate = new Date(entry.date);
    const matchesStartDate = !filterStartDate || entryDate >= new Date(filterStartDate);
    const matchesEndDate = !filterEndDate || entryDate <= new Date(filterEndDate);
    return matchesSearch && matchesTag && matchesFolder && matchesStartDate && matchesEndDate;
  });

  const _allTags = [...new Set(entries.flatMap(entry => entry.tags || []))];
  const _allFolders = [...new Set(entries.map(entry => entry.folder))];

  const _navButtonStyle = {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: 'white', fontSize: 18 }}>Loading your entries...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Unified App Header */}
      <AppHeader stats={stats || undefined} showSyncStatus showEncryption />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <TextField
          label="Start Date"
          type="date"
          value={filterStartDate}
          onChange={e => setFilterStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="End Date"
          type="date"
          value={filterEndDate}
          onChange={e => setFilterEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        {/* Existing filters (tag, folder, search) can remain here */}
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          {/* Writing Streak */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
            }}
          >
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              Writing Streak
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>
              {stats.currentStreak}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Days • Best: {stats.longestStreak} days
            </div>
          </div>

          {/* Total Entries */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)',
            }}
          >
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Entries</div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>
              {stats.totalEntries}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {stats.entriesThisMonth} this month
            </div>
          </div>

          {/* Words Written */}
          <div
            style={{
              background: 'linear-gradient(135deg, #A8E6CF, #7FCDCD)',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(168, 230, 207, 0.3)',
            }}
          >
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Words Written</div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>
              {stats.totalWords.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              ~{stats.averageWordsPerEntry} per entry
            </div>
          </div>

          {/* This Year */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFD93D, #FF6B6B)',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(255, 217, 61, 0.3)',
            }}
          >
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>This Year</div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>
              {stats.entriesThisYear}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Entries in {new Date().getFullYear()}
            </div>
          </div>
        </div>
      )}

      {/* Entries Grid/List */}
      <div
        style={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns:
            viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : undefined,
          flexDirection: viewMode === 'list' ? 'column' : undefined,
          gap: '16px',
        }}
      >
        {filteredEntries.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '18px',
            }}
          >
            {entries.length === 0 ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <div>No entries yet. Start writing your first entry!</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div>No entries match your search criteria.</div>
              </>
            )}
          </div>
        ) : (
          filteredEntries.map(entry => (
            <EntryCardStrict
              key={entry.id}
              entry={entry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onClick={setSelectedEntry}
            />
          ))
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
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
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedEntry(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              width: '100%',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                zIndex: 10,
              }}
            >
              ×
            </button>
            {/* Edit/Delete buttons (top-right, hover only) */}
            <div
              className="entry-actions"
              style={{
                position: 'absolute',
                top: '18px',
                right: '54px',
                display: 'flex',
                gap: '8px',
                opacity: 0,
                visibility: 'hidden',
                transition: 'all 0.3s ease',
                zIndex: 10,
              }}
            >
              <button
                onClick={() => handleEditEntry(selectedEntry)}
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
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => {
                  setSelectedEntry(null);
                  handleDeleteEntry(selectedEntry.id);
                }}
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
              >
                🗑️ Delete
              </button>
            </div>
            {/* First line: Date and time */}
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(40,40,40,0.65)',
                marginBottom: '7px',
                fontWeight: 500,
              }}
            >
              {new Date(selectedEntry.date).toLocaleString()}
            </div>
            {/* Second line: Mood (if present) */}
            <div
              style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '7px' }}
            >
              {selectedEntry.mood
                ? `${selectedEntry.mood.mood} (${selectedEntry.mood.intensity}/5)`
                : ''}
            </div>
            {/* Third line: Entry content */}
            <div
              style={{
                fontSize: '15px',
                color: '#222',
                whiteSpace: 'pre-wrap',
                marginTop: 12,
                maxHeight: '50vh',
                overflowY: 'auto',
                resize: 'vertical',
                minHeight: '100px',
                padding: '8px',
                background: '#f8f8f8',
                borderRadius: '8px',
                border: '1px solid #eee',
              }}
            >
              {selectedEntry.content.replace(/<[^>]+>/g, '')}
            </div>
          </div>
        </div>
      )}

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

function _getMoodEmoji(mood: string) {
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
