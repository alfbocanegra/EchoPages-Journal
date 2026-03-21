import React, { useRef, useState, useEffect } from 'react';
import { VoiceRecorder } from '../media/VoiceRecorder';
import { FileAttachment } from '../media/FileAttachment';
import { MoodTracker } from '../journal/MoodTracker';
// import { AIJournalService } from '@echopages/shared';

// Temporary mock for AIJournalService
const AIJournalService = {
  generateSuggestions: async (content: string) => {
    return { suggestions: ['Temporary mock suggestion for: ' + content.slice(0, 50)] };
  },
  getPrompt: async () => {
    return "What are three things you're grateful for today?";
  },
  getReflectionSuggestion: async () => {
    return 'Consider how this experience has shaped your perspective and what you might do differently in the future.';
  },
};

const toolbarButtons = [
  { cmd: 'bold', label: 'Bold', icon: 'B' },
  { cmd: 'italic', label: 'Italic', icon: 'I' },
  { cmd: 'underline', label: 'Underline', icon: 'U' },
  { cmd: 'insertUnorderedList', label: 'Bulleted List', icon: '•' },
  { cmd: 'insertOrderedList', label: 'Numbered List', icon: '1.' },
  { cmd: 'formatBlock', arg: 'H1', label: 'Heading 1', icon: 'H1' },
  { cmd: 'formatBlock', arg: 'H2', label: 'Heading 2', icon: 'H2' },
  { cmd: 'justifyLeft', label: 'Align Left', icon: '⯇' },
  { cmd: 'justifyCenter', label: 'Align Center', icon: '≡' },
  { cmd: 'justifyRight', label: 'Align Right', icon: '⯈' },
  { cmd: 'formatBlock', arg: 'BLOCKQUOTE', label: 'Blockquote', icon: '❝' },
];

// Defensive normalization for mood prop
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

export const RichTextEditor: React.FC<{
  initialContent?: string;
  value?: string;
  images?: string[];
  onChange?: (content: string, images: string[], mood?: any) => void;
  currentMood?: any;
  onMoodChange?: (mood: any) => void;
}> = ({ initialContent, value, images: imagesProp, onChange, currentMood, onMoodChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(imagesProp || []);
  const [videos, setVideos] = useState<string[]>([]);
  const [audios, setAudios] = useState<string[]>([]);
  const [_attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageAlts, setImageAlts] = useState<string[]>([]);
  const [aiPrompt, setAIPrompt] = useState<string | null>(null);
  const [aiReflection, setAIReflection] = useState<string | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  const _lastMoodRef = useRef<{ mood: string; intensity: number; emotions: string[] } | null>(null);

  // Use normalized mood in the component
  const safeMood = normalizeMood(currentMood);

  useEffect(() => {
    if (typeof value === 'string' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    } else if (initialContent !== undefined && editorRef.current && !value) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [value, initialContent]);

  useEffect(() => {
    if (imagesProp && imagesProp !== images) setImages(imagesProp);
    setImageAlts(imgs =>
      imgs.length === (imagesProp?.length || 0) ? imgs : Array(imagesProp?.length || 0).fill('')
    );
  }, [imagesProp]);

  const handleCommand = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg || undefined);
    editorRef.current?.focus();
    triggerSave();
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        if (file.type.startsWith('image/')) {
          setImages(imgs => {
            const newImgs = [...imgs, url];
            setImageAlts(alts => [...alts, '']);
            if (onChange) onChange(editorRef.current?.innerHTML || '', newImgs, safeMood);
            return newImgs;
          });
          document.execCommand('insertImage', false, url);
        } else if (file.type.startsWith('video/')) {
          setVideos(vids => [...vids, url]);
        } else if (file.type.startsWith('audio/')) {
          setAudios(auds => [...auds, url]);
        }
        triggerSave();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInput = () => {
    triggerSave();
    if (onChange) onChange(editorRef.current?.innerHTML || '', images, safeMood);
  };

  const triggerSave = () => {
    setStatus('saving');
    if (saveTimeout) clearTimeout(saveTimeout);
    const timeout = setTimeout(() => {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1200);
    }, 800);
    setSaveTimeout(timeout);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          if (file.type.startsWith('image/')) {
            setImages(imgs => [...imgs, url]);
            setImageAlts(alts => [...alts, '']);
            document.execCommand('insertImage', false, url);
          } else if (file.type.startsWith('video/')) {
            setVideos(vids => [...vids, url]);
          } else if (file.type.startsWith('audio/')) {
            setAudios(auds => [...auds, url]);
          }
          triggerSave();
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFetchPrompt = async () => {
    setAILoading(true);
    setAIError(null);
    try {
      const prompt = await AIJournalService.getPrompt();
      setAIPrompt(prompt);
    } catch (e) {
      setAIError(e instanceof Error ? e.message : String(e));
    } finally {
      setAILoading(false);
    }
  };

  const handleFetchReflection = async () => {
    setAILoading(true);
    setAIError(null);
    try {
      const reflection = await AIJournalService.getReflectionSuggestion();
      setAIReflection(reflection);
    } catch (e) {
      setAIError(e instanceof Error ? e.message : String(e));
    } finally {
      setAILoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [saveTimeout]);

  const handleMoodChange = (mood: any) => {
    if (onMoodChange) onMoodChange(mood);
    if (onChange) onChange(editorRef.current?.innerHTML || '', images, mood);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16 }}>
      <div style={{ minHeight: 24, marginBottom: 4 }} aria-live="polite">
        {status === 'saving' && <span style={{ color: '#888' }}>Saving...</span>}
        {status === 'saved' && <span style={{ color: 'green' }}>✔ Saved</span>}
      </div>
      <div
        role="toolbar"
        aria-label="Editor toolbar"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 8,
          flexWrap: 'nowrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="editor-toolbar"
      >
        {toolbarButtons.map((btn, _idx) => (
          <button
            key={btn.label}
            aria-label={btn.label}
            onClick={() => handleCommand(btn.cmd, btn.arg)}
            type="button"
            style={{ fontWeight: btn.cmd === 'bold' ? 'bold' : undefined }}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCommand(btn.cmd, btn.arg);
              }
            }}
          >
            {btn.icon}
          </button>
        ))}
        <button
          aria-label="Insert Image"
          onClick={handleImageUpload}
          type="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') handleImageUpload();
          }}
        >
          🖼️
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-label="Upload image, video, or audio"
          title="Upload image, video, or audio"
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <button
          onClick={handleFetchPrompt}
          disabled={aiLoading}
          aria-label="Get AI journaling prompt"
          style={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: 22,
            background: '#673AB7',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            border: 'none',
            boxShadow: aiLoading ? '0 0 0 2px #FFD600' : 'none',
            outline: 'none',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            marginRight: 8,
          }}
          tabIndex={0}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ' ') && !aiLoading) handleFetchPrompt();
          }}
        >
          {aiLoading ? 'Loading Prompt…' : 'Get Journaling Prompt'}
        </button>
        <button
          onClick={handleFetchReflection}
          disabled={aiLoading}
          aria-label="Get AI reflection suggestion"
          style={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: 22,
            background: '#009688',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            border: 'none',
            boxShadow: aiLoading ? '0 0 0 2px #FFD600' : 'none',
            outline: 'none',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          tabIndex={0}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ' ') && !aiLoading) handleFetchReflection();
          }}
        >
          {aiLoading ? 'Loading Reflection…' : 'Get Reflection Suggestion'}
        </button>
        {aiError && (
          <span style={{ color: '#d32f2f', fontWeight: 500, marginLeft: 8 }} role="alert">
            {aiError}
          </span>
        )}
      </div>

      {/* Voice Recording Section */}
      <div style={{ marginBottom: 16 }}>
        <VoiceRecorder
          onTranscription={text => {
            if (editorRef.current) {
              // Insert transcribed text at cursor position
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode('\n' + text + '\n');
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
              } else {
                // Fallback: append to end
                document.execCommand('insertText', false, '\n' + text + '\n');
              }
              editorRef.current.focus();
              triggerSave();
            }
          }}
          onError={error => {
            setAIError(error);
            setTimeout(() => setAIError(null), 5000);
          }}
        />
      </div>

      {/* File Attachment Section */}
      <div style={{ marginBottom: 16 }}>
        <FileAttachment
          onFileAttached={(file, preview) => {
            setAttachedFiles(prev => [...prev, file]);

            // Insert file reference in editor
            if (editorRef.current) {
              const fileRef = `\n📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)\n`;
              if (preview) {
                document.execCommand('insertText', false, fileRef + `Preview: ${preview}\n`);
              } else {
                document.execCommand('insertText', false, fileRef);
              }
              editorRef.current.focus();
              triggerSave();
            }
          }}
          onError={error => {
            setAIError(error);
            setTimeout(() => setAIError(null), 5000);
          }}
          maxSize={25} // 25MB to match backend limit
        />
      </div>

      {/* Mood Tracker Section */}
      <MoodTracker onMoodChange={handleMoodChange} initialMood={safeMood} />
      {aiPrompt && (
        <div
          style={{
            background: '#ede7f6',
            borderRadius: 16,
            padding: 16,
            marginBottom: 8,
            boxShadow: '0 2px 8px #0001',
            maxWidth: 600,
          }}
          tabIndex={0}
          aria-label="AI Journaling Prompt"
          role="region"
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>AI Journaling Prompt:</div>
          <div style={{ marginBottom: 8 }}>{aiPrompt}</div>
          <button
            onClick={() => {
              if (editorRef.current) {
                document.execCommand('insertText', false, '\n' + aiPrompt);
                editorRef.current.focus();
              }
              setAIPrompt(null);
            }}
            aria-label="Insert AI prompt into entry"
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 22,
              background: '#673AB7',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              border: 'none',
              marginTop: 4,
              cursor: 'pointer',
            }}
          >
            Insert Prompt
          </button>
          <button
            onClick={() => setAIPrompt(null)}
            aria-label="Dismiss AI prompt"
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 22,
              background: '#fff',
              color: '#673AB7',
              fontWeight: 600,
              fontSize: '1rem',
              border: '1px solid #673AB7',
              marginLeft: 8,
              marginTop: 4,
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      {aiReflection && (
        <div
          style={{
            background: '#e0f2f1',
            borderRadius: 16,
            padding: 16,
            marginBottom: 8,
            boxShadow: '0 2px 8px #0001',
            maxWidth: 600,
          }}
          tabIndex={0}
          aria-label="AI Reflection Suggestion"
          role="region"
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>AI Reflection Suggestion:</div>
          <div style={{ marginBottom: 8 }}>{aiReflection}</div>
          <button
            onClick={() => {
              if (editorRef.current) {
                document.execCommand('insertText', false, '\n' + aiReflection);
                editorRef.current.focus();
              }
              setAIReflection(null);
            }}
            aria-label="Insert AI reflection into entry"
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 22,
              background: '#009688',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              border: 'none',
              marginTop: 4,
              cursor: 'pointer',
            }}
          >
            Insert Suggestion
          </button>
          <button
            onClick={() => setAIReflection(null)}
            aria-label="Dismiss AI reflection"
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 22,
              background: '#fff',
              color: '#009688',
              fontWeight: 600,
              fontSize: '1rem',
              border: '1px solid #009688',
              marginLeft: 8,
              marginTop: 4,
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        aria-label="Journal entry editor"
        role="textbox"
        style={{
          minHeight: 200,
          border: dragActive ? '2px dashed #0288d1' : '1px solid #ccc',
          borderRadius: 4,
          padding: 16,
          outline: 'none',
          background: dragActive ? '#e3f2fd' : '#fff',
          fontSize: '1rem',
          wordBreak: 'break-word',
          transition: 'background 0.2s, border 0.2s',
        }}
        tabIndex={0}
        suppressContentEditableWarning
        onInput={handleInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!value && initialContent ? (
          <span dangerouslySetInnerHTML={{ __html: initialContent }} />
        ) : null}
      </div>
      {(images.length > 0 || videos.length > 0 || audios.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <strong>Media Attachments:</strong>
          {images.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Images:</strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {images.map((url, i) => (
                  <div
                    key={i}
                    style={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}
                  >
                    <img
                      src={url}
                      alt={imageAlts[i] || `attachment-${i}`}
                      style={{
                        maxWidth: 120,
                        maxHeight: 120,
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                    />
                    <input
                      type="text"
                      value={imageAlts[i] || ''}
                      onChange={e =>
                        setImageAlts(alts => alts.map((a, idx) => (idx === i ? e.target.value : a)))
                      }
                      placeholder="Alt text (for accessibility)"
                      aria-label={`Alt text for image ${i + 1}`}
                      style={{
                        width: 110,
                        fontSize: 12,
                        marginTop: 4,
                        borderRadius: 4,
                        border: '1px solid #ccc',
                        padding: '2px 6px',
                      }}
                    />
                    <div
                      style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}
                    >
                      <button
                        onClick={() =>
                          setImages(imgs => {
                            if (i === 0) return imgs;
                            const newImgs = [...imgs];
                            [newImgs[i - 1], newImgs[i]] = [newImgs[i], newImgs[i - 1]];
                            setImageAlts(alts => {
                              const newAlts = [...alts];
                              [newAlts[i - 1], newAlts[i]] = [newAlts[i], newAlts[i - 1]];
                              return newAlts;
                            });
                            return newImgs;
                          })
                        }
                        aria-label="Move image left"
                        disabled={i === 0}
                        style={{
                          fontSize: 14,
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid #ccc',
                          background: '#f5f5f5',
                          cursor: i === 0 ? 'not-allowed' : 'pointer',
                        }}
                        tabIndex={0}
                      >
                        ←
                      </button>
                      <button
                        onClick={() =>
                          setImages(imgs => {
                            if (i === imgs.length - 1) return imgs;
                            const newImgs = [...imgs];
                            [newImgs[i + 1], newImgs[i]] = [newImgs[i], newImgs[i + 1]];
                            setImageAlts(alts => {
                              const newAlts = [...alts];
                              [newAlts[i + 1], newAlts[i]] = [newAlts[i], newAlts[i + 1]];
                              return newAlts;
                            });
                            return newImgs;
                          })
                        }
                        aria-label="Move image right"
                        disabled={i === images.length - 1}
                        style={{
                          fontSize: 14,
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid #ccc',
                          background: '#f5f5f5',
                          cursor: i === images.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                        tabIndex={0}
                      >
                        →
                      </button>
                      <button
                        onClick={() => {
                          setImages(imgs => imgs.filter((_, idx) => idx !== i));
                          setImageAlts(alts => alts.filter((_, idx) => idx !== i));
                        }}
                        aria-label="Remove image"
                        style={{
                          fontSize: 16,
                          color: '#d32f2f',
                          background: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          cursor: 'pointer',
                          marginLeft: 2,
                        }}
                        tabIndex={0}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Videos:</strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {videos.map((url, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                    <video
                      src={url}
                      controls
                      style={{
                        maxWidth: 180,
                        maxHeight: 120,
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                    />
                    <button
                      onClick={() => setVideos(vids => vids.filter((_, idx) => idx !== i))}
                      aria-label="Remove video"
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
          {audios.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Audios:</strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {audios.map((url, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                    <audio
                      src={url}
                      controls
                      style={{ maxWidth: 240, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <button
                      onClick={() => setAudios(auds => auds.filter((_, idx) => idx !== i))}
                      aria-label="Remove audio"
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
      <style>{`
        .editor-toolbar::-webkit-scrollbar { display: none; }
        .editor-toolbar button {
          min-width: 44px;
          min-height: 44px;
          font-size: 1.1rem;
        }
        @media (max-width: 600px) {
          .editor-toolbar {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            gap: 4px !important;
          }
        }
      `}</style>
    </div>
  );
};
