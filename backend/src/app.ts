import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.middleware';
import uploadsRoutes from './routes/uploads.routes';
import clientsRoutes from './routes/clients.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', authMiddleware, uploadsRoutes);
app.use('/clients', authMiddleware, clientsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
