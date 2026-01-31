import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUpload } from '../api/uploads';
import type { UploadDetail } from '../api/uploads';

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UploadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getUpload(Number(id))
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return null;

  const { upload, validations } = data;

  return (
    <div>
      <h1>Validation Report</h1>
      <div className="page-card" style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>File:</strong> {upload.filename}
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>Client:</strong> {upload.client_name}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Overall:</strong>{' '}
          <span className={upload.overall_pass ? 'status-pass' : 'status-fail'}>
            {upload.overall_pass ? 'PASS' : 'FAIL'}
          </span>
        </p>
      </div>
      <h2>Validation Rules</h2>
      <table>
        <thead>
          <tr>
            <th>Rule</th>
            <th>Result</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {validations.map((v) => (
            <tr key={v.id}>
              <td>{v.rule_name}</td>
              <td>
                <span className={v.passed ? 'status-pass' : 'status-fail'}>
                  {v.passed ? 'PASS' : 'FAIL'}
                </span>
              </td>
              <td>
                <pre>{JSON.stringify(v.details, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/history">Back to history</Link>
        {' · '}
        <Link to="/">Upload another</Link>
      </p>
    </div>
  );
}
