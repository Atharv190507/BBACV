import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import IssueCertificate from './components/IssueCertificate';
import VerifyCertificate from './components/VerifyCertificate';
import Login from './components/Login';
import Signup from './components/Signup';
import StudentPortal from './components/StudentPortal';
import AdminPanel from './components/AdminPanel';
import AIChat from './components/AIChat';
import Settings from './components/Settings';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children?: React.ReactNode, requiredRole?: UserRole[] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a minimal loading spinner while checking session
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    // If user is logged in but doesn't have the role, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Dashboard />} /> {/* Dashboard is now public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Semi-Public Route (Can be used by anyone, but authenticated users get more info) */}
            <Route path="/verify" element={<VerifyCertificate />} />

            {/* Protected Routes */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={[UserRole.ADMIN]}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/issue" element={
              <ProtectedRoute requiredRole={[UserRole.INSTITUTION, UserRole.ADMIN]}>
                <IssueCertificate />
              </ProtectedRoute>
            } />
            <Route path="/student-portal" element={
               <ProtectedRoute requiredRole={[UserRole.STUDENT]}>
                  <StudentPortal />
               </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AIChat />
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;