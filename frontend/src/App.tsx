import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportPage } from './pages/ReportPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Inventory Verification Portal</h1>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Upload</Link>
            <Link to="/history" className="nav-link">History</Link>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
