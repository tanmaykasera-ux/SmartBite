import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  UtensilsCrossed,
  ArrowUpRight,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#072112] via-[#05190e] to-[#031109] text-brand-100 border-t border-brand-900">
      {/* Subtle Decorative Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-brand-700/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-emerald-700/10 blur-3xl"
      />

      {/* Top Institutional Value Strip */}
      <div className="relative border-b border-brand-900/90 bg-[#092917]/80 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-800/90 border border-brand-700 flex items-center justify-center text-brand-200 shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">
                Entitlement-First Institutional SaaS • Not a Food Delivery App
              </p>
              <p className="text-xs sm:text-sm text-brand-200/85 mt-0.5">
                Students retain 100% of their meal entitlement regardless of whether they submit a daily meal selection.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-medium text-brand-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-900/80 border border-brand-800">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Free for Students
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-900/80 border border-brand-800">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Built for Mess Operators
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-900/80 border border-brand-800">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> ICMR-NIN Macro Aligned
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Grid with Enhanced Spacing */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
          {/* Brand & Contact Details */}
          <div className="lg:col-span-5 space-y-5 pr-0 lg:pr-8">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-brand-700 group-hover:bg-brand-600 transition-colors flex items-center justify-center text-white shadow-md">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  Smart<span className="text-brand-400">Bite</span>
                </span>
                <p className="text-xs font-medium text-brand-300 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3 h-3 text-brand-400" />
                  Eat Smart. Waste Less.
                </p>
              </div>
            </Link>

            <p className="text-sm text-brand-200/85 max-w-md leading-relaxed">
              SmartBite is an AI-powered food management and nutrition intelligence platform designed for college messes, hostels, institutional kitchens, and campus cafeterias.
            </p>

            <div className="space-y-3 pt-2 text-xs text-brand-200/90">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-900/90 border border-brand-800 flex items-center justify-center text-brand-400 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:partnerships@smartbite.ai" className="hover:text-white transition-colors">
                  partnerships@smartbite.ai
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-900/90 border border-brand-800 flex items-center justify-center text-brand-400 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a href="tel:+918045682910" className="hover:text-white transition-colors">
                  +91 (80) 4568-2910 • Mon–Sat, 9 AM – 7 PM IST
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-900/90 border border-brand-800 flex items-center justify-center text-brand-400 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>27th Main Road, HSR Layout Sector 2, Bengaluru, KA 560102</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
                { label: 'Twitter / X', href: 'https://x.com', icon: Twitter },
                { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
                { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
              ].map((soc) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={soc.label}
                    className="w-9 h-9 rounded-xl bg-brand-900/80 hover:bg-brand-800 border border-brand-800/90 flex items-center justify-center text-brand-300 hover:text-white transition-all hover:-translate-y-0.5"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm text-brand-200/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing (Indicative)
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Access */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Portals &amp; Access
            </h3>
            <ul className="space-y-3 text-sm text-brand-200/80">
              <li>
                <Link to="/mess-owner-dashboard" className="hover:text-white transition-colors">
                  Mess Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/student-dashboard" className="hover:text-white transition-colors">
                  Student Free Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Account Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Sign Up (Mess / Student)
                </Link>
              </li>
              <li>
                <Link
                  to="/request-demo"
                  className="inline-flex items-center gap-1 font-semibold text-brand-300 hover:text-white transition-colors"
                >
                  Get a Live Demo <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Core Solutions
            </h3>
            <ul className="space-y-3 text-sm text-brand-200/80">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  AI Demand Forecasting
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Food Waste Tracking Ledger
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Smart Inventory &amp; Purchase
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Student Meal Preferences
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Nutrition Macro Intelligence
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-14 pt-8 border-t border-brand-900/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-400">
          <p>© {new Date().getFullYear()} SmartBite Technologies. Eat Smart. Waste Less.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/about" className="hover:text-brand-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-brand-200 transition-colors">
              Terms of Institutional Service
            </Link>
            <Link to="/about" className="hover:text-brand-200 transition-colors">
              Student Entitlement Charter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
