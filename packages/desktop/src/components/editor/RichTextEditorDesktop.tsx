import React, { useRef, useState } from 'react';
// Fluent Design tokens (replace with your design system or use Fluent UI)
const COLORS = {
  background: '#f3f3f3',
  surface: '#fff',
  primary: '#0078d4',
  error: '#d32f2f',
  border: '#ccc',
  focus: '#5c9ded',
};
const RADIUS = 8;
const TOOLBAR_BUTTONS = [
  { cmd: 'bold', label: 'Bold', icon: <b>B</b> },
  { cmd: 'italic', label: 'Italic', icon: <i>I</i> },
  { cmd: 'underline', label: 'Underline', icon: <u>U</u> },
  { cmd: 'insertUnorderedList', label: 'Bulleted List', icon: '•' },
  { cmd: 'insertOrderedList', label: 'Numbered List', icon: '1.' },
  { cmd: 'formatBlock', arg: 'H1', label: 'Heading 1', icon: 'H1' },
  { cmd: 'formatBlock', arg: 'H2', label: 'Heading 2', icon: 'H2' },
];

export const RichTextEditorDesktop: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageAlts, setImageAlts] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audios, setAudios] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleCommand = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg || undefined);
    editorRef.current?.focus();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageAltChange = (i: number, alt: string) => {
    setImageAlts(alts => alts.map((a, idx) => (idx === i ? alt : a)));
  };
  const handleReorderImage = (i: number, dir: -1 | 1) => {
    setImages(imgs => {
      const newImgs = [...imgs];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return imgs;
      [newImgs[i], newImgs[j]] = [newImgs[j], newImgs[i]];
      setImageAlts(alts => {
        const newAlts = [...alts];
        [newAlts[i], newAlts[j]] = [newAlts[j], newAlts[i]];
        return newAlts;
      });
      return newImgs;
    });
  };
  const handleRemoveImage = (i: number) => {
    setImages(imgs => imgs.filter((_, idx) => idx !== i));
    setImageAlts(alts => alts.filter((_, idx) => idx !== i));
  };
  // Drag & drop support
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
  return (
    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: 16,
        background: COLORS.background,
        borderRadius: RADIUS,
      }}
    >
      <div
        role="toolbar"
        aria-label="Editor toolbar"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 8,
          flexWrap: 'wrap',
          background: COLORS.surface,
          borderRadius: RADIUS,
          boxShadow: '0 1px 4px #0001',
          padding: 8,
        }}
      >
        {TOOLBAR_BUTTONS.map((btn, _idx) => (
          <button
            key={btn.label}
            aria-label={btn.label}
            onClick={() => handleCommand(btn.cmd, btn.arg)}
            type="button"
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: RADIUS,
              border: 'none',
              background: COLORS.surface,
              cursor: 'pointer',
              outline: 'none',
            }}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleCommand(btn.cmd, btn.arg);
            }}
          >
            {btn.icon}
          </button>
        ))}
        <button
          aria-label="Insert Image, Video, or Audio"
          onClick={() => fileInputRef.current?.click()}
          type="button"
          tabIndex={0}
          style={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: RADIUS,
            border: 'none',
            background: COLORS.surface,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-label="Upload image, video, or audio"
        />
      </div>
      <div
        ref={editorRef}
        contentEditable
        aria-label="Journal entry editor"
        role="textbox"
        style={{
          minHeight: 200,
          border: dragActive ? `2px dashed ${COLORS.primary}` : `1px solid ${COLORS.border}`,
          borderRadius: RADIUS,
          padding: 16,
          outline: 'none',
          background: COLORS.surface,
          fontSize: '1rem',
          transition: 'background 0.2s, border 0.2s',
        }}
        tabIndex={0}
        suppressContentEditableWarning
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      />
      {/* Media Attachments Section */}
      {(images.length > 0 || videos.length > 0 || audios.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <strong>Media Attachments:</strong>
          {/* Images */}
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
                        border: `1px solid ${COLORS.border}`,
                      }}
                    />
                    <input
                      type="text"
                      value={imageAlts[i] || ''}
                      onChange={e => handleImageAltChange(i, e.target.value)}
                      placeholder="Alt text (for accessibility)"
                      aria-label={`Alt text for image ${i + 1}`}
                      style={{
                        width: 110,
                        fontSize: 12,
                        marginTop: 4,
                        borderRadius: 4,
                        border: `1px solid ${COLORS.border}`,
                        padding: '2px 6px',
                      }}
                    />
                    <div
                      style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}
                    >
                      <button
                        onClick={() => handleReorderImage(i, -1)}
                        aria-label="Move image left"
                        disabled={i === 0}
                        style={{
                          fontSize: 14,
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: `1px solid ${COLORS.border}`,
                          background: '#f5f5f5',
                          cursor: i === 0 ? 'not-allowed' : 'pointer',
                        }}
                        tabIndex={0}
                      >
                        ←
                      </button>
                      <button
                        onClick={() => handleReorderImage(i, 1)}
                        aria-label="Move image right"
                        disabled={i === images.length - 1}
                        style={{
                          fontSize: 14,
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: `1px solid ${COLORS.border}`,
                          background: '#f5f5f5',
                          cursor: i === images.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                        tabIndex={0}
                      >
                        →
                      </button>
                      <button
                        onClick={() => handleRemoveImage(i)}
                        aria-label="Remove image"
                        style={{
                          fontSize: 16,
                          color: COLORS.error,
                          background: COLORS.surface,
                          border: `1px solid ${COLORS.border}`,
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
          {/* Videos */}
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
                        border: `1px solid ${COLORS.border}`,
                      }}
                    />
                    <button
                      onClick={() => setVideos(vids => vids.filter((_, idx) => idx !== i))}
                      aria-label="Remove video"
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        fontSize: 16,
                        color: COLORS.error,
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
          {/* Audios */}
          {audios.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Audios:</strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {audios.map((url, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                    <audio
                      src={url}
                      controls
                      style={{
                        maxWidth: 240,
                        borderRadius: 4,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    />
                    <button
                      onClick={() => setAudios(auds => auds.filter((_, idx) => idx !== i))}
                      aria-label="Remove audio"
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        fontSize: 16,
                        color: COLORS.error,
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
    </div>
  );
};

export default RichTextEditorDesktop;
