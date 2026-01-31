import { query } from '../db';
import { parseFile } from './fileParser.service';
import { runValidations } from './validation.service';

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  clientName: string;
}

export interface UploadRecord {
  id: number;
  client_id: number;
  client_name: string;
  filename: string;
  file_type: string;
  uploaded_at: string;
  overall_pass: boolean;
  status: string;
}

export interface ValidationRecord {
  id: number;
  upload_id: number;
  rule_name: string;
  passed: boolean;
  details: Record<string, unknown>;
}

export async function findOrCreateClient(name: string): Promise<number> {
  const trimmed = name.trim();
  const inserted = await query<{ id: number }>(
    `INSERT INTO clients (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [trimmed]
  );
  return inserted[0].id;
}

export async function createUpload(input: UploadInput): Promise<{ uploadId: number; overallPass: boolean; status: string }> {
  const parsed = parseFile(input.buffer, input.mimeType);
  const validations = runValidations(parsed);

  const overallPass = validations.every((v) => v.passed);
  const status = overallPass ? 'SUCCESS' : 'FAILED';
  const clientId = await findOrCreateClient(input.clientName);

  const fileType = input.filename.endsWith('.csv') ? 'csv' : 'xlsx';

  const uploadRows = await query<{ id: number }>(
    `INSERT INTO uploads (client_id, filename, file_type, overall_pass, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [clientId, input.filename, fileType, overallPass, status]
  );
  const uploadId = uploadRows[0].id;

  for (const v of validations) {
    await query(
      'INSERT INTO validation_results (upload_id, rule_name, passed, details) VALUES ($1, $2, $3, $4)',
      [uploadId, v.rule, v.passed, JSON.stringify(v.details)]
    );
  }

  return { uploadId, overallPass, status };
}

export async function listUploads(clientId?: number): Promise<UploadRecord[]> {
  if (clientId) {
    return query<UploadRecord>(
      `SELECT u.id, u.client_id, u.filename, u.file_type, u.uploaded_at, u.overall_pass, u.status, c.name as client_name
       FROM uploads u JOIN clients c ON u.client_id = c.id WHERE u.client_id = $1 ORDER BY u.uploaded_at DESC`,
      [clientId]
    );
  }
  return query<UploadRecord>(
    `SELECT u.id, u.client_id, u.filename, u.file_type, u.uploaded_at, u.overall_pass, u.status, c.name as client_name
     FROM uploads u JOIN clients c ON u.client_id = c.id ORDER BY u.uploaded_at DESC`
  );
}

export async function getUploadById(id: number): Promise<{
  upload: UploadRecord & { client_name: string } | null;
  validations: ValidationRecord[];
}> {
  const uploads = await query<UploadRecord & { client_name: string }>(
    `SELECT u.id, u.client_id, u.filename, u.file_type, u.uploaded_at, u.overall_pass, u.status, c.name as client_name
     FROM uploads u JOIN clients c ON u.client_id = c.id WHERE u.id = $1`,
    [id]
  );
  const upload = uploads[0] ?? null;

  const validations = await query<ValidationRecord>(
    'SELECT id, upload_id, rule_name, passed, details FROM validation_results WHERE upload_id = $1 ORDER BY id',
    [id]
  );

  return { upload, validations };
}
