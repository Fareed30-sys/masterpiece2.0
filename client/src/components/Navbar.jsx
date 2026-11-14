import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  Inbox,
  MessageSquareText,
  LogOut,
  User,
  Shield,
  Zap,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ onOpenDemoModal }) => {
  const { user, logout, isAgent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  OmniPulse
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-0.5">
                Autonomous CX Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {isAgent ? (
                <>
                  <Link
                    to="/agent/inbox"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/agent/inbox')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Inbox className="w-4 h-4" />
                    Agent Copilot Inbox
                  </Link>
                  <Link
                    to="/agent/analytics"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/agent/analytics')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    CX Analytics & Report
                  </Link>
                </>
              ) : (
                <Link
                  to="/portal"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/portal')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <MessageSquareText className="w-4 h-4" />
                  Customer Portal & AI Chat
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right Section: 1-Click Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Button */}
          <button
            onClick={onOpenDemoModal}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Switch Demo Role
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                    {user.role === 'agent' ? (
                      <span className="text-indigo-400 font-medium">Support Agent</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Customer</span>
                    )}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-sm">
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <p className="font-semibold text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <p className="text-[11px] text-indigo-400 mt-0.5">{user.companyName}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        if (onOpenDemoModal) onOpenDemoModal();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Switch Role (1-Click Demo)
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
