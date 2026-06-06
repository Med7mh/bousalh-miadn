import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { signOut } from '../lib/firebase';
import { Home, Store, Calendar, BarChart3, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  const { profile } = useAuth();

  const isManager = profile?.role === 'manager';

  const navItems = [
    { to: '/', icon: Home, label: 'الرئيسية' },
    { to: '/shops', icon: Store, label: 'المحلات' },
    { to: '/follow-ups', icon: Calendar, label: 'المتابعات' },
  ];

  if (isManager) {
    navItems.push({ to: '/reports', icon: BarChart3, label: 'التقارير' });
  }

  return (
    <div className="flex pb-16 md:pb-0 h-screen overflow-hidden bg-slate-50 selection:bg-blue-100">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-200">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Store size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight text-slate-900">بوصلة ميدان</h2>
            <p className="text-xs text-slate-500">{isManager ? 'مدير النظام' : 'مندوب مبيعات'}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-right text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-safe z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center p-2 rounded-lg min-w-[4rem] transition-colors",
              isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <item.icon size={24} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
