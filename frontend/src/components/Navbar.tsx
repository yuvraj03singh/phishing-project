import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Search, FileSpreadsheet, LayoutDashboard, History, Cpu, BookOpen, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Home', icon: Shield },
    { to: '/scanner', label: 'URL Scanner', icon: Search },
    { to: '/batch', label: 'Batch Scan', icon: FileSpreadsheet },
    { to: '/dashboard', label: 'Telemetry', icon: LayoutDashboard },
    { to: '/history', label: 'Scan History', icon: History },
    { to: '/model-info', label: 'Model Intel', icon: Cpu },
    { to: '/research', label: 'Research', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 group-hover:scale-105 transition">
              <Shield size={22} className="group-hover:text-blue-300" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white font-mono flex items-center gap-1.5">
                PHISHGUARD<span className="text-blue-500">.AI</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 block -mt-1 uppercase">
                Hybrid ML Threat Intelligence
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                  <UserIcon size={13} className="text-blue-400" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-slate-300 transition"
                  title="Logout"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <LogIn size={14} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-sm shadow-blue-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
