import React from 'react';
import {
  LayoutDashboard,
  PenSquare,
  UploadCloud,
  Boxes,
  Crosshair,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Factory,
  X,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { soundFx } from '../utils/soundHelper';

const NAV_GROUPS = [
  {
    category: 'OPERASIONAL LANTAI',
    items: [
      { id: 'dashboard', label: 'Dashboard & KPI', icon: LayoutDashboard },
      { id: 'input', label: 'Input Tally QC Meja', icon: PenSquare, iconBadge: Zap },
      { id: 'import', label: 'Import Excel', icon: UploadCloud, badge: 'Unggulan' }
    ]
  },
  {
    category: 'INSPEKSI & MUTU',
    items: [
      { id: 'produksi', label: 'Data & Kartu Giling', icon: Boxes },
      { id: 'anatomi', label: 'Anatomi 8 Cacat Rokok', icon: Crosshair },
      { id: 'analisis', label: 'Leaderboard Operator', icon: TrendingUp }
    ]
  },
  {
    category: 'LAPORAN & SISTEM',
    items: [
      { id: 'laporan', label: 'Cetak Laporan Resmi', icon: FileSpreadsheet },
      { id: 'audit', label: 'Audit Kualitas Data', icon: ShieldCheck },
      { id: 'pengaturan', label: 'Database & GitHub', icon: Settings }
    ]
  }
];

export default function ModernSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  soundEnabled,
  toggleSound,
  liveRatio,
  totalGarapan
}) {
  const handleNavClick = (tabId) => {
    soundFx.playClick();
    setActiveTab(tabId);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const ratioNum = Number(liveRatio || 0);
  const isAqlPass = ratioNum <= 0.8;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Futuristic Floating Glassmorphism Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-24' : 'lg:w-80'
        } ${
          mobileOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0'
        } p-3 sm:p-4 shrink-0 select-none`}
      >
        <div className="h-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl text-white rounded-3xl border border-slate-800 shadow-2xl shadow-slate-950/50 flex flex-col overflow-hidden relative">
          {/* Subtle Ambient Glow behind logo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* 1. Header Brand Cockpit */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3 flex-1 min-w-0 mr-2">
              {/* Animated Glowing Factory Icon */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30 shrink-0 ring-2 ring-emerald-400/30">
                <Factory className="w-5 h-5 text-slate-950" />
              </div>

              {(!collapsed || mobileOpen) && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h1 className="font-black text-xs sm:text-[13px] tracking-wide text-white leading-snug">
                      PT. SUKUN WARTONO INDONESIA
                    </h1>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    QUALITY CONTROL SYSTEM
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Grouped Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {NAV_GROUPS.map((grp) => (
              <div key={grp.category} className="space-y-1">
                {(!collapsed || mobileOpen) && (
                  <div className="px-3 py-1 text-[9px] font-black tracking-widest text-slate-500 uppercase">
                    {grp.category}
                  </div>
                )}

                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={collapsed && !mobileOpen ? item.label : undefined}
                      className={`w-full flex items-center ${
                        collapsed && !mobileOpen
                          ? 'justify-center p-3'
                          : 'space-x-3 px-3.5 py-2.5'
                      } rounded-2xl text-xs font-bold transition-all relative group ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black shadow-lg shadow-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-1 top-2 bottom-2 w-1 bg-white rounded-full" />
                      )}

                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />

                      {(!collapsed || mobileOpen) && (
                        <>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {item.badge && !isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* 3. Mini AQL Gauge Widget (Sidebar Footer) */}
          {(!collapsed || mobileOpen) && (
            <div className="p-3 mx-3 mb-2 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Indeks Mutu AQL</span>
                <span className={isAqlPass ? 'text-emerald-400' : 'text-red-400'}>
                  {isAqlPass ? 'LULUS (GRADE A)' : 'WASPADA'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-white">
                  {liveRatio}% <span className="text-[10px] font-normal text-slate-400">defect</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {totalGarapan.toLocaleString('id-ID')} btg
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isAqlPass ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, ratioNum * 50))}%` }}
                />
              </div>
            </div>
          )}

          {/* 4. Bottom Controls (Sound Toggle & Collapse Toggle) */}
          <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
            {/* Audio Feedback Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Matikan Suara Audio Tally' : 'Aktifkan Suara Audio Tally'}
              className={`p-2 rounded-xl transition-colors ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {(!collapsed || mobileOpen) && (
              <span className="text-[10px] text-slate-400 font-mono">
                SQC v2.6 Enterprise
              </span>
            )}

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
