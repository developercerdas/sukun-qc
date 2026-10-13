import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InputView from './components/InputView';
import ImportExcelView from './components/ImportExcelView';
import ProduksiView from './components/ProduksiView';
import KerusakanView from './components/KerusakanView';
import AnalisisView from './components/AnalisisView';
import LaporanView from './components/LaporanView';
import AuditView from './components/AuditView';
import PengaturanView from './components/PengaturanView';
import EditModal from './components/EditModal';

import {
  getProduksi,
  addProduksi,
  updateProduksi,
  deleteProduksi,
  getReferences,
  addReference,
  deleteReference,
  getLogs,
  logActivity
} from './services/storage';
import { getSupabaseClient } from './services/supabaseClient';
import { BULAN_LIST } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sukun_qc_dark_mode') === 'true';
  });

  const [dataset, setDataset] = useState([]);
  const [references, setReferences] = useState({ namaTelak: [], lokal: [] });
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Global Filter State untuk Dashboard & Views
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    lokal: ''
  });

  // Modal Edit
  const [editingRecord, setEditingRecord] = useState(null);

  // Toggle Dark Mode class pada <html> / <body>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sukun_qc_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sukun_qc_dark_mode', 'false');
    }
  }, [darkMode]);

  // Load Data awal
  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const client = getSupabaseClient();
      setIsSupabaseConnected(!!client);

      const [dataRes, refsRes, logsRes] = await Promise.all([
        getProduksi(),
        getReferences(),
        getLogs()
      ]);

      setDataset(dataRes || []);
      setReferences(refsRes || { namaTelak: [], lokal: [] });
      setLogs(logsRes || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Dropdown options
  const years = useMemo(() => {
    const list = [...new Set(dataset.map((d) => d.YEAR))].filter(Boolean).sort();
    return list.length ? list : [new Date().getFullYear()];
  }, [dataset]);

  const lokalList = useMemo(() => {
    const list = [...new Set(dataset.map((d) => d.LOKAL))].filter(Boolean).sort();
    return list.length ? list : references.lokal;
  }, [dataset, references.lokal]);

  // Label periode aktif untuk header
  const periodLabel = useMemo(() => {
    const parts = [];
    if (filters.year) parts.push(`Tahun ${filters.year}`);
    if (filters.month) parts.push(BULAN_LIST[filters.month - 1]);
    if (filters.lokal) parts.push(`(${filters.lokal})`);
    return parts.length ? parts.join(' ') : 'Semua Periode';
  }, [filters]);

  // Handlers CRUD
  const handleAddData = async (formData) => {
    await addProduksi(formData);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    await loadAllData();
  };

  const handleBatchImport = async (rows) => {
    // Simpan semua baris dari Excel
    for (const r of rows) {
      await addProduksi(r);
    }
    await logActivity('IMPORT_EXCEL', `Mengimpor ${rows.length} data produksi dari file Excel`);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    await loadAllData();
  };

  const handleEditData = (record) => {
    setEditingRecord(record);
  };

  const handleSaveEdit = async (id, updatedForm) => {
    await updateProduksi(id, updatedForm);
    setEditingRecord(null);
    await loadAllData();
  };

  const handleDeleteData = async (id) => {
    await deleteProduksi(id);
    await loadAllData();
  };

  const handleBatchDelete = async (ids) => {
    for (const id of ids) {
      await deleteProduksi(id);
    }
    await loadAllData();
  };

  const handleAddReference = async (kategori, nilai) => {
    await addReference(kategori, nilai);
    await loadAllData();
  };

  const handleDeleteReference = async (kategori, nilai) => {
    await deleteReference(kategori, nilai);
    await loadAllData();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header Bar */}
        <Header
          activeTab={activeTab}
          periodLabel={periodLabel}
          isSupabaseConnected={isSupabaseConnected}
          isRefreshing={isRefreshing}
          onRefresh={loadAllData}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Views Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          {activeTab === 'dashboard' && (
            <DashboardView
              dataset={dataset}
              filters={filters}
              setFilters={setFilters}
              years={years}
              lokalList={lokalList}
            />
          )}

          {activeTab === 'input' && (
            <InputView references={references} onAddData={handleAddData} />
          )}

          {activeTab === 'import' && (
            <ImportExcelView
              onBatchImport={handleBatchImport}
              onNavigateToProduksi={() => setActiveTab('produksi')}
            />
          )}

          {activeTab === 'produksi' && (
            <ProduksiView
              dataset={dataset}
              onDeleteData={handleDeleteData}
              onEditData={handleEditData}
            />
          )}

          {activeTab === 'kerusakan' && <KerusakanView dataset={dataset} />}

          {activeTab === 'analisis' && <AnalisisView dataset={dataset} />}

          {activeTab === 'laporan' && (
            <LaporanView dataset={dataset} references={references} />
          )}

          {activeTab === 'audit' && (
            <AuditView
              dataset={dataset}
              onDeleteData={handleDeleteData}
              onBatchDelete={handleBatchDelete}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanView
              references={references}
              onAddReference={handleAddReference}
              onDeleteReference={handleDeleteReference}
              logs={logs}
              onRefreshData={loadAllData}
            />
          )}
        </main>
      </div>

      {/* Modal Edit Record */}
      <EditModal
        isOpen={!!editingRecord}
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
