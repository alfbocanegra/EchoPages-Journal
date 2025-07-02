import 'reflect-metadata';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import {
  User,
  BiometricCredential,
  UserSettings,
  Entry,
  EntryVersion,
  Folder,
  Tag,
  Media,
} from '@echopages/shared';
import passport from './config/passport';
import { configurePassport } from './config/passport';
import webauthnRoutes from './routes/auth/webauthn';
import oauthRoutes from './routes/auth/oauth';
import cloudRouter from './routes/cloud';
import syncRouter from './routes/sync';
import totpRoutes from './routes/auth/totp';
import { requireAuth } from './middleware/auth';
import aiRouter from './routes/ai';

// Initialize Express app
const app = express();

// Configure middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport after session middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize TypeORM connection
export const AppDataSource = new DataSource({
  type: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
  // PostgreSQL configuration for production
  ...(process.env.NODE_ENV === 'production' && {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'echopages',
  }),
  // SQLite configuration for development
  ...(process.env.NODE_ENV !== 'production' && {
    database: process.env.DB_NAME || 'data/echopages.db',
  }),
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, BiometricCredential, UserSettings, Entry, EntryVersion, Folder, Tag, Media],
  migrations: ['src/migrations/*.ts'],
} as any);

// Configure passport strategies
configurePassport();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'EchoPages Journal Backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'EchoPages Journal API', version: '1.0.0' });
});

// Mount routes
app.use('/auth/webauthn', requireAuth, webauthnRoutes);
app.use('/auth/oauth', oauthRoutes);
app.use('/auth/totp', requireAuth, totpRoutes);
app.use('/cloud', requireAuth, cloudRouter);
app.use('/sync', requireAuth, syncRouter);
app.use('/api/ai', requireAuth, aiRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export default app;
