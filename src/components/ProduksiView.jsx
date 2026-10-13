import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { exportToExcel, exportToCSV } from '../services/exportHelper';
import { KERUSAKAN_KEYS } from '../constants';

export default function ProduksiView({ dataset, onDeleteData, onEditData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailedDamages, setShowDetailedDamages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return dataset;
    const q = searchQuery.toLowerCase();
    return dataset.filter((d) => {
      const matchNama = String(d.NAMA || '').toLowerCase().includes(q);
      const matchLokal = String(d.LOKAL || '').toLowerCase().includes(q);
      const matchTgl = String(d.TANGGAL || '').toLowerCase().includes(q);
      const matchAbsensi = String(d.ABSENSI || '').toLowerCase().includes(q);
      return matchNama || matchLokal || matchTgl || matchAbsensi;
    });
  }, [dataset, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleDelete = (id, nama, tgl) => {
    if (window.confirm(`Yakin ingin menghapus data "${nama}" pada tanggal ${tgl}?`)) {
      onDeleteData(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama telak, lokal, tanggal..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDetailedDamages(!showDetailedDamages)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center space-x-1.5"
          >
            {showDetailedDamages ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Sembunyikan 8 Kolom Kerusakan</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Tampilkan 8 Kolom Kerusakan</span>
              </>
            )}
          </button>

          <button
            onClick={() => exportToExcel(filteredData)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportToCSV(filteredData)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 font-bold">
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Nama Telak</th>
                <th className="p-3.5">Lokal</th>
                <th className="p-3.5">Absensi</th>
                <th className="p-3.5 text-right">Garapan</th>

                {/* 8 Detail Kerusakan jika toggled */}
                {showDetailedDamages && (
                  <>
                    <th className="p-2 text-center text-red-500 font-mono">CW</th>
                    <th className="p-2 text-center text-orange-500 font-mono">PK</th>
                    <th className="p-2 text-center text-amber-500 font-mono">LK</th>
                    <th className="p-2 text-center text-emerald-500 font-mono">TK</th>
                    <th className="p-2 text-center text-blue-500 font-mono">MT</th>
                    <th className="p-2 text-center text-indigo-500 font-mono">MD</th>
                    <th className="p-2 text-center text-purple-500 font-mono">AT</th>
                    <th className="p-2 text-center text-pink-500 font-mono">MM</th>
                  </>
                )}

                <th className="p-3.5 text-right text-red-600 dark:text-red-400">Kerusakan Telak</th>
                <th className="p-3.5 text-right text-amber-600 dark:text-amber-400">Kerusakan Mandor</th>
                <th className="p-3.5 text-right">Rasio (%)</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={showDetailedDamages ? 16 : 8} className="p-8 text-center text-slate-500">
                    Tidak ada data produksi yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedData.map((d) => {
                  const garapan = Number(d.GARAPAN || 0);
                  const telak = Number(d.KERUSAKAN_TELAK || 0);
                  const rasio = garapan > 0 ? ((telak / garapan) * 100).toFixed(2) : '0.00';

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-medium whitespace-nowrap">{d.TANGGAL}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {d.NAMA}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {d.LOKAL}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            d.ABSENSI === 'Hadir'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {d.ABSENSI || 'Hadir'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold whitespace-nowrap">
                        {garapan.toLocaleString('id-ID')}
                      </td>

                      {/* 8 Kerusakan */}
                      {showDetailedDamages && (
                        <>
                          <td className="p-2 text-center font-mono">{d.CW || 0}</td>
                          <td className="p-2 text-center font-mono">{d.PK || 0}</td>
                          <td className="p-2 text-center font-mono">{d.LK || 0}</td>
                          <td className="p-2 text-center font-mono">{d.TK || 0}</td>
                          <td className="p-2 text-center font-mono">{d.MT || 0}</td>
                          <td className="p-2 text-center font-mono">{d.MD || 0}</td>
                          <td className="p-2 text-center font-mono">{d.AT || 0}</td>
                          <td className="p-2 text-center font-mono">{d.MM || 0}</td>
                        </>
                      )}

                      <td className="p-3.5 text-right font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                        {telak.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {Number(d.KERUSAKAN_MANDOR || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            Number(rasio) > 1.0 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {rasio}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onEditData(d)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id, d.NAMA, d.TANGGAL)}
                            title="Hapus Data"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <span>
            Menampilkan {paginatedData.length} dari {filteredData.length} data produksi
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
