import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [demoNotice, setDemoNotice] = useState('');
  const [error, setError] = useState('');

  const { sendPasswordReset, isSupabaseConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDemoNotice('');
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPasswordReset(email);
      setSent(true);
      if (res?.demoMode) {
        setDemoNotice(res.message);
      }
    } catch (err) {
      setError(err.message || 'Unable to send password recovery email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="green" icon={KeyRound}>
            Account Recovery
          </Badge>
          <Badge variant={isSupabaseConfigured ? 'green' : 'amber'}>
            {isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}
          </Badge>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Forgot Your Password?
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter your registered institutional or student email address and we will send a password reset link.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-brand-700" />
                <span>Recovery Instructions Generated</span>
              </div>
              <p>
                {demoNotice ||
                  `We have sent a password reset link to ${email}. Please check your inbox and spam folder.`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" to="/reset-password" className="w-full">
                Preview Reset Password Screen
              </Button>
              <Button variant="ghost" to="/login" className="w-full">
                Back to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
            </Button>
          </form>
        )}

        <div className="pt-3 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
