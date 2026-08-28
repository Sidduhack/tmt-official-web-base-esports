import { useState } from 'react';
import { PlayerProfile, NotificationItem, UserRole } from '../types';
import {
  Trophy,
  Users,
  ShieldAlert,
  Flame,
  Radio,
  Bell,
  Scale,
  Settings,
  UserCheck,
  ChevronDown,
  Layers,
  CheckCircle2,
  ExternalLink,
  Menu,
  X,
  Server,
  Zap,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: PlayerProfile | null;
  allPlayers: PlayerProfile[];
  notifications: NotificationItem[];
  onSwitchPersona: (userId: string) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onOpenDiagModal: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  currentUser,
  allPlayers,
  notifications,
  onSwitchPersona,
  onMarkNotificationRead,
  onOpenDiagModal,
}: Props) {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isAdmin = currentUser && ['SUPER_ADMIN', 'COMPETITION_ADMIN', 'FINANCE_ADMIN', 'VERIFICATION_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN'].includes(currentUser.role);

  const navItems = [
    { id: 'home', label: 'Home', icon: Flame },
    { id: 'competitions', label: 'Tournaments', icon: Trophy },
    { id: 'teams', label: 'Teams & Rosters', icon: Users },
    { id: 'leaderboards', label: 'Leaderboard', icon: Layers },
    { id: 'stream', label: 'TMT Live', icon: Radio, badge: 'LIVE' },
    { id: 'fairplay', label: 'Fair Play', icon: ShieldAlert },
    { id: 'compliance', label: 'Legal & Policy', icon: Scale },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080b11]/95 backdrop-blur border-b border-slate-800 shadow-xl">
      {/* Top Banner: Channel & Architecture Status */}
      <div className="bg-gradient-to-r from-amber-600/20 via-slate-900 to-red-600/20 border-b border-slate-800/80 px-4 py-1 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-semibold text-white tracking-wide">TMT OFFICIAL YT ESPORTS</span>
            <span className="text-slate-400 hidden sm:inline">• Official Free Fire India Competition Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="header-open-diag-btn"
              onClick={onOpenDiagModal}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[11px] bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded cursor-pointer transition hover:bg-amber-950/70"
              title="Inspect Multi-Database & Multi-Drive storage cluster"
            >
              <Server className="w-3 h-3" />
              <span>Cluster Status (5 DBs / 3 Vaults)</span>
            </button>
            <a
              href="https://youtube.com/@tmtofficialyt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 hidden md:flex"
            >
              <span>Subscribe YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center font-extrabold text-black text-xl shadow-lg border border-amber-400/40">
            TMT
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white font-heading uppercase">
                TMT Official YT
              </span>
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                PRO FF
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono -mt-0.5">INDIA ESPORTS MATRIX</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-red-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin Command Center Link */}
          {isAdmin && (
            <button
              id="nav-link-admin"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-1 ${
                activeTab === 'admin'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-slate-800/80 text-amber-400 hover:bg-slate-800 border border-amber-500/30'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin Hub</span>
            </button>
          )}
        </nav>

        {/* Right Actions: Persona Selector & Notifications & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="header-notif-btn"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-black shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f1420] border border-slate-700 rounded-xl shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-400" /> Notifications
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">{notifications.length} Total</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.notificationId}
                        onClick={() => {
                          onMarkNotificationRead(n.notificationId);
                          if (n.link) {
                            if (n.link.startsWith('/match/')) {
                              setActiveTab('competitions');
                            } else if (n.link.startsWith('/stream')) {
                              setActiveTab('stream');
                            }
                          }
                          setShowNotifMenu(false);
                        }}
                        className={`p-2.5 hover:bg-slate-800/60 rounded-lg cursor-pointer transition ${
                          !n.isRead ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-200">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Persona Switcher (Super Admin, Verifier, Captain, Player) */}
          <div className="relative">
            <button
              id="header-persona-switcher-btn"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition cursor-pointer"
            >
              {currentUser && (
                <>
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.displayName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover border border-amber-500/40"
                  />
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[10px] text-amber-400 font-mono leading-none">
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0f1420] border border-slate-700 rounded-xl shadow-2xl z-50 p-2">
                <div className="px-2 py-1.5 border-b border-slate-800 text-xs font-bold text-slate-300">
                  Switch Active Persona (Testing)
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 mt-1">
                  {allPlayers.map(p => (
                    <button
                      key={p.global_user_id}
                      onClick={() => {
                        onSwitchPersona(p.global_user_id);
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                        currentUser?.global_user_id === p.global_user_id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={p.avatarUrl}
                          alt={p.displayName}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-bold text-white">{p.displayName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.role} • {p.database_id.split('-')[0]}
                          </p>
                        </div>
                      </div>
                      {currentUser?.global_user_id === p.global_user_id && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowPersonaMenu(false);
                    }}
                    className="text-xs text-amber-400 hover:underline font-medium px-2 py-1"
                  >
                    View My Full Profile
                  </button>
                  <button
                    onClick={() => {
                      onOpenDiagModal();
                      setShowPersonaMenu(false);
                    }}
                    className="text-xs text-cyan-400 hover:underline font-mono px-2 py-1"
                  >
                    Cluster Architecture
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            id="header-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d121c] border-b border-slate-800 px-4 py-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                  isActive ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
                activeTab === 'admin' ? 'bg-red-500/20 text-red-400' : 'text-amber-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin Hub</span>
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('profile');
              setMobileMenuOpen(false);
            }}
            className="w-full px-3 py-2 rounded-lg text-sm text-slate-300 flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>My Player Profile & UID</span>
          </button>
        </div>
      )}
    </header>
  );
}
