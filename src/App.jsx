import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import RequestDemoPage from './pages/RequestDemoPage';
import WorkspacePreviewPage from './pages/WorkspacePreviewPage';
import MessOwnerDashboardPage from './pages/MessOwnerDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Full-Screen SaaS Mess Owner Dashboard (Protected: mess_owner & super_admin) */}
        <Route
          path="/mess-owner-dashboard"
          element={
            <ProtectedRoute allowedRoles={['mess_owner', 'super_admin']}>
              <MessOwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mess-dashboard"
          element={<Navigate to="/mess-owner-dashboard" replace />}
        />

        {/* Full-Screen SaaS Student Dashboard (Protected: student & super_admin) */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student', 'super_admin']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Full-Screen SaaS Super Admin Console (Protected: super_admin ONLY) */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Public Marketing & Auth Pages inside PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/request-demo" element={<RequestDemoPage />} />
          <Route path="/workspace-preview" element={<WorkspacePreviewPage />} />
          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>
    </>
  );
}
