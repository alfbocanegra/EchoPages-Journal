import 'reflect-metadata';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import { User, BiometricCredential } from '@echopages/shared';
import webauthnRoutes from './routes/auth/webauthn';
import oauthRoutes from './routes/auth/oauth';

// Initialize Express app
const app = express();

// Configure middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize TypeORM connection
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'echopages',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, BiometricCredential],
  migrations: ['src/migrations/*.ts']
});

// Mount routes
app.use('/auth/webauthn', webauthnRoutes);
app.use('/auth/oauth', oauthRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export default app; 