import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listUploads } from '../api/uploads';
import { listClients } from '../api/clients';
import type { UploadRecord } from '../api/uploads';
import type { Client } from '../api/clients';

export function HistoryPage() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filterClientId, setFilterClientId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [uploadsRes, clientsRes] = await Promise.all([
          listUploads(filterClientId || undefined),
          listClients(),
        ]);
        setUploads(uploadsRes);
        setClients(clientsRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filterClientId]);

  return (
    <div>
      <h1>Upload History</h1>
      <div>
        <label htmlFor="filter">Filter by client</label>
        <select
          id="filter"
          value={filterClientId}
          onChange={(e) => setFilterClientId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Filename</th>
              <th>Type</th>
              <th>Uploaded</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.client_name ?? '-'}</td>
                <td>{u.filename}</td>
                <td>{u.file_type}</td>
                <td>{new Date(u.uploaded_at).toLocaleString()}</td>
                <td>{u.overall_pass ? 'PASS' : 'FAIL'}</td>
                <td>
                  <Link to={`/report/${u.id}`}>View report</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && uploads.length === 0 && <p>No uploads found.</p>}
    </div>
  );
}
