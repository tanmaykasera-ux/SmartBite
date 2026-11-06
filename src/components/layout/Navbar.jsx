import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import Button from '../common/Button';
import { useAuth, getDashboardPathForRole } from '../../context/AuthContext';

const navLinks = [
  { name: 'Home', path: '/', hash: '' },
  { name: 'Features', path: '/#features', routeFallback: '/features' },
  { name: 'How It Works', path: '/#how-it-works', routeFallback: '/#how-it-works' },
  { name: 'Pricing', path: '/#pricing', routeFallback: '/pricing' },
  { name: 'About Us', path: '/about', hash: '' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, item) => {
    setMobileMenuOpen(false);
    if (item.path.startsWith('/#')) {
      const targetId = item.path.replace('/#', '');
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const dashboardUrl = user ? getDashboardPathForRole(user.role) : '/mess-owner-dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-cream-50/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Top Status & Business Model Strip */}
      <div className="bg-brand-950 text-brand-50 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>
              <strong className="font-semibold text-white">Eat Smart. Waste Less.</strong> Institutional FoodTech SaaS — Free for Students • Unconditional Meal Entitlement Guaranteed
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[11px] font-semibold">
                <AlertCircle className="w-3 h-3 text-amber-300" />
                Demo Mode (Supabase .env Not Connected)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-800 text-brand-200 border border-brand-700 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Live Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. SmartBite Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-800 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-900 transition-colors">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Smart<span className="text-brand-700">Bite</span>
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 -mt-0.5">
                Eat Smart. Waste Less.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links: Home, Features, How It Works, Pricing, About Us */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/' && !location.hash
                  : location.pathname === link.path ||
                    location.pathname === link.routeFallback;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Buttons: Login & Get a Demo (or Dashboard when signed in) */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="soft"
                  size="md"
                  to={dashboardUrl}
                  icon={LayoutDashboard}
                  iconPosition="left"
                >
                  {user.role === 'mess_owner'
                    ? 'Mess Owner Dashboard'
                    : user.role === 'super_admin'
                    ? 'Admin Console'
                    : 'Student Portal'}
                </Button>
                <Button variant="primary" size="md" to="/request-demo">
                  Get a Demo
                </Button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Button variant="secondary" size="md" to="/login">
                  Login
                </Button>
                <Button variant="primary" size="md" to="/request-demo" icon={ArrowRight}>
                  Get a Demo
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {user ? (
              <>
                <Button
                  variant="soft"
                  to={dashboardUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  Open Dashboard ({user.fullName})
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  to="/request-demo"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={ArrowRight}
                  className="w-full"
                >
                  Get a Demo
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
