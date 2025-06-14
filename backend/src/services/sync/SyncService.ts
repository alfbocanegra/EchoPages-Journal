import { Pool } from 'pg';
import { Database } from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import {
    SyncChange,
    SyncDeviceState,
    SyncConflict,
    SyncResult,
    SyncOptions,
    EntityType,
    ChangeType,
    ResolutionStrategy
} from '../../types/sync';

export class SyncService {
    constructor(
        private pgPool: Pool | null,
        private sqliteDb: Database | null,
        private logger: Logger
    ) {}

    async trackChange(
        userId: string,
        entityType: EntityType,
        entityId: string,
        changeType: ChangeType,
        metadata: Record<string, any> = {}
    ): Promise<SyncChange> {
        const change: Partial<SyncChange> = {
            id: uuidv4(),
            userId,
            entityType,
            entityId,
            changeType,
            changeVersion: await this.getNextChangeVersion(userId),
            changeTimestamp: new Date(),
            changeMetadata: metadata,
            isConflict: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (this.pgPool) {
            await this.trackChangePg(change);
        }
        if (this.sqliteDb) {
            await this.trackChangeSqlite(change);
        }

        return change as SyncChange;
    }

    async resolveConflict(
        conflictId: string,
        strategy: ResolutionStrategy,
        resolvedBy: string,
        metadata: Record<string, any> = {}
    ): Promise<void> {
        if (this.pgPool) {
            await this.resolveConflictPg(conflictId, strategy, resolvedBy, metadata);
        }
        if (this.sqliteDb) {
            await this.resolveConflictSqlite(conflictId, strategy, resolvedBy, metadata);
        }
    }

    async syncDevice(
        userId: string,
        deviceId: string,
        options: SyncOptions = {}
    ): Promise<SyncResult> {
        try {
            const deviceState = await this.getDeviceState(userId, deviceId);
            const changes = await this.getChangesSinceVersion(
                userId,
                deviceState.lastSyncVersion,
                options.batchSize
            );

            const conflicts = await this.detectConflicts(changes);
            if (conflicts.length > 0 && !options.strategy) {
                return {
                    success: false,
                    conflicts,
                    error: 'Conflicts detected and no resolution strategy provided'
                };
            }

            await this.applyChanges(changes, options.strategy || 'server_wins');
            const newVersion = await this.updateDeviceState(userId, deviceId);

            return {
                success: true,
                newVersion,
                metadata: { changesApplied: changes.length }
            };
        } catch (error) {
            this.logger.error('Sync failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during sync'
            };
        }
    }

    private async getNextChangeVersion(userId: string): Promise<number> {
        if (this.pgPool) {
            const { rows } = await this.pgPool.query(
                'SELECT COALESCE(MAX(change_version), 0) + 1 as next_version FROM sync_changes WHERE user_id = $1',
                [userId]
            );
            return rows[0].next_version;
        }
        if (this.sqliteDb) {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.get(
                    'SELECT COALESCE(MAX(change_version), 0) + 1 as next_version FROM sync_changes WHERE user_id = ?',
                    [userId],
                    (err, row: any) => {
                        if (err) reject(err);
                        else resolve(row.next_version);
                    }
                );
            });
        }
        throw new Error('No database connection available');
    }

    private async trackChangePg(change: Partial<SyncChange>): Promise<void> {
        await this.pgPool!.query(
            `
            INSERT INTO sync_changes (
                id, user_id, entity_type, entity_id, change_type,
                change_version, change_timestamp, change_metadata,
                is_conflict, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `,
            [
                change.id,
                change.userId,
                change.entityType,
                change.entityId,
                change.changeType,
                change.changeVersion,
                change.changeTimestamp,
                change.changeMetadata,
                change.isConflict,
                change.createdAt,
                change.updatedAt
            ]
        );
    }

    private async trackChangeSqlite(change: Partial<SyncChange>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sqliteDb!.run(
                `
                INSERT INTO sync_changes (
                    id, user_id, entity_type, entity_id, change_type,
                    change_version, change_timestamp, change_metadata,
                    is_conflict, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    change.id,
                    change.userId,
                    change.entityType,
                    change.entityId,
                    change.changeType,
                    change.changeVersion,
                    change.changeTimestamp?.toISOString(),
                    JSON.stringify(change.changeMetadata),
                    change.isConflict ? 1 : 0,
                    change.createdAt?.toISOString(),
                    change.updatedAt?.toISOString()
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    private async resolveConflictPg(
        conflictId: string,
        strategy: ResolutionStrategy,
        resolvedBy: string,
        metadata: Record<string, any>
    ): Promise<void> {
        await this.pgPool!.query(
            `
            UPDATE sync_conflicts
            SET resolved = true,
                resolution_strategy = $1,
                resolved_by = $2,
                resolved_at = CURRENT_TIMESTAMP,
                resolution_metadata = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            `,
            [strategy, resolvedBy, metadata, conflictId]
        );
    }

    private async resolveConflictSqlite(
        conflictId: string,
        strategy: ResolutionStrategy,
        resolvedBy: string,
        metadata: Record<string, any>
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sqliteDb!.run(
                `
                UPDATE sync_conflicts
                SET resolved = 1,
                    resolution_strategy = ?,
                    resolved_by = ?,
                    resolved_at = datetime('now'),
                    resolution_metadata = ?,
                    updated_at = datetime('now')
                WHERE id = ?
                `,
                [strategy, resolvedBy, JSON.stringify(metadata), conflictId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    private async getDeviceState(userId: string, deviceId: string): Promise<SyncDeviceState> {
        if (this.pgPool) {
            const { rows } = await this.pgPool.query(
                'SELECT * FROM sync_device_states WHERE user_id = $1 AND device_id = $2',
                [userId, deviceId]
            );
            return this.mapDeviceState(rows[0]);
        }
        if (this.sqliteDb) {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.get(
                    'SELECT * FROM sync_device_states WHERE user_id = ? AND device_id = ?',
                    [userId, deviceId],
                    (err, row: any) => {
                        if (err) reject(err);
                        else resolve(this.mapDeviceState(row));
                    }
                );
            });
        }
        throw new Error('No database connection available');
    }

    private async getChangesSinceVersion(
        userId: string,
        version: number,
        batchSize: number = 100
    ): Promise<SyncChange[]> {
        if (this.pgPool) {
            const { rows } = await this.pgPool.query(
                `
                SELECT * FROM sync_changes
                WHERE user_id = $1 AND change_version > $2
                ORDER BY change_version ASC
                LIMIT $3
                `,
                [userId, version, batchSize]
            );
            return rows.map(this.mapSyncChange);
        }
        if (this.sqliteDb) {
            return new Promise((resolve, reject) => {
                const changes: any[] = [];
                this.sqliteDb!.each(
                    `
                    SELECT * FROM sync_changes
                    WHERE user_id = ? AND change_version > ?
                    ORDER BY change_version ASC
                    LIMIT ?
                    `,
                    [userId, version, batchSize],
                    (err, row) => {
                        if (err) reject(err);
                        else changes.push(this.mapSyncChange(row));
                    },
                    (err) => {
                        if (err) reject(err);
                        else resolve(changes);
                    }
                );
            });
        }
        throw new Error('No database connection available');
    }

    private async detectConflicts(changes: SyncChange[]): Promise<SyncConflict[]> {
        // Implementation depends on your conflict detection rules
        // This is a basic example that detects overlapping changes
        const conflicts: SyncConflict[] = [];
        const changesByEntity = new Map<string, SyncChange[]>();

        for (const change of changes) {
            const key = `${change.entityType}:${change.entityId}`;
            const entityChanges = changesByEntity.get(key) || [];
            entityChanges.push(change);
            changesByEntity.set(key, entityChanges);
        }

        for (const [, entityChanges] of changesByEntity) {
            if (entityChanges.length > 1) {
                // Create conflict records for overlapping changes
                const conflict: Partial<SyncConflict> = {
                    id: uuidv4(),
                    changeId: entityChanges[0].id,
                    conflictingChangeId: entityChanges[1].id,
                    resolutionStrategy: 'manual',
                    resolved: false,
                    resolutionMetadata: {},
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                conflicts.push(conflict as SyncConflict);
            }
        }

        return conflicts;
    }

    private async applyChanges(changes: SyncChange[], strategy: ResolutionStrategy): Promise<void> {
        // Implementation depends on your specific entity types and how changes should be applied
        for (const change of changes) {
            try {
                switch (change.entityType) {
                    case 'journal_entry':
                        await this.applyJournalEntryChange(change, strategy);
                        break;
                    case 'folder':
                        await this.applyFolderChange(change, strategy);
                        break;
                    case 'tag':
                        await this.applyTagChange(change, strategy);
                        break;
                    case 'media_attachment':
                        await this.applyMediaAttachmentChange(change, strategy);
                        break;
                }
            } catch (error) {
                this.logger.error(`Failed to apply change ${change.id}:`, error);
                throw error;
            }
        }
    }

    private async updateDeviceState(userId: string, deviceId: string): Promise<number> {
        const newVersion = await this.getNextChangeVersion(userId);
        
        if (this.pgPool) {
            await this.pgPool.query(
                `
                UPDATE sync_device_states
                SET last_sync_version = $1,
                    last_successful_sync = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2 AND device_id = $3
                `,
                [newVersion - 1, userId, deviceId]
            );
        }
        if (this.sqliteDb) {
            await new Promise<void>((resolve, reject) => {
                this.sqliteDb!.run(
                    `
                    UPDATE sync_device_states
                    SET last_sync_version = ?,
                        last_successful_sync = datetime('now'),
                        updated_at = datetime('now')
                    WHERE user_id = ? AND device_id = ?
                    `,
                    [newVersion - 1, userId, deviceId],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        return newVersion - 1;
    }

    private mapDeviceState(row: any): SyncDeviceState {
        return {
            id: row.id,
            userId: row.user_id,
            deviceId: row.device_id,
            lastSyncVersion: row.last_sync_version,
            lastSuccessfulSync: row.last_successful_sync ? new Date(row.last_successful_sync) : undefined,
            syncFailures: row.sync_failures,
            deviceMetadata: typeof row.device_metadata === 'string' 
                ? JSON.parse(row.device_metadata)
                : row.device_metadata,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

    private mapSyncChange(row: any): SyncChange {
        return {
            id: row.id,
            userId: row.user_id,
            entityType: row.entity_type,
            entityId: row.entity_id,
            changeType: row.change_type,
            changeVersion: row.change_version,
            changeTimestamp: new Date(row.change_timestamp),
            changeMetadata: typeof row.change_metadata === 'string'
                ? JSON.parse(row.change_metadata)
                : row.change_metadata,
            isConflict: row.is_conflict === 1 || row.is_conflict === true,
            resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
            resolvedBy: row.resolved_by,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

    // Entity-specific change application methods to be implemented
    private async applyJournalEntryChange(change: SyncChange, strategy: ResolutionStrategy): Promise<void> {
        // Implementation for journal entry changes
    }

    private async applyFolderChange(change: SyncChange, strategy: ResolutionStrategy): Promise<void> {
        // Implementation for folder changes
    }

    private async applyTagChange(change: SyncChange, strategy: ResolutionStrategy): Promise<void> {
        // Implementation for tag changes
    }

    private async applyMediaAttachmentChange(change: SyncChange, strategy: ResolutionStrategy): Promise<void> {
        // Implementation for media attachment changes
    }
}
