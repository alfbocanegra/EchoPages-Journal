import type { Entry } from '../entities/Entry';

export type ConflictResolutionStrategy = 'server-wins' | 'client-wins' | 'manual';

export interface EntryConflict {
  local: Entry;
  remote: Entry;
}

export function resolveEntryConflict(
  conflict: EntryConflict,
  strategy: ConflictResolutionStrategy
): Entry {
  switch (strategy) {
    case 'server-wins':
      return { ...conflict.local, ...conflict.remote };
    case 'client-wins':
      return { ...conflict.remote, ...conflict.local };
    case 'manual':
    default:
      // For manual, return local but mark as conflicted (could be surfaced in UI)
      return { ...conflict.local, syncStatus: 'conflict' };
  }
}
