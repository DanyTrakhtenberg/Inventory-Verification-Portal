import { getDb } from '../db';
import type { UploadRecord, ValidationRecord } from '../db';
import { parseFile } from './fileParser.service';
import { runValidations } from './validation.service';

export type { UploadRecord, ValidationRecord } from '../db';

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  clientName: string;
}

export async function createUpload(
  input: UploadInput
): Promise<{ uploadId: number; overallPass: boolean; status: string }> {
  const parsed = parseFile(input.buffer, input.mimeType);
  const validations = runValidations(parsed);

  const overallPass = validations.every((v) => v.passed);
  const status = overallPass ? 'SUCCESS' : 'FAILED';

  const db = getDb();
  const clientId = await db.findOrCreateClient(input.clientName);

  const fileType = input.filename.endsWith('.csv') ? 'csv' : 'xlsx';
  const uploadId = await db.insertUpload(
    clientId,
    input.filename,
    fileType,
    overallPass,
    status
  );

  for (const v of validations) {
    await db.insertValidationResult(uploadId, v.rule, v.passed, v.details);
  }

  return { uploadId, overallPass, status };
}

export async function listUploads(clientId?: number): Promise<UploadRecord[]> {
  return getDb().listUploads(clientId);
}

export async function getUploadById(id: number): Promise<{
  upload: UploadRecord | null;
  validations: ValidationRecord[];
}> {
  return getDb().getUploadById(id);
}
