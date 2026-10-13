import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Play,
  RotateCcw
} from 'lucide-react';
import { auditDataset } from '../services/storage';

export default function AuditView({ dataset, onDeleteData, onBatchDelete }) {
  const [hasRun, setHasRun] = useState(true);

  const auditResult = useMemo(() => {
    return auditDataset(dataset);
  }, [dataset]);

  const handleCleanDuplicates = async () => {
    const duplicates = auditResult.issues.filter((i) => i.kolom === 'DUPLIKAT');
    if (duplicates.length === 0) {
      alert('Tidak ada data duplikat yang ditemukan.');
      return;
    }

    if (
      window.confirm(
        `Ditemukan ${duplicates.length} data ganda/duplikat. Hapus baris duplikat tersebut sekarang?`
      )
    ) {
      const idsToDelete = duplicates.map((d) => d.id);
      await onBatchDelete(idsToDelete);
      alert(`Berhasil menghapus ${idsToDelete.length} data duplikat!`);
    }
  };

  const handleCleanZeroGarapan = async () => {
    const zeroRows = auditResult.issues.filter((i) => i.kolom === 'GARAPAN');
    if (zeroRows.length === 0) {
      alert('Tidak ada data garapan bernilai 0.');
      return;
    }

    if (
      window.confirm(
        `Ditemukan ${zeroRows.length} baris dengan Garapan 0. Hapus baris tersebut?`
      )
    ) {
      const idsToDelete = zeroRows.map((d) => d.id);
      await onBatchDelete(idsToDelete);
      alert(`Berhasil menghapus ${idsToDelete.length} baris dengan garapan 0!`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span>Audit Kualitas & Integritas Data Otomatis</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mendeteksi inkonsistensi matematis, data duplikat, dan nilai kosong pada seluruh baris database PT. Sukun.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {auditResult.issuesCount > 0 && (
            <>
              <button
                onClick={handleCleanDuplicates}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Bersihkan Duplikat</span>
              </button>
              <button
                onClick={handleCleanZeroGarapan}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Garapan 0</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Baris Diperiksa</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {auditResult.totalChecked.toLocaleString('id-ID')}
          </h4>
          <p className="text-xs text-slate-400 mt-1">100% dataset diperiksa</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase">Temuan Anomali & Masalah</p>
          <h4
            className={`text-2xl font-black mt-1 ${
              auditResult.issuesCount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {auditResult.issuesCount}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {auditResult.issuesCount === 0 ? 'Tidak ada anomali' : 'Perlu ditinjau'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase">Skor Kesehatan Data</p>
          <h4
            className={`text-2xl font-black mt-1 ${
              auditResult.issuesCount === 0
                ? 'text-emerald-600'
                : auditResult.issuesCount < 5
                ? 'text-amber-500'
                : 'text-red-600'
            }`}
          >
            {auditResult.totalChecked > 0
              ? `${Math.max(
                  0,
                  (
                    ((auditResult.totalChecked - auditResult.issuesCount) /
                      auditResult.totalChecked) *
                    100
                  ).toFixed(1)
                )}%`
              : '100%'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">Indeks kepatuhan input</p>
        </div>
      </div>

      {/* Detail Masalah List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Daftar Rincian Temuan Audit
        </h4>

        {auditResult.issuesCount === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h5 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
              Semua Data Bersih & Akurat!
            </h5>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-md mx-auto">
              Tidak ditemukan data ganda, nilai garapan 0, ataupun kerusakan yang melebihi jumlah garapan rokok.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 font-bold">
                  <th className="p-3">Baris #</th>
                  <th className="p-3">Kolom</th>
                  <th className="p-3">Kategori Masalah</th>
                  <th className="p-3">Saran Perbaikan</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {auditResult.issues.map((iss, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-slate-500">#{iss.row}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {iss.kolom}
                    </td>
                    <td className="p-3 text-red-600 font-semibold">{iss.masalah}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{iss.saran}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteData(iss.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="Hapus baris bermasalah ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
