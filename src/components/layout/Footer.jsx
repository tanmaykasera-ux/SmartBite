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
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-100 border-t border-brand-900">
      {/* Top Institutional Value Strip */}
      <div className="border-b border-brand-900/80 bg-brand-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-800/80 border border-brand-700 flex items-center justify-center text-brand-200 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Entitlement-First Institutional SaaS • Not a Food Delivery App
              </p>
              <p className="text-xs text-brand-300">
                Students retain 100% of their meal entitlement regardless of whether they submit a daily meal selection.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-200">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Free for Students
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Built for Mess Operators
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> ICMR-NIN Nutrition Aligned
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Contact Details */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Smart<span className="text-brand-400">Bite</span>
                </span>
                <p className="text-xs text-brand-300">Eat Smart. Waste Less.</p>
              </div>
            </Link>
            <p className="text-sm text-brand-200/80 max-w-sm leading-relaxed">
              SmartBite helps institutional kitchens predict food demand, optimize inventory, reduce food waste, and improve nutrition transparency across college messes and hostels.
            </p>
            <div className="space-y-2 pt-2 text-xs text-brand-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <a href="mailto:partnerships@smartbite.ai" className="hover:text-white">
                  partnerships@smartbite.ai
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <a href="tel:+918045682910" className="hover:text-white">
                  +91 (80) 4568-2910 • Mon–Sat, 9 AM – 7 PM IST
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
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
                    className="w-9 h-9 rounded-xl bg-brand-900 hover:bg-brand-800 border border-brand-800 flex items-center justify-center text-brand-300 hover:text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-200/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="hover:text-white transition-colors">
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
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Portals &amp; Access
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-200/80">
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
                <Link to="/request-demo" className="hover:text-white transition-colors">
                  Get a Live Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Core Solutions
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-200/80">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  AI Demand Forecasting
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Food Waste Tracking
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
                  Nutrition Intelligence
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-brand-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-400">
          <p>© {new Date().getFullYear()} SmartBite Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/about" className="hover:text-brand-200">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-brand-200">
              Terms of Institutional Service
            </Link>
            <Link to="/about" className="hover:text-brand-200">
              Student Entitlement Charter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
