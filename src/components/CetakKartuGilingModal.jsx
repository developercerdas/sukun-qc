import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { KERUSAKAN_KEYS } from '../constants';

export default function CetakKartuGilingModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const garapan = Number(record.GARAPAN || 0);
  const telak = Number(record.KERUSAKAN_TELAK || 0);
  const rasio = garapan > 0 ? ((telak / garapan) * 100).toFixed(2) : '0.00';
  const isLulus = Number(rasio) <= 1.0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Pratinjau Kartu Giling Harian
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Slip Body */}
        <div className="p-6 overflow-y-auto text-slate-900 bg-white">
          <div className="border-2 border-slate-900 p-5 rounded-2xl space-y-4">
            {/* Kop Slip */}
            <div className="border-b-2 border-slate-900 pb-3 text-center">
              <h3 className="text-base font-black tracking-wider text-slate-950">
                PT. SUKUN WARTONO INDONESIA
              </h3>
              <p className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                KARTU KENDALI MUTU GILING & TELAK
              </p>
              <p className="text-[9px] text-slate-500">
                Bagian Produksi & Quality Control Rokok Batangan
              </p>
            </div>

            {/* Identitas Operator */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-300 pb-3">
              <div>
                <span className="text-slate-500 text-[10px] block">Nama Telak (Operator):</span>
                <strong className="text-sm font-black">{record.NAMA}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block">Hari & Tanggal:</span>
                <strong className="text-xs font-bold">
                  {record.HARI ? `${record.HARI}, ` : ''}{record.TANGGAL}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Lokal Kerja:</span>
                <strong className="text-xs font-bold">{record.LOKAL}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block">Waktu Input:</span>
                <span className="text-xs font-bold font-mono">{record.JAM_WIB || '- WIB'}</span>
              </div>
            </div>

            {/* Total Garapan & Status */}
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  JUMLAH GARAPAN
                </span>
                <span className="text-xl font-black text-slate-950">
                  {garapan.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-normal">Batang</span>
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase inline-block ${
                    isLulus ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                  }`}
                >
                  {isLulus ? 'MUTU LULUS' : 'EVALUASI MUTU'}
                </span>
                <span className="block text-[10px] font-bold mt-0.5">Rasio: {rasio}%</span>
              </div>
            </div>

            {/* Tabel 8 Cacat */}
            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                RINCIAN KERUSAKAN TELAK:
              </span>
              <div className="grid grid-cols-4 gap-1 text-[11px] text-center border border-slate-300 rounded-lg p-1.5 bg-slate-50">
                {KERUSAKAN_KEYS.map((k) => (
                  <div key={k.key} className="p-1 border border-slate-200 rounded bg-white">
                    <span className="block text-[9px] font-mono text-slate-500">{k.key}</span>
                    <strong className="font-bold text-slate-900">{record[k.key] || 0}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Kerusakan Mandor & Papir */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-300">
              <div className="text-center p-1.5 bg-slate-100 rounded">
                <span className="text-[9px] text-slate-500 block">Total Telak</span>
                <strong className="text-sm font-bold text-red-600">{telak}</strong>
              </div>
              <div className="text-center p-1.5 bg-slate-100 rounded">
                <span className="text-[9px] text-slate-500 block">Temuan Mandor</span>
                <strong className="text-sm font-bold text-amber-700">
                  {record.KERUSAKAN_MANDOR || 0}
                </strong>
              </div>
              <div className="text-center p-1.5 bg-slate-100 rounded">
                <span className="text-[9px] text-slate-500 block">Kurang Papir</span>
                <strong className="text-sm font-bold text-slate-800">
                  {record.KEKURANGAN_PAPIR || 0}
                </strong>
              </div>
            </div>

            {/* Tanda Tangan Paraf */}
            <div className="grid grid-cols-2 gap-4 pt-3 text-center text-[10px] border-t border-slate-300">
              <div>
                <p className="text-slate-500">Paraf Operator Telak:</p>
                <div className="h-10 flex items-end justify-center">
                  <div className="w-24 border-b border-slate-700" />
                </div>
                <p className="font-bold mt-1">{record.NAMA}</p>
              </div>
              <div>
                <p className="text-slate-500">Paraf Mandor QC:</p>
                <div className="h-10 flex items-end justify-center">
                  <div className="w-24 border-b border-slate-700" />
                </div>
                <p className="font-bold mt-1">( ......................... )</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
