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
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return null;

  const { upload, validations } = data;

  return (
    <div>
      <h1>Validation Report</h1>
      <p>
        <strong>File:</strong> {upload.filename} | <strong>Client:</strong> {upload.client_name}
      </p>
      <p>
        <strong>Overall:</strong>{' '}
        <span style={{ color: upload.overall_pass ? 'green' : 'red', fontWeight: 'bold' }}>
          {upload.overall_pass ? 'PASS' : 'FAIL'}
        </span>
      </p>
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
              <td style={{ color: v.passed ? 'green' : 'red' }}>
                {v.passed ? 'PASS' : 'FAIL'}
              </td>
              <td>
                <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(v.details, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <Link to="/history">Back to history</Link> | <Link to="/">Upload another</Link>
      </p>
    </div>
  );
}
