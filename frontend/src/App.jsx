import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WorkerDashboard from './pages/WorkerDashboard';
import LogEarnings from './pages/LogEarnings';
import VerifierDashboard from './pages/VerifierDashboard';
import AdvocateDashboard from './pages/AdvocateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GrievanceBoard from './pages/Grievance';
import BulletinBoard from './pages/BulletinBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider, AuthContext } from './context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={`/${user.role}`} />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Worker Routes */}
          <Route path="/worker/*" element={
            <ProtectedRoute allowedRole="worker">
              <Layout>
                <Routes>
                  <Route path="/" element={<WorkerDashboard />} />
                  <Route path="/log" element={<LogEarnings />} />
                  <Route path="/grievances" element={<GrievanceBoard />} />
                  <Route path="/bulletin" element={<BulletinBoard />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Verifier Routes */}
          <Route path="/verifier/*" element={
            <ProtectedRoute allowedRole="verifier">
              <Layout>
                <Routes>
                  <Route path="/" element={<VerifierDashboard />} />
                  <Route path="/bulletin" element={<BulletinBoard />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Advocate Routes */}
          <Route path="/advocate/*" element={
            <ProtectedRoute allowedRole="advocate">
              <Layout>
                <Routes>
                  <Route path="/" element={<AdvocateDashboard />} />
                  <Route path="/grievances" element={<GrievanceBoard />} />
                  <Route path="/bulletin" element={<BulletinBoard />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <Layout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/grievances" element={<GrievanceBoard />} />
                  <Route path="/bulletin" element={<BulletinBoard />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
