import { apiFetch } from './client';

export interface Client {
  id: number;
  name: string;
}

export async function listClients(): Promise<Client[]> {
  return apiFetch<Client[]>('/clients');
}
