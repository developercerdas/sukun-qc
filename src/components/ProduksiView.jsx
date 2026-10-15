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
  ChevronRight,
  FileText
} from 'lucide-react';
import { exportToExcel, exportToCSV } from '../services/exportHelper';
import CetakKartuGilingModal from './CetakKartuGilingModal';

export default function ProduksiView({
  dataset,
  onDeleteData,
  onEditData,
  canEdit = true,
  canDelete = true,
  currentUser
}) {
  const isMandorScoped = !!(currentUser?.assignedLokal && currentUser.assignedLokal !== 'ALL');
  const [onlyMyLokal, setOnlyMyLokal] = useState(isMandorScoped);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailedDamages, setShowDetailedDamages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [kartuRecord, setKartuRecord] = useState(null);
  const pageSize = 15;

  const filteredData = useMemo(() => {
    let list = dataset;
    if (onlyMyLokal && isMandorScoped) {
      list = list.filter(
        (d) => String(d.LOKAL).trim().toLowerCase() === String(currentUser.assignedLokal).trim().toLowerCase()
      );
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((d) => {
      const matchNama = String(d.NAMA || '').toLowerCase().includes(q);
      const matchLokal = String(d.LOKAL || '').toLowerCase().includes(q);
      const matchTgl = String(d.TANGGAL || '').toLowerCase().includes(q);
      const matchHari = String(d.HARI || '').toLowerCase().includes(q);
      const matchJam = String(d.JAM_WIB || '').toLowerCase().includes(q);
      const matchAbsensi = String(d.ABSENSI || '').toLowerCase().includes(q);
      return matchNama || matchLokal || matchTgl || matchHari || matchJam || matchAbsensi;
    });
  }, [dataset, searchQuery, onlyMyLokal, isMandorScoped, currentUser]);

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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Workspace Banner Khusus Mandor */}
      {isMandorScoped && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-slate-900 border border-amber-500/30 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg shrink-0 border border-amber-500/30">
              📍
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-white">
                  Ruang Kerja Mandor: {currentUser.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/25 text-amber-300 border border-amber-500/40">
                  {currentUser.assignedLokal}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {onlyMyLokal
                  ? `Terkunci: Menampilkan ${filteredData.length} data produksi khusus wilayah ${currentUser.assignedLokal} milik Anda.`
                  : `Mode Terbuka: Menampilkan seluruh data produksi dari semua sektor pabrik.`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setOnlyMyLokal(!onlyMyLokal);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                onlyMyLokal
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {onlyMyLokal ? '✓ Hanya Wilayah Saya' : 'Tampilkan Seluruh Pabrik'}
            </button>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama telak, lokal, hari, tanggal, jam WIB..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDetailedDamages(!showDetailedDamages)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center space-x-1.5"
          >
            {showDetailedDamages ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Sembunyikan 8 Defect</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Rincian 8 Defect</span>
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 font-bold">
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Nama Telak</th>
                <th className="p-3.5">Lokal</th>
                <th className="p-3.5">Waktu (WIB)</th>
                <th className="p-3.5 text-right">Garapan</th>

                {/* 8 Detail Kerusakan jika toggled */}
                {showDetailedDamages && (
                  <>
                    <th className="p-2 text-center text-red-500 font-mono">CW</th>
                    <th className="p-2 text-center text-orange-500 font-mono">PK</th>
                    <th className="p-2 text-center text-amber-500 font-mono">LK</th>
                    <th className="p-2 text-center text-emerald-500 font-mono">TK</th>
                    <th className="p-2 text-center text-cyan-500 font-mono">MT</th>
                    <th className="p-2 text-center text-indigo-500 font-mono">MD</th>
                    <th className="p-2 text-center text-purple-500 font-mono">AT</th>
                    <th className="p-2 text-center text-pink-500 font-mono">MM</th>
                  </>
                )}

                <th className="p-3.5 text-right text-red-600 dark:text-red-400">Telak</th>
                <th className="p-3.5 text-right text-amber-600 dark:text-amber-400">Mandor</th>
                <th className="p-3.5 text-right">Rasio (%)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Aksi & Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={showDetailedDamages ? 17 : 9} className="p-8 text-center text-slate-500">
                    Belum ada data produksi. Silakan lakukan Input Tally Meja atau Import dari Excel untuk memulai pengujian.
                  </td>
                </tr>
              ) : (
                paginatedData.map((d) => {
                  const garapan = Number(d.GARAPAN || 0);
                  const telak = Number(d.KERUSAKAN_TELAK || 0);
                  const rasio = garapan > 0 ? ((telak / garapan) * 100).toFixed(2) : '0.00';
                  const isLulus = Number(rasio) <= 0.8;
                  const isWarning = Number(rasio) > 0.8 && Number(rasio) <= 1.2;

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-medium whitespace-nowrap">
                        {d.HARI ? `${d.HARI}, ` : ''}{d.TANGGAL}
                      </td>
                      <td className="p-3.5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {d.NAMA}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {d.LOKAL}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-500 text-[11px] font-mono font-semibold">
                        {d.JAM_WIB || '- WIB'}
                      </td>
                      <td className="p-3.5 text-right font-black whitespace-nowrap">
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
                      <td className="p-3.5 text-right whitespace-nowrap font-black">
                        {rasio}%
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLulus
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {isLulus ? 'LULUS' : isWarning ? 'WASPADA' : 'REJECT'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Cetak Kartu Giling */}
                          <button
                            onClick={() => setKartuRecord(d)}
                            title="Cetak Kartu Giling / Slip Meja"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => onEditData(d)}
                              title="Edit Data"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(d.id, d.NAMA, d.TANGGAL)}
                              title="Hapus Data"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <span>
            Menampilkan {paginatedData.length} dari {filteredData.length} data produksi
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kartu Giling Modal */}
      <CetakKartuGilingModal
        isOpen={!!kartuRecord}
        onClose={() => setKartuRecord(null)}
        record={kartuRecord}
      />
    </div>
  );
}
