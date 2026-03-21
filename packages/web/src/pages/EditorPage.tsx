import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RichTextEditor } from '../components/editor/RichTextEditor';
import { EntryMetadata } from '../components/editor/EntryMetadata';
import { EntryTemplates } from '../components/editor/EntryTemplates';
import { getInitialEditorPrefs, EditorPrefs } from '../components/editor/EditorPreferences';
import { TagInput } from '../components/editor/TagInput';
import { FolderSelect } from '../components/editor/FolderSelect';
import { Entry } from '../components/editor/EntryList';
import { logout, isJWTExpired } from '../services/authService';
import { getEntries, addEntry, saveEntries } from '../utils/storage';
import ThemeButton from '../components/common/ThemeButton';
import ThemeCard from '../components/common/ThemeCard';
import { ConflictResolutionModal } from '../components/editor/ConflictResolutionModal';
import { SyncNotificationBar } from '../components/common/SyncNotificationBar';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/common/AppHeader';

export const EditorPage: React.FC = () => {
  const _navigate = useNavigate();
  const location = useLocation();
  const { jwt, deviceId: _deviceId, passphrase } = useAuth();
  const [expired, setExpired] = useState(false);
  const [templateContent, setTemplateContent] = useState<string>('');
  const [prefs, _setPrefs] = useState<EditorPrefs>(getInitialEditorPrefs());
  const [tags, setTags] = useState<string[]>([]);
  const [folder, setFolder] = useState<string>('Inbox');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [encryptionStatus, setEncryptionStatus] = useState<'locked' | 'unlocked' | 'error'>(
    'locked'
  );
  const [editorContent, setEditorContent] = useState('');
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictEntry, setConflictEntry] = useState<{ local: Entry; remote: Entry } | null>(null);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<any>(null);

  // Ref and state for scrolling to SyncStatus
  const syncStatusRef = useRef<HTMLDivElement>(null);
  const handleShowConflicts = () => {
    if (syncStatusRef.current) {
      syncStatusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (!jwt || isJWTExpired()) {
      logout();
      setExpired(true);
    }
    let timer: NodeJS.Timeout | undefined;
    if (jwt && !isJWTExpired()) {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      timer = setTimeout(() => {
        logout();
        setExpired(true);
      }, msUntilExpiry);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [jwt]);

  useEffect(() => {
    // Load entries when passphrase is available
    if (!passphrase) return;
    setEncryptionStatus('locked');
    (async () => {
      try {
        const loaded = await getEntries(passphrase);
        setEntries(loaded);
        setEncryptionStatus('unlocked');
        // Check if we're editing an existing entry
        const editEntry = (location.state as any)?.editEntry;
        if (editEntry) {
          setEditorContent(editEntry.content);
          setTags(editEntry.tags || []);
          setFolder(editEntry.folder || 'Inbox');
          setEditEntryId(editEntry.id || null);
          setCurrentMood(editEntry.mood || null);
          // Clear the location state to prevent re-loading on refresh
          window.history.replaceState({}, document.title);
        } else {
          setEditEntryId(null);
          setCurrentMood(null);
        }
      } catch {
        setEncryptionStatus('error');
      }
    })();
  }, [passphrase, location.state]);

  // Watch for conflicts in entries
  useEffect(() => {
    const conflicted = entries.find(e => (e as any).syncStatus === 'conflict');
    if (conflicted) {
      // For demo, use the same entry as both local and remote (in real app, store both versions)
      setConflictEntry({ local: conflicted, remote: conflicted });
      setConflictModalOpen(true);
    } else {
      setConflictModalOpen(false);
      setConflictEntry(null);
    }
  }, [entries]);

  if (!jwt || expired) {
    return (
      <div style={{ color: 'red', padding: 32 }}>
        Your session has expired. Please log in again.
      </div>
    );
  }

  if (encryptionStatus !== 'unlocked') {
    return (
      <div style={{ color: '#0288d1', padding: 32 }}>
        {encryptionStatus === 'locked' && 'Unlocking your encrypted journal...'}
        {encryptionStatus === 'error' &&
          'Failed to unlock journal. Please reload and check your passphrase.'}
      </div>
    );
  }

  const _handleQuickSave = async (content: string) => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      title: content.slice(0, 32),
      tags: [],
      folder: 'Inbox',
      date: new Date().toISOString(),
      content,
    };
    await addEntry(newEntry, passphrase);
    setEntries(await getEntries(passphrase));
  };

  const _handleEditorInput = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Defensive normalization for currentMood
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

  // Handler for RichTextEditor content and images
  const handleEditorChange = (content: string, images: string[], mood?: any) => {
    setEditorContent(content);
    setEditorImages(images);
    setCurrentMood(normalizeMood(mood));
  };

  // Utility to sanitize content (remove <br> tags at start/end and excessive <br><br>)
  function sanitizeContent(content: string): string {
    // Remove leading/trailing <br> and collapse multiple <br> to one
    return content
      .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>') // collapse multiple <br>
      .replace(/^(<br\s*\/?>)+/i, '') // remove leading <br>
      .replace(/(<br\s*\/?>)+$/i, '') // remove trailing <br>
      .replace(/&nbsp;/g, ' '); // replace &nbsp; with space
  }

  const handleSaveEntry = async () => {
    if (!editorContent.trim()) return;
    setSaving(true);
    const sanitizedContent = sanitizeContent(editorContent);
    const safeMood = normalizeMood(currentMood);
    if (editEntryId) {
      // Update existing entry
      const updatedEntries = entries.map(e =>
        e.id === editEntryId
          ? {
              ...e,
              content: sanitizedContent,
              title: sanitizedContent.replace(/<[^>]+>/g, '').slice(0, 32) || 'Untitled',
              tags,
              folder,
              images: editorImages,
              date: new Date().toISOString(),
              mood: safeMood,
            }
          : e
      );
      await saveEntries(updatedEntries, passphrase);
      setEntries(await getEntries(passphrase));
    } else {
      // Create new entry
      const newEntry: Entry = {
        id: Date.now().toString(),
        title: sanitizedContent.replace(/<[^>]+>/g, '').slice(0, 32) || 'Untitled',
        tags,
        folder,
        date: new Date().toISOString(),
        content: sanitizedContent,
        images: editorImages,
        mood: safeMood,
      };
      await addEntry(newEntry, passphrase);
      setEntries(await getEntries(passphrase));
    }
    setSaving(false);
    setEditorContent('');
    setEditorImages([]);
    setTags([]);
    setFolder('Inbox');
    setEditEntryId(null);
    setCurrentMood(null);
  };

  const handleResolveConflict = async (resolved: Entry) => {
    // Update entry, clear conflict
    const updated = entries.map(e =>
      e.id === resolved.id ? { ...resolved, syncStatus: undefined } : e
    );
    await saveEntries(updated, passphrase);
    setEntries(await getEntries(passphrase));
    setConflictModalOpen(false);
    setConflictEntry(null);
  };

  const _navButtonStyle = {
    height: 40,
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    padding: '0 16px',
    fontWeight: 600,
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
  };

  return (
    <>
      <SyncNotificationBar onShowConflicts={handleShowConflicts} />
      <div
        id="main-content"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: prefs.darkMode ? '#f1f3f4' : '#1e293b',
          minHeight: '100vh',
          transition: 'all 0.3s ease',
          fontSize: prefs.fontSize,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: '40px 20px 20px 20px',
        }}
      >
        {/* Unified App Header */}
        <AppHeader showSyncStatus showEncryption />

        {/* Main Content */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '32px',
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          {/* Editor Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Editor Preferences removed - now only in Settings */}

            {/* New Journal Entry */}
            <ThemeCard
              style={{
                padding: 24,
                background: prefs.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${prefs.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 16,
                backdropFilter: 'blur(10px)',
                flex: 1,
              }}
            >
              <h2
                style={{
                  margin: '0 0 24px 0',
                  fontSize: 24,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span>✍️</span>
                New Journal Entry
              </h2>

              {/* Entry Templates */}
              <div style={{ marginBottom: 20 }}>
                <EntryTemplates onTemplateSelect={setTemplateContent} />
              </div>

              {/* Metadata Controls */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 20,
                  alignItems: 'end',
                }}
              >
                <div>
                  <FolderSelect folder={folder} onChange={setFolder} />
                </div>
                <div>
                  <TagInput tags={tags} onChange={setTags} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <EntryMetadata />
              </div>

              {/* Rich Text Editor */}
              <div
                style={{
                  border: `2px solid ${
                    prefs.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: prefs.darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                  minHeight: 300,
                }}
              >
                <RichTextEditor
                  initialContent={templateContent}
                  value={editorContent}
                  images={editorImages}
                  onChange={(content, images, mood) => handleEditorChange(content, images, mood)}
                  currentMood={currentMood}
                  onMoodChange={setCurrentMood}
                />
              </div>

              {/* Save Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: 20,
                }}
              >
                <ThemeButton
                  title={saving ? 'Saving...' : 'Save Entry'}
                  onClick={handleSaveEntry}
                  disabled={saving || !editorContent.trim()}
                  style={{
                    height: 44,
                    minHeight: 44,
                    padding: '0 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    background:
                      saving || !editorContent.trim()
                        ? 'rgba(156, 163, 175, 0.5)'
                        : 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    color: 'white',
                    borderRadius: 12,
                    boxShadow:
                      saving || !editorContent.trim()
                        ? 'none'
                        : '0 4px 16px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
            </ThemeCard>
          </div>
        </div>

        {/* Conflict Resolution Modal */}
        {conflictEntry && (
          <ConflictResolutionModal
            open={conflictModalOpen}
            local={conflictEntry.local}
            remote={conflictEntry.remote}
            onResolve={handleResolveConflict}
            onClose={() => setConflictModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};
