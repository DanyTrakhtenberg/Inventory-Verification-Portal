/**
 * Database service interface - domain-focused API.
 * Swap implementations for testing (e.g. in-memory) or different databases.
 */
export interface ClientRecord {
  id: number;
  name: string;
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

export interface IDbService {
  findOrCreateClient(name: string): Promise<number>;
  insertUpload(
    clientId: number,
    filename: string,
    fileType: string,
    overallPass: boolean,
    status: string
  ): Promise<number>;
  insertValidationResult(
    uploadId: number,
    ruleName: string,
    passed: boolean,
    details: Record<string, unknown>
  ): Promise<void>;
  listUploads(clientId?: number): Promise<UploadRecord[]>;
  getUploadById(id: number): Promise<{
    upload: UploadRecord | null;
    validations: ValidationRecord[];
  }>;
  listClients(): Promise<ClientRecord[]>;
}
