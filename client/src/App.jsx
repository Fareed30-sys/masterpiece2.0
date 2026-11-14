import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import QuickLoginModal from './components/QuickLoginModal';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerPortal from './pages/CustomerPortal';
import AgentInbox from './pages/AgentInbox';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

export const App = () => {
  const { user } = useAuth();
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <Navbar onOpenDemoModal={() => setDemoModalOpen(true)} />

      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to={user.role === 'agent' ? '/agent/inbox' : '/portal'} replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to={user.role === 'agent' ? '/agent/inbox' : '/portal'} replace /> : <RegisterPage />}
          />

          {/* Customer Support Portal */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'agent']} />}>
            <Route path="/portal" element={<CustomerPortal />} />
          </Route>

          {/* Support Agent & Executive Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
            <Route path="/agent/inbox" element={<AgentInbox />} />
            <Route path="/agent/analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* Default Root Redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === 'agent' ? '/agent/inbox' : '/portal'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 1-Click Role Switcher Demo Modal */}
      <QuickLoginModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
};

export default App;
