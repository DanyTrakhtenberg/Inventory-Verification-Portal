import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportPage } from './pages/ReportPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ marginBottom: '1rem', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Upload</Link>
        <Link to="/history">History</Link>
      </nav>
      <main style={{ padding: '1rem', maxWidth: '900px' }}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
