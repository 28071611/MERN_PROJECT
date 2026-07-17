import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import SearchItems from './pages/SearchItems';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="container" style={{ flex: 1, paddingBottom: '60px' }}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/search" element={<SearchItems user={user} />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute user={user}>
                <ReportItem user={user} />
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute user={user}>
                <ReportItem user={user} />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute user={user} adminOnly={true}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer style={{
          borderTop: '1px solid var(--color-border)',
          padding: '24px 0',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          background: 'rgba(5, 8, 20, 0.4)'
        }}>
          <div className="container">
            © {new Date().getFullYear()} Retrievo Portal (MERN Stack). All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
