import React, { useState } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Kanban, Settings, Bell, Search,
  ChevronLeft, LogOut, Briefcase, User, ShieldCheck, ChevronDown
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';

export default function Layout() {
  const { currentUser, users, switchUser, notifications } = useLeads();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  if (!currentUser) return <div className="h-screen bg-jeton-black flex items-center justify-center text-jeton-orange animate-pulse">Loading LeadSphere...</div>;

  const nav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['Business Manager', 'Sales Executive'] },
    { name: 'Leads', icon: Users, path: '/leads', roles: ['Business Manager', 'Sales Executive'] },
    { name: 'Pipeline', icon: Kanban, path: '/board', roles: ['Business Manager'] },
  ].filter(item => item.roles.includes(currentUser.role));

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-jeton-black text-jeton-light overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className={`relative flex flex-col border-r border-jeton-gray transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'} bg-jeton-black`}>

        {/* Logo */}
        <div className="h-20 flex items-center px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-jeton-orange flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,92,0,0.4)]">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="slide-right">
              <h1 className="text-xl font-bold tracking-tight text-white font-outfit">LeadSphere</h1>
              <p className="text-[10px] text-jeton-orange font-bold uppercase tracking-widest leading-none mt-0.5">HSR MOTORS</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${active ? 'bg-jeton-orange text-white shadow-lg shadow-jeton-orange/20' : 'text-zinc-400 hover:bg-jeton-gray hover:text-white'}`}>
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!collapsed && <span className="font-semibold text-sm">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Nav */}
        <div className="px-3 pb-6 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-jeton-gray hover:text-white transition-colors">
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-semibold text-sm">Settings</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-jeton-gray hover:text-white transition-colors">
            <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span className="font-semibold text-sm">Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-jeton-gray flex items-center justify-between px-8 bg-jeton-black/50 backdrop-blur-md z-10">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-jeton-orange transition-colors" />
              <input
                type="text"
                placeholder="Search leads, models, or customers..."
                className="w-full h-11 bg-jeton-gray border border-transparent focus:border-jeton-orange/30 rounded-xl pl-11 pr-4 text-sm
                  transition-all outline-none text-white placeholder:text-zinc-600 focus:bg-jeton-black" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <div className="relative">
              <button className="w-11 h-11 bg-jeton-gray rounded-xl flex items-center justify-center text-zinc-400 hover:text-jeton-orange transition-colors border border-transparent hover:border-jeton-orange/20">
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-jeton-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-jeton-black">
                    {unread}
                  </span>
                )}
              </button>
            </div>

            {/* User Switcher / Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-jeton-gray rounded-2xl hover:bg-jeton-gray/80 transition-all border border-transparent hover:border-jeton-orange/20">
                <div className="w-9 h-9 rounded-xl bg-jeton-orange/10 border border-jeton-orange/30 flex items-center justify-center text-jeton-orange font-bold">
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold leading-none text-white">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-jeton-orange uppercase tracking-wider mt-1">{currentUser.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute top-full mt-2 right-0 w-64 bg-jeton-gray border border-white/5 rounded-2xl shadow-2xl p-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 mb-2">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Switch Identity</p>
                    </div>
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { switchUser(u.id); setShowUserMenu(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                          ${currentUser.id === u.id ? 'bg-jeton-orange/10 border border-jeton-orange/20' : 'hover:bg-white/5 border border-transparent'}`}>
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {u.avatar}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${currentUser.id === u.id ? 'text-jeton-orange' : 'text-zinc-300'}`}>{u.name}</p>
                          <p className="text-[10px] text-zinc-500">{u.role}</p>
                        </div>
                      </button>
                    ))}
                    <div className="h-px bg-white/5 my-2 mx-2" />
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-coral hover:bg-coral/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-semibold">Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Screen Content */}
        <div className="flex-1 overflow-auto bg-jeton-black">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
