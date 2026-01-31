import { Request, Response } from 'express';
import * as uploadService from '../services/upload.service';

export async function uploadFile(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    const clientName = req.body.clientName;

    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    if (!clientName || typeof clientName !== 'string') {
      res.status(400).json({ error: 'clientName is required' });
      return;
    }

    const allowedTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.mimetype) && !file.originalname.match(/\.(csv|xlsx)$/i)) {
      res.status(400).json({ error: 'File must be CSV or XLSX' });
      return;
    }

    const result = await uploadService.createUpload({
      buffer: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      clientName: clientName.trim(),
    });

    res.status(201).json({
      id: result.uploadId,
      overallPass: result.overallPass,
      status: result.status,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process upload' });
  }
}

export async function listUploads(req: Request, res: Response): Promise<void> {
  try {
    const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
    const uploads = await uploadService.listUploads(clientId);
    res.json(uploads);
  } catch (err) {
    console.error('List uploads error:', err);
    res.status(500).json({ error: 'Failed to list uploads' });
  }
}

export async function getUpload(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid upload ID' });
      return;
    }

    const { upload, validations } = await uploadService.getUploadById(id);

    if (!upload) {
      res.status(404).json({ error: 'Upload not found' });
      return;
    }

    res.json({ upload, validations });
  } catch (err) {
    console.error('Get upload error:', err);
    res.status(500).json({ error: 'Failed to get upload' });
  }
}
