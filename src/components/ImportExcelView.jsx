import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Database,
  ArrowRight
} from 'lucide-react';
import { downloadExcelTemplate, parseAndValidateExcel } from '../services/exportHelper';

export default function ImportExcelView({ onBatchImport, onNavigateToProduksi }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsingResult, setParsingResult] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [filterPreview, setFilterPreview] = useState('all'); // 'all', 'valid', 'invalid'
  const [importSuccess, setImportSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setSelectedFile(file);
    setIsParsing(true);
    setImportSuccess(null);
    try {
      const result = await parseAndValidateExcel(file);
      setParsingResult(result);
    } catch (err) {
      alert('Gagal membaca file Excel: ' + err.message);
      setParsingResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!parsingResult || parsingResult.validCount === 0) {
      alert('Tidak ada data valid yang bisa diimpor.');
      return;
    }

    const validRows = parsingResult.rows.filter((r) => r.isValid);

    setIsImporting(true);
    try {
      await onBatchImport(validRows);
      setImportSuccess({
        count: validRows.length,
        filename: selectedFile.name
      });
      setParsingResult(null);
      setSelectedFile(null);
    } catch (err) {
      alert('Gagal mengimpor data ke database: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsingResult(null);
    setImportSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewRows = parsingResult
    ? parsingResult.rows.filter((r) => {
        if (filterPreview === 'valid') return r.isValid;
        if (filterPreview === 'invalid') return !r.isValid;
        return true;
      })
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-amber-500" />
            <span>Import Data Produksi dari Excel</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Input data di Excel lalu tinggal upload ke aplikasi. Sistem akan memvalidasi data dan otomatis menyimpannya ke database.
          </p>
        </div>

        {/* Tombol Unduh Template */}
        <button
          onClick={downloadExcelTemplate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center space-x-2 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Template Excel Resmi</span>
        </button>
      </div>

      {/* Success Notification */}
      {importSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Berhasil Mengimpor {importSuccess.count} Data Produksi!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Data dari file <strong>{importSuccess.filename}</strong> telah sukses tersimpan di database dan referensi otomatis diperbarui.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToProduksi}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <span>Lihat di Data Produksi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dropzone Upload Box */}
      {!parsingResult && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all bg-white dark:bg-slate-900 ${
            dragActive
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-amber-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            Tarik & Jatuhkan File Excel di sini
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            Mendukung format file <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>. Sistem akan membaca kolom TANGGAL, NAMA TELAK, LOKAL, GARAPAN, dan 8 defect secara otomatis.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <span>{isParsing ? 'Membaca File...' : 'Pilih File dari Laptop'}</span>
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Otomatis Kenali Format Tanggal</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Auto-Sum Kerusakan Telak</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Otomatis Daftarkan Master Nama & Lokal</span>
            </span>
          </div>
        </div>
      )}

      {/* Preview Section Setelah File Diupload */}
      {parsingResult && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedFile?.name}
                </span>
                <span className="text-xs text-slate-400">
                  (Sheet: {parsingResult.sheetName})
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Total Baris: <strong>{parsingResult.totalRows}</strong>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Valid: <strong>{parsingResult.validCount}</strong>
                </span>
                {parsingResult.invalidCount > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    ✗ Tidak Valid: <strong>{parsingResult.invalidCount}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Ganti File
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isImporting || parsingResult.validCount === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-2 disabled:opacity-50 transition-all"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Simpan {parsingResult.validCount} Baris ke Database</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Preview */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Tampilkan:</span>
            <button
              onClick={() => setFilterPreview('all')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                filterPreview === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua ({parsingResult.totalRows})
            </button>
            <button
              onClick={() => setFilterPreview('valid')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                filterPreview === 'valid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              Hanya Valid ({parsingResult.validCount})
            </button>
            {parsingResult.invalidCount > 0 && (
              <button
                onClick={() => setFilterPreview('invalid')}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  filterPreview === 'invalid'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                }`}
              >
                Hanya Error ({parsingResult.invalidCount})
              </button>
            )}
          </div>

          {/* Table Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Baris</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Nama Telak</th>
                    <th className="p-3">Lokal</th>
                    <th className="p-3">Absensi</th>
                    <th className="p-3 text-right">Garapan</th>
                    <th className="p-3 text-right text-red-600">Telak</th>
                    <th className="p-3 text-right text-amber-600">Mandor</th>
                    <th className="p-3">Catatan Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {previewRows.map((r) => (
                    <tr
                      key={r.rowNum}
                      className={
                        r.isValid
                          ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-red-50/50 dark:bg-red-950/20'
                      }
                    >
                      <td className="p-3 text-center">
                        {r.isValid ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            SIAP
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                            ERROR
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-400">#{r.rowNum}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{r.TANGGAL || '-'}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {r.NAMA || <span className="text-red-500 italic">Kosong</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {r.LOKAL || <span className="text-red-500 italic">Kosong</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap">{r.ABSENSI}</td>
                      <td className="p-3 text-right font-bold whitespace-nowrap">
                        {r.GARAPAN.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-bold text-red-600 whitespace-nowrap">
                        {r.KERUSAKAN_TELAK.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-semibold text-amber-600 whitespace-nowrap">
                        {r.KERUSAKAN_MANDOR.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3">
                        {r.isValid ? (
                          <span className="text-emerald-600 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 inline" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center space-x-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                            <span>{r.errorMessage}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
