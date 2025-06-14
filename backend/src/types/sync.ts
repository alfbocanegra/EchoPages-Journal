import { User } from '@echopages/shared/entities';

export type EntityType = 'journal_entry' | 'folder' | 'tag' | 'media_attachment';
export type ChangeType = 'create' | 'update' | 'delete';
export type ResolutionStrategy = 'client_wins' | 'server_wins' | 'manual' | 'merge';

export interface SyncChange {
    id: string;
    userId: string;
    entityType: EntityType;
    entityId: string;
    changeType: ChangeType;
    changeVersion: number;
    changeTimestamp: Date;
    changeMetadata: Record<string, any>;
    isConflict: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SyncDeviceState {
    id: string;
    userId: string;
    deviceId: string;
    lastSyncVersion: number;
    lastSuccessfulSync?: Date;
    syncFailures: number;
    deviceMetadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface SyncConflict {
    id: string;
    changeId: string;
    conflictingChangeId?: string;
    resolutionStrategy: ResolutionStrategy;
    resolved: boolean;
    resolutionMetadata: Record<string, any>;
    resolvedAt?: Date;
    resolvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface VersionedEntity {
    localVersion: number;
    serverVersion: number;
}

export interface SyncResult {
    success: boolean;
    newVersion?: number;
    conflicts?: SyncConflict[];
    error?: string;
    metadata?: Record<string, any>;
}

export interface SyncOptions {
    strategy?: ResolutionStrategy;
    forceSync?: boolean;
    batchSize?: number;
    timeout?: number;
    retryCount?: number;
}

export interface SyncState {
    lastSyncTimestamp: number;
    user: User;
    pendingChanges: number;
}
