import React, { useState, useMemo } from 'react';
import { KERUSAKAN_KEYS, BIAYA_PER_BATANG_RUSAK } from '../constants';
import {
  Info,
  Wrench,
  Crosshair
} from 'lucide-react';

export default function AnatomiRokokView({ dataset }) {
  const [selectedKey, setSelectedKey] = useState('CW');

  // Hitung statistik per cacat dari dataset
  const stats = useMemo(() => {
    const totalSemua = dataset.reduce((s, d) => s + (Number(d.KERUSAKAN_TELAK) || 0), 0);
    const map = {};
    KERUSAKAN_KEYS.forEach((k) => {
      const count = dataset.reduce((s, d) => s + (Number(d[k.key]) || 0), 0);
      const pct = totalSemua > 0 ? ((count / totalSemua) * 100).toFixed(1) : '0.0';
      const estimasiKerugian = count * BIAYA_PER_BATANG_RUSAK;
      map[k.key] = { count, pct, estimasiKerugian };
    });
    return { totalSemua, map };
  }, [dataset]);

  const activeDefect = useMemo(() => {
    return KERUSAKAN_KEYS.find((k) => k.key === selectedKey) || KERUSAKAN_KEYS[0];
  }, [selectedKey]);

  const activeStat = stats.map[activeDefect.key] || { count: 0, pct: '0.0', estimasiKerugian: 0 };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Standar Mutu Fisik Rokok PT. SUKUN WARTONO INDONESIA</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Anatomi & Pemetaan 8 Cacat Batang Rokok
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Klik pada bagian batang rokok atau daftar kategori cacat di bawah untuk membedah titik lokasi, gejala fisik, dampak kerugian material, dan tindakan korektif di lantai produksi.
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700 shrink-0 text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Estimasi Kerugian Cacat</span>
            <span className="text-xl font-black text-emerald-400">
              Rp {(stats.totalSemua * BIAYA_PER_BATANG_RUSAK).toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              ({stats.totalSemua.toLocaleString('id-ID')} batang rusak)
            </span>
          </div>
        </div>
      </div>

      {/* Visual Interactive Cigarette Diagram */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
          <span>DIAGRAM VISUAL FISIK BATANG ROKOK</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Pilih Titik Inspeksi
          </span>
        </h4>

        {/* The Graphic Cigarette Stick */}
        <div className="relative py-8 px-4 sm:px-12 flex items-center justify-center overflow-x-auto">
          <div className="min-w-[620px] max-w-[800px] w-full flex items-center h-28 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-amber-200 dark:from-slate-800 dark:via-slate-800/60 dark:to-slate-800 border-2 border-amber-300/60 dark:border-slate-700 shadow-xl relative overflow-hidden">
            {/* Filter / Tembakau Ujung Kiri */}
            <div
              onClick={() => setSelectedKey('CW')}
              className={`w-36 h-full flex flex-col items-center justify-center cursor-pointer transition-all border-r-2 border-dashed border-amber-400/80 ${
                ['CW', 'MM'].includes(selectedKey)
                  ? 'bg-red-500/20 ring-4 ring-red-500/40'
                  : 'hover:bg-amber-200/40 dark:hover:bg-slate-700/40'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Ujung Telak
              </span>
              <span className="text-xs font-black text-red-600 dark:text-red-400">CW & MM</span>
              <span className="text-[9px] text-slate-500">Cowong & Mekar</span>
            </div>

            {/* Badan Kertas Papir Tengah */}
            <div
              onClick={() => setSelectedKey('PK')}
              className={`flex-1 h-full flex flex-col items-center justify-center cursor-pointer transition-all ${
                ['PK', 'MD', 'TK'].includes(selectedKey)
                  ? 'bg-amber-500/20 ring-4 ring-amber-500/40'
                  : 'hover:bg-amber-200/30 dark:hover:bg-slate-700/30'
              }`}
            >
              <div className="w-full flex items-center justify-center space-x-6">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Badan Papir
                  </span>
                  <span className="block text-xs font-black text-amber-600 dark:text-amber-400">
                    PK, MD & TK
                  </span>
                  <span className="text-[9px] text-slate-500">Kusut, Medot, Talipan</span>
                </div>
                <div className="text-center border-l pl-6 border-slate-300 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Garis Lem
                  </span>
                  <span className="block text-xs font-black text-blue-600 dark:text-blue-400">
                    LK (Lem Kurang)
                  </span>
                  <span className="text-[9px] text-slate-500">Sambungan Terbuka</span>
                </div>
              </div>
            </div>

            {/* Ujung Kanan / Struktur Kepadatan */}
            <div
              onClick={() => setSelectedKey('AT')}
              className={`w-36 h-full flex flex-col items-center justify-center cursor-pointer transition-all border-l-2 border-dashed border-amber-400/80 ${
                ['AT', 'MT'].includes(selectedKey)
                  ? 'bg-purple-500/20 ring-4 ring-purple-500/40'
                  : 'hover:bg-amber-200/40 dark:hover:bg-slate-700/40'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Struktur Isi
              </span>
              <span className="text-xs font-black text-purple-600 dark:text-purple-400">AT & MT</span>
              <span className="text-[9px] text-slate-500">Atos & Muntir</span>
            </div>
          </div>
        </div>

        {/* 8 Defect Pill Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
          {KERUSAKAN_KEYS.map((k) => {
            const isSelected = k.key === selectedKey;
            const count = stats.map[k.key]?.count || 0;
            return (
              <button
                key={k.key}
                onClick={() => setSelectedKey(k.key)}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'ring-2 shadow-md bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
                style={isSelected ? { borderColor: k.color, ringColor: k.color } : {}}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-mono font-black text-xs px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: k.color }}
                  >
                    {k.key}
                  </span>
                  <span className="text-[10px] font-bold opacity-75">{count} btg</span>
                </div>
                <div className="text-xs font-bold truncate mt-1">{k.label}</div>
                <div className="text-[10px] opacity-60 truncate">{k.location}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Deep-Dive Card of the Selected Defect */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Loss Cost */}
        <div className="space-y-4 md:border-r md:pr-6 border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <span
              className="text-lg font-mono font-black px-3 py-1.5 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: activeDefect.color }}
            >
              {activeDefect.key}
            </span>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeDefect.label}
              </h4>
              <span className="text-xs text-slate-500">Lokasi: {activeDefect.location}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Total Ditemukan:</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {activeStat.count.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-400">batang</span>
              </span>
              <span className="text-xs font-bold text-amber-600 block mt-0.5">
                {activeStat.pct}% dari total seluruh cacat
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-semibold block">Estimasi Kerugian:</span>
              <span className="text-base font-black text-red-600 dark:text-red-400">
                Rp {activeStat.estimasiKerugian.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Column: Gejala & Karakteristik */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Karakteristik & Gejala Cacat</span>
          </h5>
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white">
              {activeDefect.shortDesc}
            </p>
            <p>
              Cacat ini umumnya terdeteksi saat uji visual batang rokok pada meja telak atau saat mandor mengambil sampel acak sebelum rokok masuk ke bagian pengepakan / pembungkusan.
            </p>
          </div>
        </div>

        {/* Right Column: Mitigasi & Langkah Tindakan di Pabrik */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Wrench className="w-4 h-4 text-emerald-500" />
            <span>Tindakan Mitigasi QC & Mekanik</span>
          </h5>
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              Standar Operasional Penanganan:
            </p>
            <p>{activeDefect.mitigation}</p>
            <div className="pt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ Jika temuan melebihi batas toleransi mutu, segera lakukan kalibrasi mesin & pembinaan operator telak terkait.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
