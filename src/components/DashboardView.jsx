import React, { useMemo } from 'react';
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
  Percent,
  FilterX,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import { BULAN_LIST, KERUSAKAN_KEYS } from '../constants';

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
  // Filtered dataset
  const filteredData = useMemo(() => {
    return dataset.filter((d) => {
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

  const rasioKerusakan = totalGarapan > 0
    ? ((totalKerusakanTelak / totalGarapan) * 100).toFixed(2)
    : '0.00';

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
      labels: dates.length ? dates : ['Tidak Ada Data'],
      datasets: [
        {
          label: 'Total Garapan (Batang)',
          data: garapanTotals.length ? garapanTotals : [0],
          backgroundColor: '#d97706',
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

  // Chart 2: Distribusi 8 Kategori Kerusakan
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
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Filter Tahun
          </label>
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="">Semua Tahun</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Filter Bulan
          </label>
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="">Semua Bulan</option>
            {BULAN_LIST.map((b, idx) => (
              <option key={b} value={idx + 1}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Filter Lokal
          </label>
          <select
            value={filters.lokal}
            onChange={(e) => setFilters({ ...filters, lokal: e.target.value })}
            className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="">Semua Lokal</option>
            {lokalList.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setFilters({ year: '', month: '', lokal: '' })}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700"
          >
            <FilterX className="w-4 h-4" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Garapan
            </p>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalGarapan.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Batang rokok diproduksi
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-red-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kerusakan Telak
            </p>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-2">
            {totalKerusakanTelak.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Akumulasi 8 jenis kerusakan
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kerusakan Mandor
            </p>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {totalKerusakanMandor.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Temuan mandor lapangan
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rasio Kerusakan
            </p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {rasioKerusakan}%
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Target standar &lt; 1.00%
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production & Damage Trend Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tren Garapan & Kerusakan Harian
              </h3>
              <p className="text-xs text-slate-500">10 Tanggal produksi terakhir</p>
            </div>
            <TrendingUp className="w-5 h-5 text-amber-500" />
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

        {/* Damage Pareto Doughnut Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribusi Kategori Kerusakan Rokok
              </h3>
              <p className="text-xs text-slate-500">Proporsi 8 jenis cacat batang</p>
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
