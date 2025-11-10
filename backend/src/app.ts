import express, { Application } from 'express';
import routes from '@/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from 'dotenv';
config();

export function createApp(): Application {
  const app: Application = express();

  // Allow all subdomains and development origins
  const corsOptions = {
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!requestOrigin) return callback(null, true);

      // Get base domain from environment or use localhost
      const baseDomain = process.env.BASE_DOMAIN || 'localhost';

      // Allow localhost on any port
      if (requestOrigin.includes('localhost')) {
        return callback(null, true);
      }

      // Allow all subdomains of base domain
      if (requestOrigin.includes(baseDomain)) {
        return callback(null, true);
      }

      // Allow the main allowed origin
      const allowedOrigin = process.env.ALLOWED_ORIGIN;
      if (allowedOrigin && requestOrigin === allowedOrigin) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };

  console.log('CORS configured to allow all subdomains');

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use(cookieParser());
  app.get('/', (req, res) => {
    res.send('Welcome to the Server!');
  });

  app.use('/api/v1', routes);
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  return app;
}
