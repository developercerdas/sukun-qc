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
  ArrowRight,
  Layers,
  Zap,
  Trash2,
  HelpCircle,
  Check
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
  const [importMode, setImportMode] = useState('append'); // 'append' or 'replace'
  const [selectedSheet, setSelectedSheet] = useState('');
  const [combineSheets, setCombineSheets] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
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
    setCombineSheets(false);
    try {
      const result = await parseAndValidateExcel(file);
      setParsingResult(result);
      setSelectedSheet(result.sheetNames[0] || '');
    } catch (err) {
      alert('Gagal membaca file Excel: ' + err.message);
      setParsingResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSheetChange = async (sheetName) => {
    if (!parsingResult?.workbook) return;
    setIsParsing(true);
    try {
      const res = await parseAndValidateExcel(parsingResult.workbook, {
        sheetName,
        combineAllSheets: false
      });
      setParsingResult(res);
      setSelectedSheet(sheetName);
      setCombineSheets(false);
    } catch (err) {
      alert('Gagal berganti sheet: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleToggleCombineSheets = async () => {
    if (!parsingResult?.workbook) return;
    const nextCombine = !combineSheets;
    setIsParsing(true);
    try {
      const res = await parseAndValidateExcel(parsingResult.workbook, {
        combineAllSheets: nextCombine,
        sheetName: selectedSheet
      });
      setParsingResult(res);
      setCombineSheets(nextCombine);
    } catch (err) {
      alert('Gagal menggabungkan sheet: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!parsingResult || parsingResult.validCount === 0) {
      alert('Tidak ada data valid yang bisa diimpor.');
      return;
    }

    if (importMode === 'replace') {
      const confirmed = window.confirm(
        '⚠️ PERINGATAN PENTING:\n\nMode "Ganti Bersih Database" akan MENGHAPUS SEMUA DATA PRODUKSI yang ada saat ini, lalu mengisi ulang hanya dengan ' +
          parsingResult.validCount +
          ' data dari file Excel ini.\n\nGunakan ini agar jumlah data di aplikasi persis 100% sama dengan file aktual Anda.\n\nApakah Anda yakin ingin melanjutkan?'
      );
      if (!confirmed) return;
    }

    const validRows = parsingResult.rows.filter((r) => r.isValid);

    setIsImporting(true);
    setProgress({ current: 0, total: validRows.length, percent: 0 });

    try {
      const res = await onBatchImport(validRows, {
        cleanReplace: importMode === 'replace',
        onProgress: (p) => setProgress(p)
      });

      setImportSuccess({
        count: res?.inserted || validRows.length,
        total: validRows.length,
        failed: res?.failed || 0,
        filename: selectedFile?.name || 'File Excel',
        sheet: parsingResult.activeSheet,
        mode: importMode,
        ignoredFooterCount: parsingResult.ignoredFooterCount || 0
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
            Engine bulk insert baru berkecepatan tinggi (~100 baris/detik). Mendukung multi-sheet, format tanggal fleksibel, auto-sum defect, dan auto-registrasi master telak & lokal.
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
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Berhasil Mengimpor {importSuccess.count} Data Produksi!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                Data dari file <strong>{importSuccess.filename}</strong> (Sheet: <em>{importSuccess.sheet}</em>) berhasil disimpan ke database cloud Supabase dengan mode <strong>{importSuccess.mode === 'replace' ? 'Ganti Bersih (Reset Total)' : 'Tambahkan (Append)'}</strong>.
                {importSuccess.ignoredFooterCount > 0 && (
                  <span className="block text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                    ℹ️ {importSuccess.ignoredFooterCount} baris ringkasan footer (seperti TOTAL/JUMLAH) diabaikan secara aman.
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToProduksi}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all shrink-0"
          >
            <span>Buka Data Produksi</span>
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
            Mendukung format file <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>. Sistem cerdas otomatis memetakan alias kolom seperti <code>HASIL GILING</code>, <code>JML GARAPAN</code>, <code>COWONG</code>, <code>TALIPAN</code>, dsb.
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
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Bulk Engine: 100 baris / detik</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Auto-Deteksi Format Tanggal & Merged Cell</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Dukungan Multi-Sheet</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Auto-Daftar Master Telak & Lokal</span>
            </span>
          </div>
        </div>
      )}

      {/* Preview Section Setelah File Diupload */}
      {parsingResult && (
        <div className="space-y-4 animate-fadeIn">
          {/* Card Multi-Sheet Selector (jika file memiliki > 1 sheet) */}
          {parsingResult.isMultiSheet && (
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  File ini memiliki {parsingResult.sheetNames.length} Sheet:
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Pilih sheet tertentu atau gabungkan semua sheet sekaligus.
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <select
                  value={combineSheets ? '__ALL__' : selectedSheet}
                  onChange={(e) => {
                    if (e.target.value === '__ALL__') {
                      handleToggleCombineSheets();
                    } else {
                      handleSheetChange(e.target.value);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {parsingResult.sheetNames.map((s) => (
                    <option key={s} value={s}>
                      Sheet: {s}
                    </option>
                  ))}
                  <option value="__ALL__">★ Gabungkan Semua Sheet ({parsingResult.sheetNames.length})</option>
                </select>

                <button
                  type="button"
                  onClick={handleToggleCombineSheets}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center space-x-1 ${
                    combineSheets
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${combineSheets ? 'inline' : 'hidden'}`} />
                  <span>Gabungkan Semua</span>
                </button>
              </div>
            </div>
          )}

          {/* Opsi Mode Import (Append vs Clean Replace) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                Pilih Mode Penyimpanan ke Database:
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Pilih apakah data baru ditambahkan ke database atau menggantikan data lama.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  importMode === 'append'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
                <span>Tambahkan Data (Append)</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  importMode === 'replace'
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50'
                }`}
                title="Kosongkan database lama sebelum import agar jumlah data 100% presisi sama persis dengan file ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ganti Bersih Database (Clean Replace)</span>
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedFile?.name}
                </span>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Sheet: {parsingResult.activeSheet}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Total Baris Data: <strong>{parsingResult.totalRows}</strong>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Siap Impor: <strong>{parsingResult.validCount}</strong>
                </span>
                {parsingResult.invalidCount > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    ✗ Tidak Valid: <strong>{parsingResult.invalidCount}</strong>
                  </span>
                )}
                {parsingResult.ignoredFooterCount > 0 && (
                  <span className="text-slate-400">
                    ℹ️ Baris Total/Footer: {parsingResult.ignoredFooterCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                disabled={isImporting}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Ganti File
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isImporting || parsingResult.validCount === 0}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 disabled:opacity-50 transition-all ${
                  importMode === 'replace'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database ({progress.percent}%)...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>
                      {importMode === 'replace'
                        ? `Reset & Simpan ${parsingResult.validCount} Baris`
                        : `Simpan ${parsingResult.validCount} Baris ke Database`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Progress Bar saat proses import berlangsung */}
          {isImporting && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center space-x-2 text-amber-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Proses Bulk Insert ke Supabase Cloud...</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {progress.current} / {progress.total} baris ({progress.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Data disimpan dalam batch 100 baris sekaligus untuk performa kilat dan toleransi kesalahan maksimal. Mohon tunggu sejenak...
              </p>
            </div>
          )}

          {/* Filter Preview */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Tampilkan:</span>
            <button
              onClick={() => setFilterPreview('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterPreview === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua ({parsingResult.totalRows})
            </button>
            <button
              onClick={() => setFilterPreview('valid')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
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
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
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
                    <th className="p-3">Hari</th>
                    <th className="p-3">Nama Telak</th>
                    <th className="p-3">Lokal</th>
                    <th className="p-3">Absensi</th>
                    <th className="p-3 text-right">Garapan</th>
                    <th className="p-3 text-right text-red-600">Telak</th>
                    <th className="p-3 text-right text-amber-600">Mandor</th>
                    <th className="p-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {previewRows.map((r, i) => (
                    <tr
                      key={`${r.sheetName}-${r.rowNum}-${i}`}
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
                      <td className="p-3 whitespace-nowrap text-slate-500">{r.HARI || '-'}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {r.NAMA || <span className="text-red-500 italic">Kosong</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {r.LOKAL || <span className="text-red-500 italic">Kosong</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                          {r.ABSENSI}
                        </span>
                      </td>
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
