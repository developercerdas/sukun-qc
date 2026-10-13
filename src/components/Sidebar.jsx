import React from 'react';
import {
  LayoutDashboard,
  PenSquare,
  UploadCloud,
  Boxes,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'input', label: 'Input Harian', icon: PenSquare },
  { id: 'import', label: 'Import Excel', icon: UploadCloud },
  { id: 'produksi', label: 'Data Produksi', icon: Boxes },
  { id: 'kerusakan', label: 'Data Kerusakan', icon: AlertTriangle },
  { id: 'analisis', label: 'Analisis & Peringkat', icon: TrendingUp },
  { id: 'laporan', label: 'Laporan & Ekspor', icon: FileSpreadsheet },
  { id: 'audit', label: 'Audit Kualitas Data', icon: ShieldCheck },
  { id: 'pengaturan', label: 'Pengaturan & DB', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-30 shadow-xl border-r border-slate-800 shrink-0`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="bg-amber-500 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-lg tracking-wider shadow-md shrink-0">
            SQC
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="font-bold text-white text-sm tracking-wide leading-tight">
                PT. SUKUN
              </h1>
              <p className="text-xs text-amber-400 font-medium tracking-normal">
                Wartono Indonesia
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'space-x-3 px-3'
              } py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        {!collapsed && (
          <span className="truncate">v2.5 &bull; Sukun QC Enterprise</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors ml-auto"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
