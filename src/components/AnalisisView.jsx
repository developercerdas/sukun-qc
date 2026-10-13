import React, { useMemo } from 'react';
import { Award, AlertCircle, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AnalisisView({ dataset }) {
  // Peringkat Berdasarkan Operator (Nama Telak)
  const telakRankings = useMemo(() => {
    const map = {};
    dataset.forEach((d) => {
      const nama = d.NAMA || 'Tanpa Nama';
      if (!map[nama]) {
        map[nama] = {
          nama,
          garapan: 0,
          kerusakanTelak: 0,
          kerusakanMandor: 0,
          count: 0
        };
      }
      map[nama].garapan += Number(d.GARAPAN || 0);
      map[nama].kerusakanTelak += Number(d.KERUSAKAN_TELAK || 0);
      map[nama].kerusakanMandor += Number(d.KERUSAKAN_MANDOR || 0);
      map[nama].count += 1;
    });

    const arr = Object.values(map).map((item) => {
      const rasio = item.garapan > 0
        ? ((item.kerusakanTelak / item.garapan) * 100).toFixed(2)
        : '0.00';
      return { ...item, rasio: Number(rasio) };
    });

    // Urutkan dari rasio terendah (terbaik) ke tertinggi
    return arr.sort((a, b) => a.rasio - b.rasio);
  }, [dataset]);

  // Peringkat Berdasarkan Lokal
  const lokalRankings = useMemo(() => {
    const map = {};
    dataset.forEach((d) => {
      const lokal = d.LOKAL || 'Tanpa Lokal';
      if (!map[lokal]) {
        map[lokal] = {
          lokal,
          garapan: 0,
          kerusakanTelak: 0,
          count: 0
        };
      }
      map[lokal].garapan += Number(d.GARAPAN || 0);
      map[lokal].kerusakanTelak += Number(d.KERUSAKAN_TELAK || 0);
      map[lokal].count += 1;
    });

    const arr = Object.values(map).map((item) => {
      const rasio = item.garapan > 0
        ? ((item.kerusakanTelak / item.garapan) * 100).toFixed(2)
        : '0.00';
      return { ...item, rasio: Number(rasio) };
    });

    return arr.sort((a, b) => a.rasio - b.rasio);
  }, [dataset]);

  const topPerformers = telakRankings.slice(0, 5);
  const needTrainings = [...telakRankings].reverse().filter((t) => t.rasio > 1.0).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Cards: Best Performers vs Needs Attention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Terbaik */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Operator Telak Kualitas Terbaik
              </h3>
              <p className="text-xs text-slate-500">Rasio kerusakan rokok terendah</p>
            </div>
          </div>

          <div className="space-y-3">
            {topPerformers.map((op, idx) => (
              <div
                key={op.nama}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-900'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {op.nama}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Garapan: {op.garapan.toLocaleString('id-ID')} batang
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {op.rasio}%
                  </span>
                  <p className="text-[10px] text-slate-400">{op.kerusakanTelak} rusak</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Butuh Evaluasi */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-950/50 text-red-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Prioritas Pembinaan & Evaluasi QC
              </h3>
              <p className="text-xs text-slate-500">Operator dengan rasio kerusakan &gt; 1.0%</p>
            </div>
          </div>

          <div className="space-y-3">
            {needTrainings.length === 0 ? (
              <div className="p-6 text-center text-sm text-emerald-600 font-medium">
                Semua operator bekerja dengan standar kualitas optimal (&lt; 1.0% kerusakan)!
              </div>
            ) : (
              needTrainings.map((op, idx) => (
                <div
                  key={op.nama}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold text-xs">
                      !
                    </span>
                    <div>
                      <h5 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {op.nama}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Garapan: {op.garapan.toLocaleString('id-ID')} batang
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-red-600">{op.rasio}%</span>
                    <p className="text-[10px] text-slate-400">{op.kerusakanTelak} rusak</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Peringkat Lokal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Peringkat Performa Antar Lokasi Lokal
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 font-bold">
                <th className="p-3">Peringkat</th>
                <th className="p-3">Nama Lokal</th>
                <th className="p-3 text-right">Total Garapan</th>
                <th className="p-3 text-right text-red-600">Total Kerusakan</th>
                <th className="p-3 text-right">Rasio (%)</th>
                <th className="p-3 text-center">Status Mutu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {lokalRankings.map((lok, idx) => (
                <tr key={lok.lokal} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-500">#{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{lok.lokal}</td>
                  <td className="p-3 text-right font-semibold">
                    {lok.garapan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-red-600">
                    {lok.kerusakanTelak.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-black">{lok.rasio}%</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        lok.rasio <= 0.7
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : lok.rasio <= 1.0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {lok.rasio <= 0.7 ? 'Sangat Baik' : lok.rasio <= 1.0 ? 'Standar' : 'Perlu Evaluasi'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
