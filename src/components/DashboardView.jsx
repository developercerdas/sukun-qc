import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Layers,
  AlertOctagon,
  ClipboardCheck,
  FilterX,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { BULAN_LIST, KERUSAKAN_KEYS, BIAYA_PER_BATANG_RUSAK } from '../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardView({
  dataset,
  filters,
  setFilters,
  years,
  lokalList
}) {
  const [quickDateFilter, setQuickDateFilter] = useState('all'); // 'today', '7d', 'all'

  // Filtered dataset
  const filteredData = useMemo(() => {
    return dataset.filter((d) => {
      // Standard filters
      if (filters.year && String(d.YEAR) !== String(filters.year)) return false;
      if (filters.month && String(d.MONTH_NUMBER) !== String(filters.month)) return false;
      if (filters.lokal && String(d.LOKAL) !== String(filters.lokal)) return false;
      return true;
    });
  }, [dataset, filters]);

  // KPIs
  const totalGarapan = useMemo(() => {
    return filteredData.reduce((acc, d) => acc + (Number(d.GARAPAN) || 0), 0);
  }, [filteredData]);

  const totalKerusakanTelak = useMemo(() => {
    return filteredData.reduce((acc, d) => acc + (Number(d.KERUSAKAN_TELAK) || 0), 0);
  }, [filteredData]);

  const totalKerusakanMandor = useMemo(() => {
    return filteredData.reduce((acc, d) => acc + (Number(d.KERUSAKAN_MANDOR) || 0), 0);
  }, [filteredData]);

  const totalKekuranganPapir = useMemo(() => {
    return filteredData.reduce((acc, d) => acc + (Number(d.KEKURANGAN_PAPIR) || 0), 0);
  }, [filteredData]);

  const rasioKerusakan = totalGarapan > 0
    ? ((totalKerusakanTelak / totalGarapan) * 100).toFixed(2)
    : '0.00';

  const estimasiBiayaKerugian = totalKerusakanTelak * BIAYA_PER_BATANG_RUSAK;

  // AQL Quality Grading
  const aqlGrade = useMemo(() => {
    const r = Number(rasioKerusakan);
    if (r <= 0.8) {
      return {
        grade: 'GRADE A — MUTU OPTIMAL',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        desc: 'Toleransi mutu sangat baik (< 0.80% defect).'
      };
    } else if (r <= 1.2) {
      return {
        grade: 'GRADE B — WASPADA MUTU',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10 border-amber-500/30',
        desc: 'Mendekati ambang batas toleransi pabrik (0.80% - 1.20%).'
      };
    } else {
      return {
        grade: 'GRADE C — PERIKSA SEKTOR',
        color: 'text-red-500',
        bg: 'bg-red-500/10 border-red-500/30',
        desc: 'Melebihi batas toleransi mutu (> 1.20% defect). Perlu kalibrasi meja.'
      };
    }
  }, [rasioKerusakan]);

  // Chart 1: Tren Garapan 10 Hari Terakhir
  const productionChartData = useMemo(() => {
    const dates = [...new Set(filteredData.map(d => String(d.TANGGAL || '')))]
      .filter(Boolean)
      .sort()
      .slice(-10);

    const garapanTotals = dates.map(dt => {
      return filteredData
        .filter(d => String(d.TANGGAL) === dt)
        .reduce((sum, d) => sum + (Number(d.GARAPAN) || 0), 0);
    });

    const damageTotals = dates.map(dt => {
      return filteredData
        .filter(d => String(d.TANGGAL) === dt)
        .reduce((sum, d) => sum + (Number(d.KERUSAKAN_TELAK) || 0), 0);
    });

    return {
      labels: dates.length ? dates : ['Belum Ada Data'],
      datasets: [
        {
          label: 'Garapan (Batang)',
          data: garapanTotals.length ? garapanTotals : [0],
          backgroundColor: '#10b981',
          borderRadius: 6,
          yAxisID: 'y'
        },
        {
          label: 'Kerusakan Telak (Batang)',
          data: damageTotals.length ? damageTotals : [0],
          backgroundColor: '#ef4444',
          borderRadius: 6,
          yAxisID: 'y1'
        }
      ]
    };
  }, [filteredData]);

  // Chart 2: Distribusi 8 Cacat Rokok
  const damageChartData = useMemo(() => {
    const dataTotals = KERUSAKAN_KEYS.map(k => {
      return filteredData.reduce((sum, d) => sum + (Number(d[k.key]) || 0), 0);
    });

    return {
      labels: KERUSAKAN_KEYS.map(k => k.label),
      datasets: [
        {
          data: dataTotals,
          backgroundColor: KERUSAKAN_KEYS.map(k => k.color),
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    };
  }, [filteredData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Hero Command Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${aqlGrade.bg} ${aqlGrade.color} flex items-center space-x-1.5 shrink-0 shadow-sm`}>
                <ShieldCheck className="w-4 h-4 inline shrink-0" />
                <span>{aqlGrade.grade}</span>
              </span>
              <span className="text-xs font-bold text-slate-200 tracking-wide">
                AQL Standar PT. SUKUN WARTONO INDONESIA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pusat Kendali Mutu & Produksi Rokok
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {aqlGrade.desc} Akumulasi dari seluruh sektor meja gilingan aktif.
            </p>
          </div>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Garapan
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {totalGarapan.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                Batang Produksi
              </span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Rasio Cacat Telak
              </span>
              <span className={`text-xl sm:text-2xl font-black mt-1 block ${aqlGrade.color}`}>
                {rasioKerusakan}%
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Target: &lt; 0.80%
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Estimasi Biaya Cacat
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-400 mt-1 block">
                Rp {estimasiBiayaKerugian.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                @Rp 150/batang
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter Horizon */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick Date Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 font-semibold mr-1 text-[11px]">Rentang Cepat:</span>
            {[
              { id: 'all', label: 'Semua Periode' },
              { id: 'today', label: 'Hari Ini' }
            ].map((qp) => (
              <button
                key={qp.id}
                onClick={() => setQuickDateFilter(qp.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  quickDateFilter === qp.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {qp.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setQuickDateFilter('all');
              setFilters({ year: '', month: '', lokal: '' });
            }}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 font-semibold self-start md:self-auto"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset Seluruh Filter</span>
          </button>
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Tahun
            </label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full text-xs font-semibold border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            >
              <option value="">Semua Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Bulan
            </label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full text-xs font-semibold border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            >
              <option value="">Semua Bulan</option>
              {BULAN_LIST.map((b, idx) => (
                <option key={b} value={idx + 1}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Sektor / Lokal
            </label>
            <select
              value={filters.lokal}
              onChange={(e) => setFilters({ ...filters, lokal: e.target.value })}
              className="w-full text-xs font-semibold border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            >
              <option value="">Semua Lokal</option>
              {lokalList.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Modern KPI Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Garapan
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            {totalGarapan.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Produksi batang rokok terdata
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kerusakan Telak
            </span>
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-3">
            {totalKerusakanTelak.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Akumulasi 8 jenis cacat batang
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Temuan Mandor
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-3">
            {totalKerusakanMandor.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Sampling pengawas lapangan
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kekurangan Papir
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-3">
            {totalKekuranganPapir.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Selisih lembar kertas rokok
          </p>
        </div>
      </div>

      {/* 4. Industrial Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Tren Garapan & Cacat Harian
              </h4>
              <p className="text-xs text-slate-400">10 Tanggal produksi terakhir</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="h-72">
            <Bar
              data={productionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Garapan (Batang)' }
                  },
                  y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Kerusakan (Batang)' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Pareto Doughnut Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Komposisi 8 Cacat Rokok Batangan
              </h4>
              <p className="text-xs text-slate-400">Distribusi Pareto cacat fisik</p>
            </div>
            <PieIcon className="w-5 h-5 text-red-500" />
          </div>
          <div className="h-72 flex items-center justify-center">
            <Doughnut
              data={damageChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 11 } }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
