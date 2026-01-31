import { Pool } from 'pg';
import type {
  IDbService,
  UploadRecord,
  ValidationRecord,
} from './db.service.interface';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/inventory_verification';

export class PgDbService implements IDbService {
  private pool: Pool;

  constructor(connString?: string) {
    this.pool = new Pool({
      connectionString: connString ?? connectionString,
    });
  }

  async findOrCreateClient(name: string): Promise<number> {
    const trimmed = name.trim();
    const result = await this.pool.query(
      `INSERT INTO clients (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [trimmed]
    );
    return result.rows[0].id;
  }

  async insertUpload(
    clientId: number,
    filename: string,
    fileType: string,
    overallPass: boolean,
    status: string
  ): Promise<number> {
    const result = await this.pool.query(
      `INSERT INTO uploads (client_id, filename, file_type, overall_pass, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [clientId, filename, fileType, overallPass, status]
    );
    return result.rows[0].id;
  }

  async insertValidationResult(
    uploadId: number,
    ruleName: string,
    passed: boolean,
    details: Record<string, unknown>
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO validation_results (upload_id, rule_name, passed, details)
       VALUES ($1, $2, $3, $4)`,
      [uploadId, ruleName, passed, JSON.stringify(details)]
    );
  }

  async listUploads(clientId?: number): Promise<UploadRecord[]> {
    const sql = clientId
      ? `SELECT u.id, u.client_id, u.filename, u.file_type, u.uploaded_at, u.overall_pass, u.status, c.name as client_name
         FROM uploads u JOIN clients c ON u.client_id = c.id WHERE u.client_id = $1 ORDER BY u.uploaded_at DESC`
      : `SELECT u.id, u.client_id, u.filename, u.file_type, u.uploaded_at, u.overall_pass, u.status, c.name as client_name
         FROM uploads u JOIN clients c ON u.client_id = c.id ORDER BY u.uploaded_at DESC`;
    const params = clientId ? [clientId] : [];
    const result = await this.pool.query(sql, params);
    return result.rows as UploadRecord[];
  }

  async getUploadById(id: number): Promise<{
    upload: UploadRecord | null;
    validations: ValidationRecord[];
  }> {
    const uploadResult = await this.pool.query(
      `SELECT u.id, u.client_id, u.filename, u.file_type, u.uploaded_at, u.overall_pass, u.status, c.name as client_name
       FROM uploads u JOIN clients c ON u.client_id = c.id WHERE u.id = $1`,
      [id]
    );
    const upload = (uploadResult.rows[0] as UploadRecord) ?? null;

    const validationsResult = await this.pool.query(
      'SELECT id, upload_id, rule_name, passed, details FROM validation_results WHERE upload_id = $1 ORDER BY id',
      [id]
    );
    const validations = validationsResult.rows as ValidationRecord[];

    return { upload, validations };
  }

  async listClients(): Promise<{ id: number; name: string }[]> {
    const result = await this.pool.query(
      'SELECT id, name FROM clients ORDER BY name'
    );
    return result.rows as { id: number; name: string }[];
  }
}

export function createPgDbService(connectionString?: string): IDbService {
  return new PgDbService(connectionString);
}
