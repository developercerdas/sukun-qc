import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Minus, Calculator, CheckCircle2 } from 'lucide-react';
import { KERUSAKAN_KEYS } from '../constants';

export default function InputView({ references, onAddData }) {
  const getTodayStr = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [formData, setFormData] = useState({
    TANGGAL: getTodayStr(),
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
    setFormData((prev) => {
      const current = Number(prev[field]) || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [field]: next };
    });
  };

  const handleReset = () => {
    setFormData({
      TANGGAL: getTodayStr(),
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
      alert('Nama Telak dan Lokal wajib diisi!');
      return;
    }
    if (!formData.GARAPAN || Number(formData.GARAPAN) <= 0) {
      alert('Jumlah Garapan harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddData(formData);
      setSuccessMessage(`Data untuk ${formData.NAMA} (${formData.LOKAL}) berhasil disimpan!`);
      // Simpan preferensi tanggal & lokal untuk entri berikutnya, reset field lainnya
      setFormData((prev) => ({
        ...prev,
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
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3 transition-all animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Form Pendataan Kerusakan Rokok Batangan
            </h3>
            <p className="text-xs text-slate-500">PT. Sukun Wartono Indonesia - Quality Control</p>
          </div>
          <div className="inline-flex items-center space-x-2 text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
            <span>💡 Nama Telak & Lokal: Bisa ketik nama baru / pilih opsi</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bagian 1: Data Pokok */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal Produksi *
              </label>
              <input
                type="date"
                required
                value={formData.TANGGAL}
                onChange={(e) => handleChange('TANGGAL', e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Telak (Operator) *
              </label>
              <input
                type="text"
                list="list-nama-telak"
                placeholder="Ketik nama / pilih..."
                required
                value={formData.NAMA}
                onChange={(e) => handleChange('NAMA', e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <datalist id="list-nama-telak">
                {references.namaTelak.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Lokal *
              </label>
              <input
                type="text"
                list="list-lokal"
                placeholder="Ketik lokal / pilih..."
                required
                value={formData.LOKAL}
                onChange={(e) => handleChange('LOKAL', e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <datalist id="list-lokal">
                {references.lokal.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Absensi Giling
              </label>
              <select
                value={formData.ABSENSI}
                onChange={(e) => handleChange('ABSENSI', e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Jumlah Garapan (Batang Rokok) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="Misal: 3500"
                required
                value={formData.GARAPAN}
                onChange={(e) => handleChange('GARAPAN', e.target.value)}
                className="w-full text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bagian 2: 8 Kategori Kerusakan */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Rincian 8 Kategori Kerusakan Cacat Batang
              </h4>
              <button
                type="button"
                onClick={() => setAutoCalcTelak(!autoCalcTelak)}
                className={`text-xs px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 font-medium transition-colors ${
                  autoCalcTelak
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-300'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Hitung Otomatis Kerusakan Telak: {autoCalcTelak ? 'AKTIF' : 'MANUAL'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {KERUSAKAN_KEYS.map((k) => (
                <div
                  key={k.key}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
                    <span className="truncate">{k.label}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {k.key}
                    </span>
                  </label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleStep(k.key, -1)}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={formData[k.key]}
                      onChange={(e) => handleChange(k.key, e.target.value)}
                      className="w-full text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep(k.key, 1)}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 3: Total Kerusakan Telak, Mandor, & Papir */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Total Kerusakan Telak {autoCalcTelak && '(Auto Terhitung)'}
              </label>
              <input
                type="number"
                min="0"
                readOnly={autoCalcTelak}
                value={formData.KERUSAKAN_TELAK}
                onChange={(e) => handleChange('KERUSAKAN_TELAK', e.target.value)}
                className={`w-full text-sm font-black border rounded-xl px-3.5 py-2.5 focus:outline-none ${
                  autoCalcTelak
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kerusakan Mandor
              </label>
              <input
                type="number"
                min="0"
                value={formData.KERUSAKAN_MANDOR}
                onChange={(e) => handleChange('KERUSAKAN_MANDOR', e.target.value)}
                className="w-full text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kekurangan Papir
              </label>
              <input
                type="number"
                min="0"
                value={formData.KEKURANGAN_PAPIR}
                onChange={(e) => handleChange('KEKURANGAN_PAPIR', e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Form</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Produksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
