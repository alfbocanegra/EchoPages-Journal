import React, { useState, useRef } from 'react';

interface FileAttachmentProps {
  onFileAttached: (file: File, preview?: string) => void;
  onError?: (error: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

interface AttachedFile {
  file: File;
  preview?: string;
  id: string;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  onFileAttached,
  onError,
  acceptedTypes = '.pdf,.doc,.docx,.txt,.rtf,.odt,.pages,.epub,.mobi,.zip,.rar,.7z,.tar,.gz',
  maxSize = 10, // 10MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      onError?.(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
      return false;
    }

    // Check file type if acceptedTypes is specified
    if (acceptedTypes) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const acceptedExtensions = acceptedTypes.toLowerCase().split(',');

      if (!acceptedExtensions.includes(fileExtension)) {
        onError?.(
          `File type "${fileExtension}" is not supported. Accepted types: ${acceptedTypes}`
        );
        return false;
      }
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    let preview: string | undefined;

    // Generate preview for certain file types
    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      try {
        const text = await file.text();
        preview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
      } catch (error) {
        console.warn('Could not generate text preview:', error);
      }
    }

    const attachedFile: AttachedFile = {
      file,
      preview,
      id: fileId,
    };

    setAttachedFiles(prev => [...prev, attachedFile]);
    onFileAttached(file, preview);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'rtf':
        return '📄';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return '🗜️';
      case 'epub':
      case 'mobi':
        return '📚';
      case 'pages':
        return '📄';
      case 'odt':
        return '📝';
      default:
        return '📎';
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragOver ? '2px dashed #007bff' : '2px dashed #dee2e6',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragOver ? '#f8f9ff' : '#fafafa',
          transition: 'all 0.3s ease',
          marginBottom: attachedFiles.length > 0 ? '16px' : '0',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📎</div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          <strong>Click to attach files</strong> or drag and drop
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          Supported: {acceptedTypes.replace(/\./g, '').toUpperCase()} • Max {maxSize}MB
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label="Select files to attach"
      />

      {/* Attached Files List */}
      {attachedFiles.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
            Attached Files ({attachedFiles.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attachedFiles.map(attachedFile => (
              <div
                key={attachedFile.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  background: '#fff',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ fontSize: '20px', flexShrink: 0 }}>
                  {getFileIcon(attachedFile.file.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      wordBreak: 'break-word',
                    }}
                  >
                    {attachedFile.file.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {formatFileSize(attachedFile.file.size)} •{' '}
                    {attachedFile.file.type || 'Unknown type'}
                  </div>
                  {attachedFile.preview && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#555',
                        marginTop: '6px',
                        padding: '6px 8px',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {attachedFile.preview}
                    </div>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeFile(attachedFile.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
