import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Minus,
  Calculator,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';
import { KERUSAKAN_KEYS } from '../constants';
import { soundFx } from '../utils/soundHelper';
import { getHariFromDateString, getCurrentJamWIB } from '../utils/dateHelper';

function getTodayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function InputView({ references, onAddData }) {
  const initialDate = getTodayString();
  const [formData, setFormData] = useState({
    TANGGAL: initialDate,
    HARI: getHariFromDateString(initialDate),
    JAM_WIB: getCurrentJamWIB(),
    NAMA: '',
    LOKAL: '',
    ABSENSI: 'Hadir',
    GARAPAN: '',
    CW: 0,
    PK: 0,
    LK: 0,
    TK: 0,
    MT: 0,
    MD: 0,
    AT: 0,
    MM: 0,
    KERUSAKAN_TELAK: 0,
    KERUSAKAN_MANDOR: 0,
    KEKURANGAN_PAPIR: 0
  });

  const [autoCalcTelak, setAutoCalcTelak] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Saat tanggal berubah, otomatis perbarui nama hari
  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      TANGGAL: newDate,
      HARI: getHariFromDateString(newDate)
    }));
  };

  // Auto-calculate Kerusakan Telak jika switch aktif
  useEffect(() => {
    if (autoCalcTelak) {
      const sum = KERUSAKAN_KEYS.reduce((acc, k) => {
        return acc + (Number(formData[k.key]) || 0);
      }, 0);
      setFormData((prev) => ({ ...prev, KERUSAKAN_TELAK: sum }));
    }
  }, [
    autoCalcTelak,
    formData.CW,
    formData.PK,
    formData.LK,
    formData.TK,
    formData.MT,
    formData.MD,
    formData.AT,
    formData.MM
  ]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStep = (field, delta) => {
    soundFx.playClick();
    setFormData((prev) => {
      const current = Number(prev[field]) || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [field]: next };
    });
  };

  const handleReset = () => {
    soundFx.playClick();
    const tgl = getTodayString();
    setFormData({
      TANGGAL: tgl,
      HARI: getHariFromDateString(tgl),
      JAM_WIB: getCurrentJamWIB(),
      NAMA: '',
      LOKAL: '',
      ABSENSI: 'Hadir',
      GARAPAN: '',
      CW: 0,
      PK: 0,
      LK: 0,
      TK: 0,
      MT: 0,
      MD: 0,
      AT: 0,
      MM: 0,
      KERUSAKAN_TELAK: 0,
      KERUSAKAN_MANDOR: 0,
      KEKURANGAN_PAPIR: 0
    });
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.NAMA.trim() || !formData.LOKAL.trim()) {
      soundFx.playAlert();
      alert('Nama Telak dan Lokal wajib diisi!');
      return;
    }
    if (!formData.GARAPAN || Number(formData.GARAPAN) <= 0) {
      soundFx.playAlert();
      alert('Jumlah Garapan harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddData(formData);
      soundFx.playSuccess();
      setSuccessMessage(
        `Data untuk ${formData.NAMA} (${formData.LOKAL}) pada ${formData.HARI}, ${formData.TANGGAL} pukul ${formData.JAM_WIB} berhasil disimpan!`
      );
      // Reset input data spesifik, update jam WIB terbaru
      setFormData((prev) => ({
        ...prev,
        JAM_WIB: getCurrentJamWIB(),
        NAMA: '',
        GARAPAN: '',
        CW: 0,
        PK: 0,
        LK: 0,
        TK: 0,
        MT: 0,
        MD: 0,
        AT: 0,
        MM: 0,
        KERUSAKAN_TELAK: 0,
        KERUSAKAN_MANDOR: 0,
        KEKURANGAN_PAPIR: 0
      }));
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      soundFx.playAlert();
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const garapanNum = Number(formData.GARAPAN || 0);
  const telakNum = Number(formData.KERUSAKAN_TELAK || 0);
  const liveRasio = garapanNum > 0 ? ((telakNum / garapanNum) * 100).toFixed(2) : '0.00';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3 transition-all animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Header with Live Tally Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Pencatatan Cacat Rokok Meja Telak
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PT. SUKUN WARTONO INDONESIA &bull; Meja Inspeksi Mutu Gilingan
            </p>
          </div>

          {/* Live Ratio Pill Indicator */}
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Rasio Saat Ini
              </span>
              <span
                className={`text-lg font-black ${
                  Number(liveRasio) > 1.0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {liveRasio}%
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Total Cacat
              </span>
              <span className="text-lg font-black text-red-600">
                {telakNum} <span className="text-xs font-normal">btg</span>
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Hari, Tanggal, Jam WIB, Nama Operator, Lokal, Absensi, Garapan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tanggal & Hari Auto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Tanggal Produksi *</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                  Hari: {formData.HARI}
                </span>
              </label>
              <input
                type="date"
                required
                value={formData.TANGGAL}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full text-xs font-bold border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* Jam Input WIB */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Waktu / Jam Input (WIB) *</span>
              </label>
              <input
                type="text"
                placeholder="Misal: 19:30 WIB"
                required
                value={formData.JAM_WIB}
                onChange={(e) => handleChange('JAM_WIB', e.target.value)}
                className="w-full text-xs font-mono font-bold border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Nama Operator */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Telak (Operator Giling) *
              </label>
              <input
                type="text"
                list="list-nama-telak"
                placeholder="Ketik nama baru / pilih..."
                required
                value={formData.NAMA}
                onChange={(e) => handleChange('NAMA', e.target.value)}
                className="w-full text-xs font-bold border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <datalist id="list-nama-telak">
                {references.namaTelak.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            {/* Lokal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sektor / Lokal *
              </label>
              <input
                type="text"
                list="list-lokal"
                placeholder="Ketik lokal baru / pilih..."
                required
                value={formData.LOKAL}
                onChange={(e) => handleChange('LOKAL', e.target.value)}
                className="w-full text-xs font-semibold border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <datalist id="list-lokal">
                {references.lokal.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>

            {/* Absensi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Absensi Giling
              </label>
              <select
                value={formData.ABSENSI}
                onChange={(e) => handleChange('ABSENSI', e.target.value)}
                className="w-full text-xs font-semibold border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>

            {/* Garapan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jumlah Garapan (Batang Rokok) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="Misal: 3500"
                required
                value={formData.GARAPAN}
                onChange={(e) => handleChange('GARAPAN', e.target.value)}
                className="w-full text-sm font-black border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: 8 Cacat Counters with Speed Steps (+1, +5, +10) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Tally Counter 8 Cacat Rokok Batangan
                </h4>
                <p className="text-[11px] text-slate-400">
                  Gunakan tombol langkah cepat untuk menghitung batang cacat saat pemeriksaan meja telak.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAutoCalcTelak(!autoCalcTelak)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center space-x-1.5 transition-all ${
                  autoCalcTelak
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-300'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Auto-Sum: {autoCalcTelak ? 'AKTIF' : 'MANUAL'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {KERUSAKAN_KEYS.map((k) => (
                <div
                  key={k.key}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {k.label}
                    </span>
                    <span
                      className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: k.color }}
                    >
                      {k.key}
                    </span>
                  </div>

                  {/* Input Center */}
                  <div className="flex items-center space-x-1 mb-2">
                    <button
                      type="button"
                      onClick={() => handleStep(k.key, -1)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={formData[k.key]}
                      onChange={(e) => handleChange(k.key, e.target.value)}
                      className="w-full text-center text-sm font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep(k.key, 1)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Step Buttons (+5, +10) */}
                  <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleStep(k.key, 5)}
                      className="text-[10px] font-bold py-1 rounded bg-slate-200/70 dark:bg-slate-700/60 hover:bg-slate-300 text-slate-700 dark:text-slate-200"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(k.key, 10)}
                      className="text-[10px] font-bold py-1 rounded bg-slate-200/70 dark:bg-slate-700/60 hover:bg-slate-300 text-slate-700 dark:text-slate-200"
                    >
                      +10
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Kerusakan Telak, Kerusakan Mandor, Kekurangan Papir */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-red-600 mb-1.5">
                Total Kerusakan Telak {autoCalcTelak && '(Auto-Sum)'}
              </label>
              <input
                type="number"
                min="0"
                readOnly={autoCalcTelak}
                value={formData.KERUSAKAN_TELAK}
                onChange={(e) => handleChange('KERUSAKAN_TELAK', e.target.value)}
                className={`w-full text-base font-black border rounded-xl px-3.5 py-2.5 focus:outline-none ${
                  autoCalcTelak
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-600 mb-1.5">
                Kerusakan Mandor (Sampling Lapangan)
              </label>
              <input
                type="number"
                min="0"
                value={formData.KERUSAKAN_MANDOR}
                onChange={(e) => handleChange('KERUSAKAN_MANDOR', e.target.value)}
                className="w-full text-base font-black border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-600 mb-1.5">
                Kekurangan Papir (Lembar Kertas)
              </label>
              <input
                type="number"
                min="0"
                value={formData.KEKURANGAN_PAPIR}
                onChange={(e) => handleChange('KEKURANGAN_PAPIR', e.target.value)}
                className="w-full text-base font-black border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Form</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-2 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Inspeksi QC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
