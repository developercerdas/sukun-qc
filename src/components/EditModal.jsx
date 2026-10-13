import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { KERUSAKAN_KEYS } from '../constants';

export default function EditModal({ isOpen, onClose, record, onSave }) {
  const [formData, setFormData] = useState(null);
  const [autoCalc, setAutoCalc] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    }
  }, [record]);

  if (!isOpen || !formData) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      if (autoCalc && KERUSAKAN_KEYS.some((k) => k.key === field)) {
        const sum = KERUSAKAN_KEYS.reduce((acc, k) => {
          return acc + (Number(k.key === field ? val : next[k.key]) || 0);
        }, 0);
        next.KERUSAKAN_TELAK = sum;
      }
      return next;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Edit Data Produksi
            </h3>
            <p className="text-xs text-slate-500">ID: {formData.id} &bull; {formData.NAMA}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={formData.TANGGAL || ''}
                onChange={(e) => handleChange('TANGGAL', e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nama Telak
              </label>
              <input
                type="text"
                required
                value={formData.NAMA || ''}
                onChange={(e) => handleChange('NAMA', e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Lokal
              </label>
              <input
                type="text"
                required
                value={formData.LOKAL || ''}
                onChange={(e) => handleChange('LOKAL', e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Jumlah Garapan (Batang)
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.GARAPAN || 0}
                onChange={(e) => handleChange('GARAPAN', e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                8 Kategori Kerusakan (Batang)
              </span>
              <button
                type="button"
                onClick={() => setAutoCalc(!autoCalc)}
                className="text-[11px] text-amber-600 font-semibold flex items-center space-x-1"
              >
                <Calculator className="w-3 h-3" />
                <span>Auto-Sum: {autoCalc ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {KERUSAKAN_KEYS.map((k) => (
                <div key={k.key}>
                  <label className="block text-[11px] font-medium text-slate-500 truncate mb-1">
                    {k.label} ({k.key})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData[k.key] || 0}
                    onChange={(e) => handleChange(k.key, e.target.value)}
                    className="w-full text-center text-sm border rounded-lg py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-red-600 mb-1">
                Kerusakan Telak
              </label>
              <input
                type="number"
                min="0"
                value={formData.KERUSAKAN_TELAK || 0}
                onChange={(e) => handleChange('KERUSAKAN_TELAK', e.target.value)}
                className="w-full text-sm font-bold border rounded-xl px-3 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-600 mb-1">
                Kerusakan Mandor
              </label>
              <input
                type="number"
                min="0"
                value={formData.KERUSAKAN_MANDOR || 0}
                onChange={(e) => handleChange('KERUSAKAN_MANDOR', e.target.value)}
                className="w-full text-sm font-semibold border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Kekurangan Papir
              </label>
              <input
                type="number"
                min="0"
                value={formData.KEKURANGAN_PAPIR || 0}
                onChange={(e) => handleChange('KEKURANGAN_PAPIR', e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-md shadow-amber-500/20 flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
