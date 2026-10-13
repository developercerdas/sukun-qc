import React, { useState } from 'react';
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
  Moon,
  Sun,
  RotateCw,
  Volume2,
  VolumeX,
  Factory,
  Database
} from 'lucide-react';
import { soundFx } from '../utils/soundHelper';

const NAV_TABS = [
  { id: 'dashboard', label: 'Ringkasan Mutu', icon: LayoutDashboard },
  { id: 'input', label: 'Input Tally QC', icon: PenSquare },
  { id: 'import', label: 'Import Excel', icon: UploadCloud, highlight: true },
  { id: 'produksi', label: 'Data Produksi', icon: Boxes },
  { id: 'anatomi', label: 'Anatomi Cacat', icon: Crosshair },
  { id: 'analisis', label: 'Peringkat & KPI', icon: TrendingUp },
  { id: 'laporan', label: 'Cetak Laporan', icon: FileSpreadsheet },
  { id: 'audit', label: 'Audit Integritas', icon: ShieldCheck },
  { id: 'pengaturan', label: 'Konfigurasi DB', icon: Settings },
];

export default function CommandNavbar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  isSupabaseConnected,
  isRefreshing,
  onRefresh,
  currentShift,
  setCurrentShift
}) {
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) soundFx.playClick();
  };

  const handleTabClick = (tabId) => {
    soundFx.playClick();
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg shrink-0">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-slate-800/60">
        {/* Brand & Factory Header */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-black tracking-wider text-white">
                PT. SUKUN WARTONO INDONESIA
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                INDUSTRIAL QC
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sistem Pengawasan Mutu & Kerusakan Rokok Batangan
            </p>
          </div>
        </div>

        {/* Right Status & Tools */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* Shift Selector */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Shift:</span>
            <select
              value={currentShift}
              onChange={(e) => setCurrentShift(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Shift 1" className="bg-slate-900 text-white">Shift 1 (Pagi)</option>
              <option value="Shift 2" className="bg-slate-900 text-white">Shift 2 (Siang)</option>
              <option value="Shift 3" className="bg-slate-900 text-white">Shift 3 (Malam)</option>
            </select>
          </div>

          {/* Database Connection Pill */}
          <div
            className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl font-semibold border ${
              isSupabaseConnected
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                : 'bg-blue-950/60 text-blue-300 border-blue-700/60'
            }`}
            title={
              isSupabaseConnected
                ? 'Terhubung ke Database Cloud Supabase'
                : 'Mode Penyimpanan Lokal (Offline)'
            }
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${
                isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
              }`}
            />
            <span>{isSupabaseConnected ? 'Cloud DB' : 'Lokal Offline'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Matikan Suara Audio Tally' : 'Aktifkan Suara Audio Tally'}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Segarkan Data"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Ribbon (Segmented Pill Tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1.5 min-w-max">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : tab.highlight
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
