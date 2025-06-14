import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SuspenseFallback from './components/SuspenseFallback';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';

// Lazy load admin pages for better performance
const Users = React.lazy(() => import('./pages/admin/Users'));
const Roles = React.lazy(() => import('./pages/admin/Roles'));
const Permissions = React.lazy(() => import('./pages/admin/Permissions'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Suspense fallback={<SuspenseFallback />}>
                    <Users />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Suspense fallback={<SuspenseFallback />}>
                    <Roles />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/permissions" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Suspense fallback={<SuspenseFallback />}>
                    <Permissions />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 