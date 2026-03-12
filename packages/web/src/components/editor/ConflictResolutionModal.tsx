import React from 'react';
import ThemeModal from '../common/ThemeModal';
import ThemeButton from '../common/ThemeButton';
import type { Entry as UIEntry } from './EntryList';

interface ConflictResolutionModalProps {
  open: boolean;
  local: UIEntry;
  remote: UIEntry;
  onResolve: (resolved: UIEntry) => void;
  onClose: () => void;
}

const fieldStyle = { marginBottom: 8, padding: 8, border: '1px solid #eee', borderRadius: 8 };

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  open,
  local,
  remote,
  onResolve,
  onClose,
}) => {
  const [selected, setSelected] = React.useState<'local' | 'remote' | 'merge'>('local');
  const [merged, setMerged] = React.useState<UIEntry>({ ...local });

  React.useEffect(() => {
    setMerged({ ...local });
    setSelected('local');
  }, [local, remote, open]);

  const handleMergeChange = (field: keyof UIEntry, value: string) => {
    setMerged(m => ({ ...m, [field]: value }));
    setSelected('merge');
  };

  const handleResolve = () => {
    if (selected === 'local') onResolve(local);
    else if (selected === 'remote') onResolve(remote);
    else onResolve(merged);
  };

  return (
    <ThemeModal visible={open} onClose={onClose} title="Resolve Conflict">
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Local Version</div>
          <div style={fieldStyle}>
            <b>Title:</b> {local.title}
          </div>
          <div style={fieldStyle}>
            <b>Content:</b> {local.content}
          </div>
          <div style={fieldStyle}>
            <b>Date:</b> {new Date(local.date).toLocaleString()}
          </div>
          <ThemeButton
            title="Keep Local"
            variant={selected === 'local' ? 'primary' : 'outline'}
            onClick={() => setSelected('local')}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Remote Version</div>
          <div style={fieldStyle}>
            <b>Title:</b> {remote.title}
          </div>
          <div style={fieldStyle}>
            <b>Content:</b> {remote.content}
          </div>
          <div style={fieldStyle}>
            <b>Date:</b> {new Date(remote.date).toLocaleString()}
          </div>
          <ThemeButton
            title="Keep Remote"
            variant={selected === 'remote' ? 'primary' : 'outline'}
            onClick={() => setSelected('remote')}
          />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Merge/Edit</div>
        <input
          style={{ ...fieldStyle, width: '100%' }}
          value={merged.title}
          onChange={e => handleMergeChange('title', e.target.value)}
          placeholder="Title"
        />
        <textarea
          style={{ ...fieldStyle, width: '100%', minHeight: 60 }}
          value={merged.content}
          onChange={e => handleMergeChange('content', e.target.value)}
          placeholder="Content"
        />
        <ThemeButton
          title="Use Merged"
          variant={selected === 'merge' ? 'primary' : 'outline'}
          onClick={() => setSelected('merge')}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <ThemeButton title="Cancel" variant="outline" onClick={onClose} />
        <ThemeButton title="Resolve" onClick={handleResolve} />
      </div>
    </ThemeModal>
  );
};
