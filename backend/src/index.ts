import 'dotenv/config';
import app from './app';
import { createServer } from 'http';
// import { AppDataSource } from './app';
// import { WebSocketSyncServer } from './services/sync/WebSocketSyncServer';
// import { SyncService } from './services/sync/SyncService';
// import { Pool } from 'pg';
// import winston from 'winston';

const PORT = process.env.PORT || 3001;
// const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Create HTTP server
const httpServer = createServer(app);

// Initialize logger (temporarily disabled)
// const logger = winston.createLogger({
//   level: 'info',
//   transports: [new winston.transports.Console()],
// });

// Start server without database for basic testing
console.log('Starting server in basic mode (database temporarily disabled)');

httpServer.listen(PORT, () => {
  console.log(`🚀 EchoPages Journal Backend running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API info: http://localhost:${PORT}/`);
});

// Database initialization (temporarily commented out)
/*
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection initialized');

    // Create SyncService (using Postgres pool)
    const pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'echopages',
    });
    const syncService = new SyncService(pgPool, null, logger);

    // Start WebSocket sync server
    const wsSyncServer = new WebSocketSyncServer({
      httpServer,
      syncService,
      logger,
      jwtSecret: JWT_SECRET,
    });
    app.set('wsSyncServer', wsSyncServer);

    httpServer.listen(PORT, () => {
      console.log(`Server and WebSocketSyncServer running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error during Data Source initialization:', error);
    process.exit(1);
  });
*/
