import express, { Application } from 'express';
import routes from '@/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from 'dotenv';
config();

export function createApp(): Application {
  const app: Application = express();
  const origin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
  console.log(origin, 'originoriginorigin');
  app.use(
    cors({
      //   origin: true,
      origin: origin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use(cookieParser());
  app.get('/', (req, res) => {
    res.send('Welcome to the Server!');
  });

  app.use('/api/v1', routes);
  return app;
}
