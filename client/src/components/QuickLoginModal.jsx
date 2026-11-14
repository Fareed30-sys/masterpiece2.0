import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Shield, Building2, User, Zap, CheckCircle2 } from 'lucide-react';

export const QuickLoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const demoAccounts = [
    {
      role: 'agent',
      name: 'Sarah Connor',
      title: 'Senior CX Lead & Copilot Operator',
      email: 'agent@omnipulse.ai',
      company: 'OmniPulse CX Operations',
      badge: 'Agent & Executive Access',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      description: 'Access the Agent Copilot Workspace, triage 12 live customer tickets, regenerate tone drafts, and generate Executive AI Reports.',
      redirectTo: '/agent/inbox',
    },
    {
      role: 'customer',
      name: 'Alex Rivera',
      title: 'Enterprise VP of Engineering',
      email: 'alex.rivera@techcorp.io',
      company: 'TechCorp Solutions',
      badge: 'Enterprise Customer',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Has critical billing & webhook tickets. Test live AI resolution chat, FAQ instant answering, and ticket escalation.',
      redirectTo: '/portal',
    },
    {
      role: 'customer',
      name: 'Elena Rostova',
      title: 'Operations Director',
      email: 'elena@novaworks.com',
      company: 'NovaWorks LLC',
      badge: 'Growth Customer',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: 'Customer with shipping, RBAC, and product feature inquiries with positive and frustrated ticket history.',
      redirectTo: '/portal',
    },
  ];

  const handleSelect = async (account) => {
    const isAgent = account.role === 'agent';
    const fallbackUser = {
      id: isAgent ? 'user_1' : 'user_2',
      name: account.name,
      email: account.email,
      role: account.role,
      companyName: account.company,
    };
    
    // Instant sub-millisecond local transition
    localStorage.setItem('omnipulse_token', isAgent ? 'demo_fallback_agent' : 'demo_fallback_customer');
    localStorage.setItem('omnipulse_user', JSON.stringify(fallbackUser));
    
    // Non-blocking background sync with backend
    login(account.email, 'password123').catch(() => {});
    
    onClose();
    navigate(account.redirectTo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">1-Click Role Switcher</h3>
              <p className="text-xs text-slate-400">
                Instantly switch between Support Agent and Customer personas with pre-seeded data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Cards */}
        <div className="mt-5 space-y-3">
          {demoAccounts.map((acc) => (
            <div
              key={acc.email}
              onClick={() => handleSelect(acc)}
              className="group p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {acc.name}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${acc.badgeColor}`}>
                    {acc.badge}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {acc.company}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-[11px] text-slate-400">{acc.email}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{acc.description}</p>
              </div>

              <button
                type="button"
                className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 group-hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Log In As
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>All accounts pre-configured with password: <code className="text-indigo-400 font-mono">password123</code></span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLoginModal;
