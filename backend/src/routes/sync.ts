import express, { Request, Response, RequestHandler } from 'express';
import { SyncService } from '../services/sync/SyncService';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Assume req.user is set by JWT auth middleware
// POST /sync: receive and apply client changes
router.post('/', (async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const userEmail = (req.user as any)?.email;
  console.log(`[SYNC] POST /sync by user: ${userId} (${userEmail})`);
  const deviceId = req.body.deviceId;
  const changes = req.body.changes;
  if (!userId || !deviceId || !Array.isArray(changes)) {
    res.status(400).json({ error: 'Missing userId, deviceId, or changes' });
    return;
  }
  try {
    const syncService = req.app.get('syncService') as SyncService;
    const result = await syncService.syncDevice(userId, deviceId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// GET /sync/status: get latest sync version for user/device
router.get('/status', (async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const userEmail = (req.user as any)?.email;
  console.log(`[SYNC] GET /sync/status by user: ${userId} (${userEmail})`);
  const deviceId = req.query.deviceId as string;
  if (!userId || !deviceId) {
    res.status(400).json({ error: 'Missing userId or deviceId' });
    return;
  }
  try {
    const syncService = req.app.get('syncService') as SyncService;
    const state = await syncService.getDeviceState(userId, deviceId);
    res.json({ lastSyncVersion: state.lastSyncVersion });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// POST /sync/resolve: resolve a conflict
router.post('/resolve', (async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const userEmail = (req.user as any)?.email;
  console.log(`[SYNC] POST /sync/resolve by user: ${userId} (${userEmail})`);
  const { conflictId, resolution } = req.body;
  if (!userId || !conflictId || !resolution) {
    res.status(400).json({ error: 'Missing userId, conflictId, or resolution' });
    return;
  }
  try {
    const syncService = req.app.get('syncService') as SyncService;
    await syncService.resolveConflict(conflictId, 'manual', userId, { resolution });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// GET /sync/conflicts: get unresolved conflicts for user/device
router.get('/conflicts', ((req: Request, res: Response): void => {
  const userId = (req.user as any)?.id;
  const userEmail = (req.user as any)?.email;
  console.log(`[SYNC] GET /sync/conflicts by user: ${userId} (${userEmail})`);
  const deviceId = req.query.deviceId as string;
  if (!userId || !deviceId) {
    res.status(400).json({ error: 'Missing userId or deviceId' });
    return;
  }
  try {
    const syncService = req.app.get('syncService') as SyncService;
    syncService
      .getConflictSummary(userId, deviceId)
      .then(summary => res.json(summary))
      .catch((err: Error) => res.status(500).json({ error: err.message }));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// GET /sync/metrics: get current sync server metrics (diagnostics)
router.get('/metrics', ((req: Request, res: Response): void => {
  const wsSyncServer = req.app.get('wsSyncServer');
  if (!wsSyncServer || typeof wsSyncServer.constructor.getMetrics !== 'function') {
    res.status(500).json({ error: 'Sync metrics unavailable' });
    return;
  }
  const metrics = wsSyncServer.constructor.getMetrics();
  res.json(metrics);
}) as RequestHandler);

// GET /sync/errors: get recent sync errors (admin only)
router.get('/errors', ((req: Request, res: Response): void => {
  const user = (req.user as any) || {};
  if (!user.isAdmin) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const logPath = path.resolve(__dirname, '../../../logs/sync-errors.log');
  if (!fs.existsSync(logPath)) {
    res.json([]);
    return;
  }
  try {
    const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n');
    const last100 = lines.slice(-100);
    res.json(last100);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// GET /sync/metrics/history: get recent sync metrics history (admin only)
router.get('/metrics/history', ((req: Request, res: Response): void => {
  const user = (req.user as any) || {};
  if (!user.isAdmin) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const logPath = path.resolve(__dirname, '../../../logs/sync-metrics.log');
  if (!fs.existsSync(logPath)) {
    res.json([]);
    return;
  }
  try {
    const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n');
    const last100 = lines
      .slice(-100)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    res.json(last100);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// GET /sync/admin/users: list all users and their entry counts (admin only)
router.get('/admin/users', (async (req: Request, res: Response): Promise<void> => {
  const user = (req.user as any) || {};
  if (!user.isAdmin) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  try {
    const userRepository = req.app.get('userRepository');
    const users = await userRepository.find({ relations: ['entries'] });
    const result = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      provider: u.authProvider,
      entryCount: u.entries?.length || 0,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

export default router;
