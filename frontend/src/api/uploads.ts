import { apiFetch } from './client';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'dev-token';

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

export interface ValidationResult {
  id: number;
  upload_id: number;
  rule_name: string;
  passed: boolean;
  details: Record<string, unknown>;
}

export interface UploadDetail {
  upload: UploadRecord & { client_name: string };
  validations: ValidationResult[];
}

export async function uploadFile(file: File, clientName: string): Promise<{ id: number; overallPass: boolean; status: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('clientName', clientName);

  const url = `${API_BASE}/uploads`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
    },
    body: formData,
  });

  if (res.status === 401) {
    throw new Error('Unauthorized: Invalid or missing token');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export async function listUploads(clientId?: number): Promise<UploadRecord[]> {
  const qs = clientId ? `?clientId=${clientId}` : '';
  return apiFetch<UploadRecord[]>(`/uploads${qs}`);
}

export async function getUpload(id: number): Promise<UploadDetail> {
  return apiFetch<UploadDetail>(`/uploads/${id}`);
}
