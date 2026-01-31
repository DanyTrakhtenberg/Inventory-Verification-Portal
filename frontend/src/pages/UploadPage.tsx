import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../api/uploads';

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file || !clientName.trim()) {
      setError('Please select a file and enter client name');
      return;
    }
    setLoading(true);
    try {
      const result = await uploadFile(file, clientName.trim());
      navigate(`/report/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Upload Inventory</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="clientName">Client Name</label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>
        <div>
          <label htmlFor="file">File (CSV or XLSX)</label>
          <input
            id="file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}
