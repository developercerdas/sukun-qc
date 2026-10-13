import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { exportToExcel } from '../services/exportHelper';

function getTodayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function LaporanView({ dataset, references }) {
  const [filterDate, setFilterDate] = useState(getTodayString);
  const [filterLokal, setFilterLokal] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('Mandor QC PT. SUKUN WARTONO INDONESIA');
  const [kepalaBagian, setKepalaBagian] = useState('Kepala Bagian Produksi');

  // Filter dataset untuk laporan yang dicetak
  const reportData = useMemo(() => {
    return dataset.filter((d) => {
      if (filterDate && d.TANGGAL !== filterDate) return false;
      if (filterLokal && d.LOKAL !== filterLokal) return false;
      return true;
    });
  }, [dataset, filterDate, filterLokal]);

  const summary = useMemo(() => {
    const totalGarapan = reportData.reduce((s, d) => s + (Number(d.GARAPAN) || 0), 0);
    const totalTelak = reportData.reduce((s, d) => s + (Number(d.KERUSAKAN_TELAK) || 0), 0);
    const totalMandor = reportData.reduce((s, d) => s + (Number(d.KERUSAKAN_MANDOR) || 0), 0);
    const totalPapir = reportData.reduce((s, d) => s + (Number(d.KEKURANGAN_PAPIR) || 0), 0);
    const rasio = totalGarapan > 0 ? ((totalTelak / totalGarapan) * 100).toFixed(2) : '0.00';

    return { totalGarapan, totalTelak, totalMandor, totalPapir, rasio };
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden during print) */}
      <div className="no-print bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Pusat Cetak Laporan Resmi & Ekspor</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Format lembar kendali mutu berstandar PT. SUKUN WARTONO INDONESIA. Siap dicetak ke printer atau disimpan sebagai PDF.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={() => exportToExcel(reportData, `Laporan_QC_PT_Sukun_Wartono_Indonesia_${filterDate || 'Semua'}.xlsx`)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Pilih Tanggal Laporan
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Filter Lokal
            </label>
            <select
              value={filterLokal}
              onChange={(e) => setFilterLokal(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            >
              <option value="">Semua Lokal</option>
              {references.lokal.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nama Mandor QC (Pemeriksa)
            </label>
            <input
              type="text"
              value={penanggungJawab}
              onChange={(e) => setPenanggungJawab(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nama Kepala Bagian Produksi
            </label>
            <input
              type="text"
              value={kepalaBagian}
              onChange={(e) => setKepalaBagian(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Official Report Document Sheet (Prints perfectly) */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 max-w-5xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Kop Surat PT. Sukun */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-wider text-slate-900">
                PT. SUKUN WARTONO INDONESIA
              </h1>
              <p className="text-xs font-semibold tracking-wide text-amber-700">
                BAGIAN QUALITY CONTROL & PENGAWASAN MUTU PRODUKSI
              </p>
              <p className="text-[11px] text-slate-600">
                Kudus, Jawa Tengah &bull; Sistem Pengawasan Kerusakan Rokok Batangan (SQC)
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded">
                DOKUMEN RESMI QC
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Ref: QC-SUKUN-2026</p>
            </div>
          </div>
        </div>

        {/* Info Laporan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Tanggal Produksi:</span>
            <strong className="text-slate-900 text-sm">{filterDate || 'Semua Tanggal'}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Lokal / Sektor:</span>
            <strong className="text-slate-900 text-sm">{filterLokal || 'Semua Lokal'}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Total Garapan:</span>
            <strong className="text-slate-900 text-sm">{summary.totalGarapan.toLocaleString('id-ID')} Batang</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Rata-rata Cacat:</span>
            <strong className={`text-sm ${Number(summary.rasio) > 1.0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {summary.rasio}%
            </strong>
          </div>
        </div>

        {/* Tabel Data Rekapitulasi */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <th className="p-2 border border-slate-300 text-center w-8">No</th>
                <th className="p-2 border border-slate-300">Nama Telak</th>
                <th className="p-2 border border-slate-300">Lokal</th>
                <th className="p-2 border border-slate-300 text-center">Absensi</th>
                <th className="p-2 border border-slate-300 text-right">Garapan</th>
                <th className="p-2 border border-slate-300 text-center font-mono">CW</th>
                <th className="p-2 border border-slate-300 text-center font-mono">PK</th>
                <th className="p-2 border border-slate-300 text-center font-mono">LK</th>
                <th className="p-2 border border-slate-300 text-center font-mono">TK</th>
                <th className="p-2 border border-slate-300 text-center font-mono">MT</th>
                <th className="p-2 border border-slate-300 text-center font-mono">MD</th>
                <th className="p-2 border border-slate-300 text-center font-mono">AT</th>
                <th className="p-2 border border-slate-300 text-center font-mono">MM</th>
                <th className="p-2 border border-slate-300 text-right font-bold">Telak</th>
                <th className="p-2 border border-slate-300 text-right font-bold">Mandor</th>
                <th className="p-2 border border-slate-300 text-right">Rasio</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="p-6 text-center text-slate-500">
                    Tidak ada data produksi pada tanggal atau filter yang dipilih.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => {
                  const garapan = Number(row.GARAPAN || 0);
                  const telak = Number(row.KERUSAKAN_TELAK || 0);
                  const rasio = garapan > 0 ? ((telak / garapan) * 100).toFixed(2) : '0.00';
                  return (
                    <tr key={row.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-bold">{row.NAMA}</td>
                      <td className="p-2 border border-slate-300">{row.LOKAL}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.ABSENSI || 'Hadir'}</td>
                      <td className="p-2 border border-slate-300 text-right font-semibold">
                        {garapan.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-300 text-center">{row.CW || 0}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.PK || 0}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.LK || 0}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.TK || 0}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.MT || 0}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.MD || 0}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.AT || 0}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.MM || 0}</td>
                      <td className="p-2 border border-slate-300 text-right font-bold text-red-600">
                        {telak.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-semibold text-amber-700">
                        {Number(row.KERUSAKAN_MANDOR || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-bold">
                        {rasio}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                <td colSpan={4} className="p-2.5 border border-slate-300 text-center uppercase">
                  TOTAL AKUMULASI
                </td>
                <td className="p-2.5 border border-slate-300 text-right">
                  {summary.totalGarapan.toLocaleString('id-ID')}
                </td>
                <td colSpan={8} className="p-2.5 border border-slate-300 text-center text-slate-500">
                  -
                </td>
                <td className="p-2.5 border border-slate-300 text-right text-red-700">
                  {summary.totalTelak.toLocaleString('id-ID')}
                </td>
                <td className="p-2.5 border border-slate-300 text-right text-amber-800">
                  {summary.totalMandor.toLocaleString('id-ID')}
                </td>
                <td className="p-2.5 border border-slate-300 text-right">
                  {summary.rasio}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tanda Tangan Mandor & Kepala Bagian */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div>
            <p className="text-slate-600">Dibuat & Diperiksa oleh:</p>
            <p className="font-semibold text-slate-800 mt-0.5">Mandor Pengawas Mutu (QC)</p>
            <div className="h-16 flex items-end justify-center">
              <div className="w-48 border-b border-slate-800" />
            </div>
            <p className="font-bold text-slate-900 mt-2">( {penanggungJawab} )</p>
          </div>

          <div>
            <p className="text-slate-600">Mengetahui & Menyetujui:</p>
            <p className="font-semibold text-slate-800 mt-0.5">Kepala Bagian Produksi PT. SUKUN WARTONO INDONESIA</p>
            <div className="h-16 flex items-end justify-center">
              <div className="w-48 border-b border-slate-800" />
            </div>
            <p className="font-bold text-slate-900 mt-2">( {kepalaBagian} )</p>
          </div>
        </div>
      </div>
    </div>
  );
}
