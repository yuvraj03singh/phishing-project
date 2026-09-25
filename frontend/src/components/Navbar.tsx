import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Search,
  FileSpreadsheet,
  LayoutDashboard,
  History,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "Home", icon: Shield },
    { to: "/scanner", label: "URL Scanner", icon: Search },
    { to: "/batch", label: "Batch Scan", icon: FileSpreadsheet },
    { to: "/dashboard", label: "Telemetry", icon: LayoutDashboard },
    { to: "/history", label: "Scan History", icon: History },
  ];

  return (
    <header className="site-header sticky top-0 z-50 w-full border-b-0 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 group-hover:bg-blue-100 transition">
              <Shield size={22} className="group-hover:text-blue-300" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 font-mono flex items-center gap-1.5">
                PHISHGUARD<span className="text-blue-500">.AI</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 block -mt-1 uppercase">
                URL safety checker
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
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                  <UserIcon size={13} className="text-blue-400" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-slate-600 transition"
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
                  className="flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
                >
                  <LogIn size={14} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
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
