import { Request, Response } from 'express';
import { query } from '../db';

export async function listClients(req: Request, res: Response): Promise<void> {
  try {
    const clients = await query<{ id: number; name: string }>(
      'SELECT id, name FROM clients ORDER BY name'
    );
    res.json(clients);
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ error: 'Failed to list clients' });
  }
}
