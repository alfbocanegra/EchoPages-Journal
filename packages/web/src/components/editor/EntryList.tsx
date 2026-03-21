import React from 'react';
import type { EntrySearchFilters } from './EntrySearch';
import { EntryCalendar } from './EntryCalendar';

export interface Entry {
  id: string;
  title: string;
  tags: string[];
  folder: string;
  date: string;
  content: string;
  pinned?: boolean;
  images?: string[];
  mood?: {
    mood: string;
    intensity: number;
    emotions: string[];
    note?: string;
  };
}

const FOLDERS = ['Inbox', 'Personal', 'Work', 'Health', 'Travel', 'Ideas', 'Archive'];

export const EntryList: React.FC<{
  entries: Entry[];
  filters: EntrySearchFilters;
  onSelect: (entry: Entry) => void;
  search: string | null;
  onSearch: (search: string) => void;
  onEdit?: (entry: Entry) => void;
  onDelete?: (id: string) => void;
  onPinToggle?: (entry: Entry) => void;
}> = ({
  entries,
  filters: _filters,
  onSelect: _onSelect,
  search,
  onSearch: _onSearch,
  onEdit,
  onDelete,
  onPinToggle,
}) => {
  const [view, setView] = React.useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = React.useState<Entry | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [editEntry, setEditEntry] = React.useState<Entry | null>(null);
  const [allEntries, setAllEntries] = React.useState(entries);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  React.useEffect(() => {
    setAllEntries(entries);
  }, [entries]);

  const handleEdit = () => {
    setEditEntry(selectedEntry);
    setEditMode(true);
  };
  const handleEditChange = (field: keyof Entry, value: string | string[]) => {
    if (!editEntry) return;
    if (Array.isArray(value)) {
      setEditEntry({ ...editEntry, [field]: value });
    } else {
      setEditEntry({ ...editEntry, [field]: value });
    }
  };
  const handleEditTags = (value: string) => {
    if (!editEntry) return;
    setEditEntry({
      ...editEntry,
      tags: value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    });
  };
  const handleEditSave = () => {
    if (!editEntry) return;
    setAllEntries(allEntries.map(e => (e.id === editEntry.id ? editEntry : e)));
    setSelectedEntry(editEntry);
    setEditMode(false);
    setEditEntry(null);
    if (onEdit) onEdit(editEntry);
  };
  const handleEditCancel = () => {
    setEditMode(false);
    setEditEntry(null);
  };
  const handleDelete = () => {
    if (!selectedEntry) return;
    setAllEntries(allEntries.filter(e => e.id !== selectedEntry.id));
    setSelectedEntry(null);
    setEditMode(false);
    setEditEntry(null);
    setDeleteConfirm(false);
    if (onDelete) onDelete(selectedEntry.id);
  };
  const handleExport = (entry: Entry) => {
    const blob = new Blob(
      [
        `Title: ${entry.title}\n`,
        `Date: ${new Date(entry.date).toLocaleString()}\n`,
        `Folder: ${entry.folder}\n`,
        `Tags: ${entry.tags.join(', ')}\n\n`,
        entry.content,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.title || 'entry'}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  const handleShare = async (entry: Entry) => {
    const text = `Title: ${entry.title}\nDate: ${new Date(entry.date).toLocaleString()}\nFolder: ${
      entry.folder
    }\nTags: ${entry.tags.join(', ')}\n\n${entry.content}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: entry.title, text });
      } catch {
        /* intentionally empty */
      }
    } else {
      // fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Entry copied to clipboard!');
    }
  };
  const handlePinToggleLocal = (entry: Entry) => {
    setAllEntries(allEntries.map(e => (e.id === entry.id ? { ...e, pinned: !e.pinned } : e)));
    if (selectedEntry && selectedEntry.id === entry.id) {
      setSelectedEntry({ ...entry, pinned: !entry.pinned });
    }
    if (onPinToggle) onPinToggle(entry);
  };

  const filteredEntries = React.useMemo(() => {
    let filtered = allEntries;
    if (search) {
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          (e.content && e.content.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (view === 'calendar' && selectedDate) {
      filtered = filtered.filter(e => e.date.slice(0, 10) === selectedDate);
    }
    // Pinned entries first
    filtered = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return filtered;
  }, [allEntries, search, view, selectedDate]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => setView('list')} disabled={view === 'list'}>
          List View
        </button>
        <button onClick={() => setView('calendar')} disabled={view === 'calendar'}>
          Calendar View
        </button>
      </div>
      {view === 'calendar' && (
        <>
          <EntryCalendar entries={entries} onDateSelect={date => setSelectedDate(date)} />
          {selectedDate && (
            <div style={{ marginBottom: 12, fontWeight: 500 }}>Entries for {selectedDate}</div>
          )}
        </>
      )}
      <div style={{ marginBottom: 32 }}>
        {filteredEntries.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic' }}>No entries found.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredEntries.map(e => (
              <li
                key={e.id}
                style={{
                  marginBottom: 18,
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  background: '#fafbfc',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedEntry(e)}
                tabIndex={0}
                aria-label={`Open entry ${e.title}`}
              >
                <div style={{ fontWeight: 600, fontSize: 18 }}>{e.title || '(Untitled)'}</div>
                <div style={{ fontSize: 13, color: '#888', margin: '4px 0' }}>
                  {e.folder} • {new Date(e.date).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0' }}>
                  {e.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#e0e0e0',
                        borderRadius: 10,
                        padding: '1px 8px',
                        fontSize: 12,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#444',
                    marginTop: 4,
                    maxHeight: 40,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {e.content.slice(0, 120)}
                  {e.content.length > 120 ? '…' : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          editMode={editMode}
          editEntry={editEntry}
          onEdit={handleEdit}
          onEditChange={handleEditChange}
          onEditTags={handleEditTags}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onDelete={handleDelete}
          onPinToggle={handlePinToggleLocal}
          onShare={handleShare}
          onExport={handleExport}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          onClose={() => {
            setSelectedEntry(null);
            setEditMode(false);
            setEditEntry(null);
            setDeleteConfirm(false);
          }}
        />
      )}
    </div>
  );
};

const EntryModalToolbar: React.FC<{
  pinned: boolean;
  onPinToggle: () => void;
  onShare: () => void;
  onExport: () => void;
}> = ({ pinned, onPinToggle, onShare, onExport }) => (
  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
    <button
      onClick={onPinToggle}
      style={{
        background: 'none',
        border: 'none',
        fontSize: 28,
        cursor: 'pointer',
        color: pinned ? '#ffd600' : '#bbb',
        width: 44,
        height: 44,
        lineHeight: '44px',
        textAlign: 'center',
        borderRadius: 22,
      }}
      aria-label={pinned ? 'Unpin entry' : 'Pin entry'}
      tabIndex={0}
    >
      {pinned ? '★' : '☆'}
    </button>
    <button
      onClick={onShare}
      style={{
        background: 'none',
        border: 'none',
        fontSize: 22,
        cursor: 'pointer',
        color: '#0288d1',
        width: 44,
        height: 44,
        borderRadius: 22,
      }}
      aria-label="Share entry"
      tabIndex={0}
      title="Share entry"
    >
      <span role="img" aria-label="Share">
        🔗
      </span>
    </button>
    <button
      onClick={onExport}
      style={{
        background: 'none',
        border: 'none',
        fontSize: 22,
        cursor: 'pointer',
        color: '#0288d1',
        width: 44,
        height: 44,
        borderRadius: 22,
      }}
      aria-label="Export entry"
      tabIndex={0}
      title="Export entry as .txt"
    >
      <span role="img" aria-label="Export">
        ⬇️
      </span>
    </button>
  </div>
);

const EntryModal: React.FC<{
  entry: Entry;
  editMode: boolean;
  editEntry: Entry | null;
  onEdit: () => void;
  onEditChange: (field: keyof Entry, value: string | string[]) => void;
  onEditTags: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onPinToggle: (entry: Entry) => void;
  onShare: (entry: Entry) => void;
  onExport: (entry: Entry) => void;
  deleteConfirm: boolean;
  setDeleteConfirm: (v: boolean) => void;
  onClose: () => void;
}> = ({
  entry,
  editMode,
  editEntry,
  onEdit,
  onEditChange,
  onEditTags,
  onEditSave,
  onEditCancel,
  onDelete,
  onPinToggle,
  onShare,
  onExport,
  deleteConfirm,
  setDeleteConfirm,
  onClose,
}) => {
  const touchStartY = React.useRef<number | null>(null);
  const touchEndY = React.useRef<number | null>(null);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;
  const [step, setStep] = React.useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      touchEndY.current = e.changedTouches[0].clientY;
      if (touchEndY.current - touchStartY.current > 60) {
        onClose();
      }
      touchStartY.current = null;
      touchEndY.current = null;
    }
  };

  const safeImages = editEntry && Array.isArray(editEntry.images) ? editEntry.images : [];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.35)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
      }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={e => e.stopPropagation()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          maxWidth: 480,
          width: '90vw',
          padding: 32,
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          position: 'relative',
          touchAction: 'manipulation',
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editMode ? `Edit entry: ${editEntry?.title}` : `Entry details: ${entry.title}`}
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 28,
            cursor: 'pointer',
            color: '#888',
            width: 44,
            height: 44,
            lineHeight: '44px',
            textAlign: 'center',
            borderRadius: 22,
          }}
          aria-label="Close entry details"
          tabIndex={0}
        >
          ×
        </button>
        <EntryModalToolbar
          pinned={entry.pinned || false}
          onPinToggle={() => onPinToggle(entry)}
          onShare={() => onShare(entry)}
          onExport={() => onExport(entry)}
        />
        {editMode && editEntry ? (
          <>
            {isMobile && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setStep(0)} style={{ fontWeight: step === 0 ? 700 : 400 }}>
                  Content
                </button>
                <button onClick={() => setStep(1)} style={{ fontWeight: step === 1 ? 700 : 400 }}>
                  Attachments
                </button>
                <button onClick={() => setStep(2)} style={{ fontWeight: step === 2 ? 700 : 400 }}>
                  Metadata
                </button>
              </div>
            )}
            {(!isMobile || step === 0) && (
              <div style={{ display: isMobile && step !== 0 ? 'none' : undefined }}>
                <label htmlFor="edit-title" className="sr-only">
                  Edit title
                </label>
                <input
                  id="edit-title"
                  value={editEntry.title}
                  onChange={e => onEditChange('title', e.target.value)}
                  style={{
                    fontWeight: 600,
                    fontSize: 20,
                    width: '100%',
                    marginBottom: 8,
                    padding: 4,
                  }}
                  aria-label="Edit title"
                />
                <label htmlFor="edit-content" className="sr-only">
                  Edit content
                </label>
                <textarea
                  id="edit-content"
                  value={editEntry.content}
                  onChange={e => onEditChange('content', e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 120,
                    padding: 8,
                    fontSize: 15,
                    color: '#222',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                  }}
                  aria-label="Edit content"
                />
              </div>
            )}
            {(!isMobile || step === 1) && (
              <div style={{ display: isMobile && step !== 1 ? 'none' : undefined }}>
                {safeImages.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Images:</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {safeImages.map((url, i) => (
                        <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={url}
                            alt={`attachment-${i}`}
                            style={{
                              maxWidth: 120,
                              maxHeight: 120,
                              borderRadius: 4,
                              border: '1px solid #ccc',
                            }}
                          />
                          <button
                            onClick={() =>
                              onEditChange(
                                'images',
                                safeImages.filter((_: any, _idx: number) => _idx !== i)
                              )
                            }
                            aria-label="Remove image"
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: '#fff',
                              border: '1px solid #ccc',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              fontSize: 16,
                              color: '#d32f2f',
                              cursor: 'pointer',
                              zIndex: 2,
                            }}
                            tabIndex={0}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {(!isMobile || step === 2) && (
              <div style={{ display: isMobile && step !== 2 ? 'none' : undefined }}>
                <input
                  value={editEntry.tags.join(', ')}
                  onChange={e => onEditTags(e.target.value)}
                  style={{ width: '100%', padding: 4, marginBottom: 8 }}
                  aria-label="Edit tags (comma separated)"
                />
                <select
                  value={editEntry.folder}
                  onChange={e => onEditChange('folder', e.target.value)}
                  style={{ padding: 4, marginBottom: 8 }}
                  aria-label="Edit folder"
                >
                  {FOLDERS.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {isMobile && (
              <div
                style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'space-between' }}
              >
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                  Back
                </button>
                <button onClick={() => setStep(s => Math.min(2, s + 1))} disabled={step === 2}>
                  Next
                </button>
              </div>
            )}
            <div
              style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'space-between' }}
            >
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{
                  padding: '6px 18px',
                  background: '#fff',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: 4,
                }}
              >
                Delete
              </button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={onEditCancel} style={{ padding: '6px 18px' }}>
                  Cancel
                </button>
                <button
                  onClick={onEditSave}
                  style={{
                    padding: '6px 18px',
                    background: '#0288d1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>{entry.title || '(Untitled)'}</h2>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
              {entry.folder} • {new Date(entry.date).toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {entry.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: '#e0e0e0',
                    borderRadius: 10,
                    padding: '1px 8px',
                    fontSize: 12,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 15, color: '#222', whiteSpace: 'pre-wrap', marginTop: 12 }}>
              {entry.content}
            </div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{
                  padding: '6px 18px',
                  background: '#fff',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: 4,
                }}
              >
                Delete
              </button>
              <button
                onClick={onEdit}
                style={{
                  padding: '6px 18px',
                  background: '#0288d1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                }}
              >
                Edit
              </button>
            </div>
          </>
        )}
        {deleteConfirm && (
          <div
            style={{
              marginTop: 24,
              background: '#fff3e0',
              border: '1px solid #ffb300',
              borderRadius: 8,
              padding: 16,
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: 12, color: '#d32f2f', fontWeight: 500 }}>
              Are you sure you want to delete this entry? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={onDelete}
                style={{
                  padding: '6px 18px',
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                }}
              >
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(false)} style={{ padding: '6px 18px' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <style>{`
          @media (max-width: 600px) {
            div[role='dialog'] {
              padding: 12px !important;
              max-width: 98vw !important;
              border-radius: 8px !important;
            }
            button, input, textarea, select {
              font-size: 1.1rem !important;
              min-height: 44px !important;
              min-width: 44px !important;
            }
            h2 {
              font-size: 1.2rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
