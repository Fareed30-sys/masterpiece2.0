import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  BarChart3,
  Ticket,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ isOpen, onToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  const agentItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Inbox },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const customerItems = [
    { to: '/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/chat', label: 'Chat with AI', icon: MessageCircle },
  ];

  const items = user?.role === 'agent' ? agentItems : customerItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1 px-3">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:text-primary-600 dark:group-hover:text-primary-400'}`} />
                  <span className={`whitespace-nowrap transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center p-3 border-t border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </aside>
    </>
  );
}
