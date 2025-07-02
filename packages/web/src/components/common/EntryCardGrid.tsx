import React from 'react';
import EntryCard, { EntryCardProps } from './EntryCard';

interface EntryCardGridProps {
  entries: EntryCardProps['entry'][];
  viewMode: 'grid' | 'list';
  onEdit?: (entry: any) => void;
  onDelete?: (id: string) => void;
  onClick?: (entry: any) => void;
}

const EntryCardGrid: React.FC<EntryCardGridProps> = ({
  entries,
  viewMode,
  onEdit,
  onDelete,
  onClick,
}) => (
  <div
    style={{
      display: viewMode === 'grid' ? 'grid' : 'flex',
      gridTemplateColumns:
        viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : undefined,
      flexDirection: viewMode === 'list' ? 'column' : undefined,
      gap: '16px',
    }}
  >
    {entries.map(entry => (
      <EntryCard
        key={entry.id}
        entry={entry}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={onClick}
      />
    ))}
  </div>
);

export default EntryCardGrid;
