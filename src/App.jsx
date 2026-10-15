import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import ModernSidebar from './components/ModernSidebar';
import ModernHeader from './components/ModernHeader';
import DashboardView from './components/DashboardView';
import InputView from './components/InputView';
import ImportExcelView from './components/ImportExcelView';
import ProduksiView from './components/ProduksiView';
import AnatomiRokokView from './components/AnatomiRokokView';
import AnalisisView from './components/AnalisisView';
import LaporanView from './components/LaporanView';
import AuditView from './components/AuditView';
import PengaturanView from './components/PengaturanView';
import EditModal from './components/EditModal';
import LoginView from './components/LoginView';
import {
  getStoredUser,
  logoutUser,
  canAccessTab,
  ROLE_PERMISSIONS
} from './services/authService';

import {
  getProduksi,
  addProduksi,
  batchAddProduksi,
  clearAllProduksi,
  updateProduksi,
  deleteProduksi,
  getReferences,
  addReference,
  deleteReference,
  getLogs,
  logActivity
} from './services/storage';
import { getSupabaseClient } from './services/supabaseClient';
import { soundFx } from './utils/soundHelper';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sukun_qc_dark_mode') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

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

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sukun_qc_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sukun_qc_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) soundFx.playClick();
  };

  const handleLogout = () => {
    soundFx.playClick();
    logoutUser();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Pastikan tab yang aktif diizinkan untuk role saat ini
  useEffect(() => {
    if (currentUser && !canAccessTab(currentUser.role, activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

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

  // Overall Live Stats untuk Sidebar Widget
  const totalGarapan = useMemo(() => {
    return dataset.reduce((s, d) => s + (Number(d.GARAPAN) || 0), 0);
  }, [dataset]);

  const liveRatio = useMemo(() => {
    const totalTelak = dataset.reduce((s, d) => s + (Number(d.KERUSAKAN_TELAK) || 0), 0);
    return totalGarapan > 0 ? ((totalTelak / totalGarapan) * 100).toFixed(2) : '0.00';
  }, [dataset, totalGarapan]);

  // Handlers CRUD
  const handleAddData = async (formData) => {
    await addProduksi(formData);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    await loadAllData();
  };

  const handleBatchImport = async (rows, options = {}) => {
    const { onProgress, cleanReplace } = options;
    if (cleanReplace) {
      await clearAllProduksi();
    }
    const result = await batchAddProduksi(rows, onProgress);
    soundFx.playSuccess();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    await loadAllData();
    return result;
  };

  const handleEditData = (record) => {
    setEditingRecord(record);
  };

  const handleSaveEdit = async (id, updatedForm) => {
    await updateProduksi(id, updatedForm);
    setEditingRecord(null);
    soundFx.playSuccess();
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

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased">
      {/* Modern Floating Left Sidebar */}
      <ModernSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        liveRatio={liveRatio}
        totalGarapan={totalGarapan}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Screen Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Top Header */}
        <ModernHeader
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isSupabaseConnected={isSupabaseConnected}
          isRefreshing={isRefreshing}
          onRefresh={loadAllData}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Views Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
            <InputView
              references={references}
              dataset={dataset}
              onAddData={handleAddData}
              onBatchAdd={handleBatchImport}
            />
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
              canEdit={ROLE_PERMISSIONS[currentUser?.role]?.canEdit}
              canDelete={ROLE_PERMISSIONS[currentUser?.role]?.canDelete}
            />
          )}

          {activeTab === 'anatomi' && <AnatomiRokokView dataset={dataset} />}

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
