import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { useAuth, getDashboardPathForRole } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-brand-200 border-t-brand-800 animate-spin" />
          <p className="text-sm font-medium text-slate-600">
            Verifying SmartBite Role &amp; Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const correctDashboard = getDashboardPathForRole(user.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
        <Card className="max-w-lg w-full p-8 text-center space-y-5 border-amber-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              <Lock className="w-3.5 h-3.5" /> Role-Based Access Control (RBAC)
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Access Restricted for Your Role
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              You are currently signed in as{' '}
              <strong className="text-slate-900">{user.fullName}</strong> with the role{' '}
              <code className="px-2 py-0.5 rounded bg-slate-100 font-bold text-brand-800">
                {user.role.toUpperCase()}
              </code>
              . This route requires{' '}
              <code className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800">
                {allowedRoles.join(' or ').toUpperCase()}
              </code>{' '}
              permissions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button variant="primary" to={correctDashboard} icon={ArrowRight}>
              Go to Your Authorized Dashboard
            </Button>
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
            >
              Return Home
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return children;
}
