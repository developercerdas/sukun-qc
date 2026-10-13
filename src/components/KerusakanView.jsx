import React, { useMemo } from 'react';
import { KERUSAKAN_KEYS } from '../constants';
import { AlertTriangle, Wrench } from 'lucide-react';

const ACTION_TIPS = {
  CW: 'Periksa ketajaman pisau pemotong dan kepadatan racikan tembakau di ujung telak.',
  PK: 'Periksa kelembaban kertas papir dan tekanan roll penarik agar tidak melipat.',
  LK: 'Periksa kekentalan lem kanji/perekat dan kebersihan spuit aplikator lem.',
  TK: 'Bersihkan sabuk konveyor/talipan gilingan secara berkala dari residu minyak/debu.',
  MT: 'Kalibrasi keselarasan rol pemutar giling agar puntiran batang simetris.',
  MD: 'Atur elastisitas papir dan hindari tarikan mendadak saat proses penggulungan.',
  AT: 'Sesuaikan takaran densitas isi tembakau agar batang tidak terlalu padat/keras.',
  MM: 'Periksa diameter ujung rokok dan cetakan corong telak agar lingkaran presisi.'
};

export default function KerusakanView({ dataset }) {
  // Hitung total tiap jenis kerusakan
  const damageStats = useMemo(() => {
    const totalSemuaKerusakan = dataset.reduce(
      (sum, d) => sum + (Number(d.KERUSAKAN_TELAK) || 0),
      0
    );

    const stats = KERUSAKAN_KEYS.map((k) => {
      const total = dataset.reduce((sum, d) => sum + (Number(d[k.key]) || 0), 0);
      const percentage = totalSemuaKerusakan > 0 ? (total / totalSemuaKerusakan) * 100 : 0;
      return {
        ...k,
        total,
        percentage,
        tip: ACTION_TIPS[k.key] || 'Lakukan pemeriksaan operasional standar.'
      };
    });

    // Urutkan dari kerusakan paling banyak (Pareto Analysis)
    return {
      totalSemua: totalSemuaKerusakan,
      items: stats.sort((a, b) => b.total - a.total)
    };
  }, [dataset]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Analisis Rincian Kerusakan & Diagram Pareto</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Menganalisis 8 kategori cacat rokok batangan untuk menentukan prioritas perbaikan kualitas produksi.
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-xl text-xs text-amber-800 dark:text-amber-200">
          Total Kerusakan Akumulasi: <strong className="text-sm font-bold">{damageStats.totalSemua.toLocaleString('id-ID')}</strong> Batang
        </div>
      </div>

      {/* Grid Cards Per Defect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {damageStats.items.map((item, idx) => (
          <div
            key={item.key}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">#{idx + 1} Terbanyak</span>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.key}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.label}</h4>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {item.total.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, item.percentage)}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item.tip}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Matriks Rekomendasi Pencegahan Defect Pabrik
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 font-bold">
                <th className="p-3">Peringkat</th>
                <th className="p-3">Kode</th>
                <th className="p-3">Nama Cacat</th>
                <th className="p-3 text-right">Jumlah (Batang)</th>
                <th className="p-3 text-right">Kontribusi (%)</th>
                <th className="p-3">Tindakan Mitigasi QC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {damageStats.items.map((it, i) => (
                <tr key={it.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-500">#{i + 1}</td>
                  <td className="p-3 font-mono font-bold" style={{ color: it.color }}>
                    {it.key}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{it.label}</td>
                  <td className="p-3 text-right font-bold">{it.total.toLocaleString('id-ID')}</td>
                  <td className="p-3 text-right font-semibold">{it.percentage.toFixed(2)}%</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{it.tip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
