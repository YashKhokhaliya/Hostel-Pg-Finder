import React from 'react';
import { Home, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-800/80 bg-gray-950/90 text-gray-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base">StayHub</span>
              <p className="text-xs text-gray-500">Premium Hostel & PG Finder Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Property Listings</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Direct Owner Contact</span>
            </span>
          </div>

          <p className="text-xs text-gray-500 text-center md:text-right">
            © {new Date().getFullYear()} StayHub. Built with precision for students & property owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
