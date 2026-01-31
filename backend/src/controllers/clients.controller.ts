import { Request, Response } from 'express';
import { getDb } from '../db';

export async function listClients(req: Request, res: Response): Promise<void> {
  try {
    const clients = await getDb().listClients();
    res.json(clients);
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ error: 'Failed to list clients' });
  }
}
