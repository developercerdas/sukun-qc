import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Minus,
  Calculator,
  CheckCircle2,
  Clock,
  Calendar,
  Table,
  Zap,
  ClipboardCheck,
  FileText,
  Trash2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Users,
  Check,
  AlertCircle,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { KERUSAKAN_KEYS } from '../constants';
import { soundFx } from '../utils/soundHelper';
import { getHariFromDateString, getCurrentJamWIB } from '../utils/dateHelper';

function getTodayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function InputView({
  references = { namaTelak: [], lokal: [] },
  dataset = [],
  onAddData,
  onBatchAdd,
  currentUser
}) {
  const isMandor = !!(currentUser?.assignedLokal && currentUser.assignedLokal !== 'ALL');

  // Pilihan Mode Input Cepat
  // 'grid' (Tabel Cepat Spreadsheet), 'express' (Simpan & Lanjut), 'paste' (Smart Paste WA), 'classic' (Formulir Standar)
  const [activeInputMode, setActiveInputMode] = useState('grid');

  // Pengaturan Bersama (Header Tanggal, Hari, Jam WIB, Lokal)
  const [commonDate, setCommonDate] = useState(() => getTodayString());
  const [commonHari, setCommonHari] = useState(() => getHariFromDateString(getTodayString()));
  const [commonJam, setCommonJam] = useState(() => getCurrentJamWIB());
  const [commonLokal, setCommonLokal] = useState(() =>
    isMandor ? currentUser.assignedLokal : references.lokal[0] || 'Lokal 1'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-update jika akun mandor berganti
  useEffect(() => {
    if (isMandor && currentUser?.assignedLokal) {
      setCommonLokal(currentUser.assignedLokal);
    }
  }, [currentUser, isMandor]);

  // Update Hari saat Tanggal berubah
  const handleCommonDateChange = (newDate) => {
    setCommonDate(newDate);
    setCommonHari(getHariFromDateString(newDate));
  };

  // Daftar nama operator unik per lokal dari dataset yang ada
  const operatorsByLokal = useMemo(() => {
    const map = {};
    references.lokal.forEach((l) => {
      map[l] = new Set();
    });

    dataset.forEach((d) => {
      if (d.LOKAL && d.NAMA) {
        if (!map[d.LOKAL]) map[d.LOKAL] = new Set();
        map[d.LOKAL].add(d.NAMA);
      }
    });

    const result = {};
    Object.keys(map).forEach((lok) => {
      result[lok] = Array.from(map[lok]).sort();
    });
    return result;
  }, [dataset, references.lokal]);

  // =========================================================================
  // 1. STATE & LOGIKA: MODE TABEL GRID CEPAT (SPREADSHEET MULTI-ROW)
  // =========================================================================
  const createEmptyRow = (id, defaultNama = '', defaultGarapan = 3800) => ({
    id: id || Date.now() + Math.random(),
    nama: defaultNama,
    absensi: 'Hadir',
    garapan: defaultGarapan,
    cw: 0,
    pk: 0,
    lk: 0,
    tk: 0,
    mt: 0,
    md: 0,
    at: 0,
    mm: 0,
    mandor: 0,
    papir: 0
  });

  const [gridRows, setGridRows] = useState(() => [
    createEmptyRow(1),
    createEmptyRow(2),
    createEmptyRow(3),
    createEmptyRow(4),
    createEmptyRow(5)
  ]);

  const [uniformGarapanInput, setUniformGarapanInput] = useState('3800');

  const handleGridCellChange = (id, field, value) => {
    setGridRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAddGridRow = () => {
    soundFx.playClick();
    setGridRows((prev) => [...prev, createEmptyRow(Date.now(), '', Number(uniformGarapanInput) || 3800)]);
  };

  const handleDeleteGridRow = (id) => {
    soundFx.playClick();
    setGridRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleApplyUniformGarapan = () => {
    const val = Number(uniformGarapanInput);
    if (!val || val <= 0) return;
    soundFx.playClick();
    setGridRows((prev) => prev.map((r) => ({ ...r, garapan: val })));
    setSuccessMessage(`Seluruh baris disetel ke garapan ${val.toLocaleString('id-ID')} batang`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLoadOperatorsForLokal = () => {
    soundFx.playClick();
    const ops = operatorsByLokal[commonLokal] || [];
    const sourceList = ops.length > 0 ? ops : references.namaTelak;

    if (sourceList.length === 0) {
      alert(`Belum ada daftar operator yang tercatat di ${commonLokal}. Silakan ketik nama manual.`);
      return;
    }

    const defaultG = Number(uniformGarapanInput) || 3800;
    const newRows = sourceList.map((nama, idx) => createEmptyRow(Date.now() + idx, nama, defaultG));
    setGridRows(newRows);
    setSuccessMessage(`Memuat ${newRows.length} nama operator di ${commonLokal} siap diisi.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleClearGrid = () => {
    if (window.confirm('Kosongkan semua baris tabel?')) {
      setGridRows([createEmptyRow(1), createEmptyRow(2), createEmptyRow(3)]);
    }
  };

  const gridTotals = useMemo(() => {
    let totalGarapan = 0;
    let totalTelak = 0;
    let validCount = 0;

    gridRows.forEach((r) => {
      if (r.nama.trim()) {
        validCount++;
        totalGarapan += Number(r.garapan) || 0;
        const sum8 =
          (Number(r.cw) || 0) +
          (Number(r.pk) || 0) +
          (Number(r.lk) || 0) +
          (Number(r.tk) || 0) +
          (Number(r.mt) || 0) +
          (Number(r.md) || 0) +
          (Number(r.at) || 0) +
          (Number(r.mm) || 0);
        totalTelak += sum8;
      }
    });

    const rasio = totalGarapan > 0 ? ((totalTelak / totalGarapan) * 100).toFixed(2) : '0.00';
    return { validCount, totalGarapan, totalTelak, rasio };
  }, [gridRows]);

  const handleSubmitGrid = async () => {
    const validRows = gridRows.filter((r) => r.nama.trim());
    if (validRows.length === 0) {
      soundFx.playAlert();
      alert('Isi minimal 1 nama operator pada tabel sebelum menyimpan!');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedRecords = validRows.map((r) => {
        const cw = Number(r.cw) || 0;
        const pk = Number(r.pk) || 0;
        const lk = Number(r.lk) || 0;
        const tk = Number(r.tk) || 0;
        const mt = Number(r.mt) || 0;
        const md = Number(r.md) || 0;
        const at = Number(r.at) || 0;
        const mm = Number(r.mm) || 0;
        const sum8 = cw + pk + lk + tk + mt + md + at + mm;

        return {
          TANGGAL: commonDate,
          HARI: commonHari,
          JAM_WIB: commonJam,
          NAMA: r.nama.trim(),
          LOKAL: commonLokal.trim(),
          ABSENSI: r.absensi || 'Hadir',
          GARAPAN: Number(r.garapan) || 0,
          CW: cw,
          PK: pk,
          LK: lk,
          TK: tk,
          MT: mt,
          MD: md,
          AT: at,
          MM: mm,
          KERUSAKAN_TELAK: sum8,
          KERUSAKAN_MANDOR: Number(r.mandor) || 0,
          KEKURANGAN_PAPIR: Number(r.papir) || 0
        };
      });

      if (onBatchAdd) {
        await onBatchAdd(formattedRecords);
      } else {
        for (const rec of formattedRecords) {
          await onAddData(rec);
        }
      }

      soundFx.playSuccess();
      setSuccessMessage(`Berhasil menyimpan ${validRows.length} data operator di ${commonLokal}!`);
      // Reset tabel ke 5 baris kosong
      setGridRows([createEmptyRow(1), createEmptyRow(2), createEmptyRow(3), createEmptyRow(4), createEmptyRow(5)]);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      soundFx.playAlert();
      alert('Gagal menyimpan data tabel: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 2. STATE & LOGIKA: MODE FORMULIR EXPRESS (SIMPAN & LANJUT OTOMATIS)
  // =========================================================================
  const availableOperatorsInLokal = useMemo(() => {
    const list = operatorsByLokal[commonLokal] || [];
    return list.length > 0 ? list : references.namaTelak;
  }, [operatorsByLokal, commonLokal, references.namaTelak]);

  const [expressIndex, setExpressIndex] = useState(0);
  const [expressForm, setExpressForm] = useState({
    NAMA: '',
    GARAPAN: 3800,
    ABSENSI: 'Hadir',
    CW: 0,
    PK: 0,
    LK: 0,
    TK: 0,
    MT: 0,
    MD: 0,
    AT: 0,
    MM: 0,
    KERUSAKAN_MANDOR: 0,
    KEKURANGAN_PAPIR: 0
  });

  // Saat nama operator lokal berubah, sync index
  useEffect(() => {
    if (availableOperatorsInLokal.length > 0) {
      setExpressForm((prev) => ({
        ...prev,
        NAMA: availableOperatorsInLokal[0] || ''
      }));
      setExpressIndex(0);
    }
  }, [commonLokal]);

  const handleExpressSelectOperator = (index) => {
    if (index >= 0 && index < availableOperatorsInLokal.length) {
      soundFx.playClick();
      setExpressIndex(index);
      setExpressForm((prev) => ({
        ...prev,
        NAMA: availableOperatorsInLokal[index],
        CW: 0,
        PK: 0,
        LK: 0,
        TK: 0,
        MT: 0,
        MD: 0,
        AT: 0,
        MM: 0,
        KERUSAKAN_MANDOR: 0,
        KEKURANGAN_PAPIR: 0
      }));
    }
  };

  const handleExpressDefectStep = (field, delta) => {
    soundFx.playClick();
    setExpressForm((prev) => ({
      ...prev,
      [field]: Math.max(0, (Number(prev[field]) || 0) + delta)
    }));
  };

  const handleExpressSubmit = async (autoAdvance = true) => {
    if (!expressForm.NAMA.trim()) {
      soundFx.playAlert();
      alert('Nama operator wajib diisi!');
      return;
    }
    if (!expressForm.GARAPAN || Number(expressForm.GARAPAN) <= 0) {
      soundFx.playAlert();
      alert('Jumlah Garapan harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sum8 =
        Number(expressForm.CW) +
        Number(expressForm.PK) +
        Number(expressForm.LK) +
        Number(expressForm.TK) +
        Number(expressForm.MT) +
        Number(expressForm.MD) +
        Number(expressForm.AT) +
        Number(expressForm.MM);

      const recordToSave = {
        TANGGAL: commonDate,
        HARI: commonHari,
        JAM_WIB: getCurrentJamWIB(),
        NAMA: expressForm.NAMA.trim(),
        LOKAL: commonLokal.trim(),
        ABSENSI: expressForm.ABSENSI || 'Hadir',
        GARAPAN: Number(expressForm.GARAPAN) || 0,
        CW: Number(expressForm.CW) || 0,
        PK: Number(expressForm.PK) || 0,
        LK: Number(expressForm.LK) || 0,
        TK: Number(expressForm.TK) || 0,
        MT: Number(expressForm.MT) || 0,
        MD: Number(expressForm.MD) || 0,
        AT: Number(expressForm.AT) || 0,
        MM: Number(expressForm.MM) || 0,
        KERUSAKAN_TELAK: sum8,
        KERUSAKAN_MANDOR: Number(expressForm.KERUSAKAN_MANDOR) || 0,
        KEKURANGAN_PAPIR: Number(expressForm.KEKURANGAN_PAPIR) || 0
      };

      await onAddData(recordToSave);
      soundFx.playSuccess();

      setSuccessMessage(`✓ Data ${expressForm.NAMA} (${expressForm.GARAPAN} btg) tersimpan!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Auto-advance ke operator berikutnya
      if (autoAdvance) {
        const nextIndex = expressIndex + 1;
        if (nextIndex < availableOperatorsInLokal.length) {
          handleExpressSelectOperator(nextIndex);
        } else {
          // Reset defect tapi tetap pertahankan nama/form siap input
          setExpressForm((prev) => ({
            ...prev,
            CW: 0,
            PK: 0,
            LK: 0,
            TK: 0,
            MT: 0,
            MD: 0,
            AT: 0,
            MM: 0,
            KERUSAKAN_MANDOR: 0,
            KEKURANGAN_PAPIR: 0
          }));
        }
      }
    } catch (err) {
      soundFx.playAlert();
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 3. STATE & LOGIKA: MODE SMART PASTE (SALIN DARI WA / CATATAN)
  // =========================================================================
  const [pasteRawText, setPasteRawText] = useState('');
  const [parsedPasteRows, setParsedPasteRows] = useState([]);
  const [isParsingText, setIsParsingText] = useState(false);

  const handleParseText = () => {
    if (!pasteRawText.trim()) {
      alert('Silakan tempel teks catatan terlebih dahulu.');
      return;
    }
    soundFx.playClick();
    setIsParsingText(true);

    try {
      const lines = pasteRawText.split('\n').map((l) => l.trim()).filter(Boolean);
      const results = [];

      lines.forEach((line, index) => {
        if (line.startsWith('#') || line.startsWith('//')) return;

        let lineWorking = line;
        const defects = {
          CW: 0, PK: 0, LK: 0, TK: 0, MT: 0, MD: 0, AT: 0, MM: 0,
          KERUSAKAN_MANDOR: 0, KEKURANGAN_PAPIR: 0
        };

        const defectRegex = /\b(CW|COWONG|PK|PAPIR_KUSUT|LK|LEM|TK|TALIPAN|MT|MUNTIR|MD|MEDOT|AT|ATOS|MM|MEKAR|MANDOR|PAPIR)[:=\s]*(\d+)\b/gi;
        let match;
        while ((match = defectRegex.exec(line)) !== null) {
          const keyRaw = match[1].toUpperCase();
          const val = parseInt(match[2], 10) || 0;
          if (keyRaw === 'CW' || keyRaw === 'COWONG') defects.CW = val;
          else if (keyRaw === 'PK' || keyRaw === 'PAPIR_KUSUT') defects.PK = val;
          else if (keyRaw === 'LK' || keyRaw === 'LEM') defects.LK = val;
          else if (keyRaw === 'TK' || keyRaw === 'TALIPAN') defects.TK = val;
          else if (keyRaw === 'MT' || keyRaw === 'MUNTIR') defects.MT = val;
          else if (keyRaw === 'MD' || keyRaw === 'MEDOT') defects.MD = val;
          else if (keyRaw === 'AT' || keyRaw === 'ATOS') defects.AT = val;
          else if (keyRaw === 'MM' || keyRaw === 'MEKAR') defects.MM = val;
          else if (keyRaw === 'MANDOR') defects.KERUSAKAN_MANDOR = val;
          else if (keyRaw === 'PAPIR') defects.KEKURANGAN_PAPIR = val;
        }

        lineWorking = lineWorking.replace(defectRegex, ' ');

        const numbers = [];
        const numRegex = /\b\d+\b/g;
        let nMatch;
        while ((nMatch = numRegex.exec(lineWorking)) !== null) {
          numbers.push({ val: parseInt(nMatch[0], 10), text: nMatch[0] });
        }

        let garapan = 3800;
        let namaPart = lineWorking;

        if (numbers.length > 0) {
          const gCandidate = numbers.find((n) => n.val >= 500) || numbers[0];
          garapan = gCandidate.val;
          namaPart = lineWorking.replace(gCandidate.text, ' ');
        }

        const nama = namaPart.replace(/[,;:=]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!nama) return;

        const sum8 =
          defects.CW +
          defects.PK +
          defects.LK +
          defects.TK +
          defects.MT +
          defects.MD +
          defects.AT +
          defects.MM;

        results.push({
          rowId: index + 1,
          TANGGAL: commonDate,
          HARI: commonHari,
          JAM_WIB: commonJam,
          NAMA: nama,
          LOKAL: commonLokal,
          ABSENSI: 'Hadir',
          GARAPAN: garapan,
          CW: defects.CW,
          PK: defects.PK,
          LK: defects.LK,
          TK: defects.TK,
          MT: defects.MT,
          MD: defects.MD,
          AT: defects.AT,
          MM: defects.MM,
          KERUSAKAN_TELAK: sum8,
          KERUSAKAN_MANDOR: defects.KERUSAKAN_MANDOR,
          KEKURANGAN_PAPIR: defects.KEKURANGAN_PAPIR
        });
      });

      setParsedPasteRows(results);
      if (results.length === 0) {
        alert('Tidak ada baris data yang berhasil dikenali. Pastikan ada nama dan jumlah garapan.');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat memproses teks: ' + e.message);
    } finally {
      setIsParsingText(false);
    }
  };

  const handleSubmitParsedPaste = async () => {
    if (parsedPasteRows.length === 0) return;
    setIsSubmitting(true);
    try {
      if (onBatchAdd) {
        await onBatchAdd(parsedPasteRows);
      } else {
        for (const rec of parsedPasteRows) {
          await onAddData(rec);
        }
      }
      soundFx.playSuccess();
      setSuccessMessage(`Berhasil menyimpan ${parsedPasteRows.length} data dari teks catatan!`);
      setPasteRawText('');
      setParsedPasteRows([]);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (e) {
      soundFx.playAlert();
      alert('Gagal menyimpan hasil paste: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 4. STATE & LOGIKA: FORMULIR KLASIK (DETAIL 1 PER 1)
  // =========================================================================
  const [classicForm, setClassicForm] = useState({
    TANGGAL: commonDate,
    HARI: commonHari,
    JAM_WIB: commonJam,
    NAMA: '',
    LOKAL: commonLokal,
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

  const [classicAutoCalc, setClassicAutoCalc] = useState(true);

  useEffect(() => {
    if (classicAutoCalc) {
      const sum = KERUSAKAN_KEYS.reduce((acc, k) => {
        return acc + (Number(classicForm[k.key]) || 0);
      }, 0);
      setClassicForm((prev) => ({ ...prev, KERUSAKAN_TELAK: sum }));
    }
  }, [
    classicAutoCalc,
    classicForm.CW,
    classicForm.PK,
    classicForm.LK,
    classicForm.TK,
    classicForm.MT,
    classicForm.MD,
    classicForm.AT,
    classicForm.MM
  ]);

  const handleClassicSubmit = async (e) => {
    e.preventDefault();
    if (!classicForm.NAMA.trim() || !classicForm.LOKAL.trim()) {
      soundFx.playAlert();
      alert('Nama Telak dan Lokal wajib diisi!');
      return;
    }
    if (!classicForm.GARAPAN || Number(classicForm.GARAPAN) <= 0) {
      soundFx.playAlert();
      alert('Jumlah Garapan harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddData(classicForm);
      soundFx.playSuccess();
      setSuccessMessage(`Data ${classicForm.NAMA} berhasil disimpan!`);
      setClassicForm((prev) => ({
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
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      soundFx.playAlert();
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notifikasi Berhasil */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3 transition-all animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Header Utama & Pemilih Mode Input */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Input Data Produksi & Cacat Rokok</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pilih metode input tercepat sesuai situasi Anda: spreadsheet tabel, express simpan & lanjut, atau salin teks WA.
            </p>
          </div>

          {/* Sub-Tabs Navigasi Mode Input */}
          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveInputMode('grid');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeInputMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>1. Tabel Grid Cepat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveInputMode('express');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeInputMode === 'express'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. Express Simpan & Lanjut</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveInputMode('paste');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeInputMode === 'paste'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>3. Smart Paste WA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveInputMode('classic');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeInputMode === 'classic'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>4. Form Standar</span>
            </button>
          </div>
        </div>

        {/* Global Common Bar: Tanggal, Hari, Jam WIB, Lokal (Dipakai di Semua Mode) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
              <span>Tanggal Produksi</span>
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase">
                Hari: {commonHari}
              </span>
            </label>
            <input
              type="date"
              value={commonDate}
              onChange={(e) => handleCommonDateChange(e.target.value)}
              className="w-full text-xs font-bold border rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Waktu / Jam Input (WIB)</span>
            </label>
            <input
              type="text"
              value={commonJam}
              onChange={(e) => setCommonJam(e.target.value)}
              className="w-full text-xs font-bold font-mono border rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span>Sektor / Lokal Produksi Aktif</span>
                {isMandor && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Mandor: {currentUser.name}
                  </span>
                )}
              </span>
              {isMandor && commonLokal !== currentUser.assignedLokal ? (
                <button
                  type="button"
                  onClick={() => setCommonLokal(currentUser.assignedLokal)}
                  className="text-[10px] text-amber-500 hover:underline font-bold"
                >
                  Reset ke {currentUser.assignedLokal}
                </button>
              ) : (
                <span className="text-[10px] text-slate-400">Terkunci otomatis ke semua baris input</span>
              )}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                list="common-lokal-list"
                value={commonLokal}
                onChange={(e) => setCommonLokal(e.target.value)}
                placeholder="Pilih atau ketik lokal..."
                className="flex-1 text-xs font-bold border rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <datalist id="common-lokal-list">
                {references.lokal.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. TAMPILAN MODE TABEL GRID CEPAT (SPREADSHEET SANGAT CEPAT)         */}
      {/* =================================================================== */}
      {activeInputMode === 'grid' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
          {/* Action Toolbar Grid */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={handleLoadOperatorsForLokal}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                title="Tarik semua operator di lokal ini langsung ke tabel"
              >
                <Users className="w-4 h-4" />
                <span>👥 Muat Semua Operator {commonLokal}</span>
              </button>

              <button
                type="button"
                onClick={handleAddGridRow}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center space-x-1 text-slate-700 dark:text-slate-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>

              <button
                type="button"
                onClick={handleClearGrid}
                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 text-rose-600 font-semibold"
              >
                <span>Bersihkan</span>
              </button>
            </div>

            {/* Quick Set Uniform Garapan */}
            <div className="flex items-center space-x-2 text-xs bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-[11px] font-semibold pl-1">Set Garapan:</span>
              <input
                type="number"
                value={uniformGarapanInput}
                onChange={(e) => setUniformGarapanInput(e.target.value)}
                className="w-20 px-2 py-1 text-xs font-bold border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-center"
              />
              <button
                type="button"
                onClick={handleApplyUniformGarapan}
                className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px]"
              >
                Terapkan ke Semua
              </button>
            </div>
          </div>

          {/* Interactive Spreadsheet Table */}
          <div className="overflow-x-auto max-h-[500px] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5 text-center w-10">#</th>
                  <th className="p-2.5 min-w-[180px]">Nama Telak (Operator) *</th>
                  <th className="p-2.5 w-24">Absensi</th>
                  <th className="p-2.5 text-right w-28">Garapan (btg)</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Cowong">CW</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Papir Kusut">PK</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Lem Kurang">LK</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Talipan Kotor">TK</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Muntir">MT</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Medot">MD</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Atos">AT</th>
                  <th className="p-2 text-center w-12 text-red-500" title="Mekar Mingkup">MM</th>
                  <th className="p-2.5 text-center w-16 bg-red-100/70 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-extrabold">Telak</th>
                  <th className="p-2 text-center w-16 text-amber-600" title="Mandor">Mandor</th>
                  <th className="p-2 text-center w-16 text-blue-600" title="Papir">Papir</th>
                  <th className="p-2.5 text-center w-10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gridRows.map((r, index) => {
                  const sum8 =
                    (Number(r.cw) || 0) +
                    (Number(r.pk) || 0) +
                    (Number(r.lk) || 0) +
                    (Number(r.tk) || 0) +
                    (Number(r.mt) || 0) +
                    (Number(r.md) || 0) +
                    (Number(r.at) || 0) +
                    (Number(r.mm) || 0);

                  return (
                    <tr key={r.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-2 text-center font-mono text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          list="grid-nama-list"
                          placeholder="Nama operator..."
                          value={r.nama}
                          onChange={(e) => handleGridCellChange(r.id, 'nama', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={r.absensi}
                          onChange={(e) => handleGridCellChange(r.id, 'absensi', e.target.value)}
                          className="w-full px-2 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Alpa">Alpa</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={r.garapan}
                          onChange={(e) => handleGridCellChange(r.id, 'garapan', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs font-bold text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </td>

                      {/* 8 Defect Inputs */}
                      {['cw', 'pk', 'lk', 'tk', 'mt', 'md', 'at', 'mm'].map((key) => {
                        const val = Number(r[key]) || 0;
                        return (
                          <td key={key} className="p-1">
                            <input
                              type="number"
                              min="0"
                              value={r[key] === 0 ? '' : r[key]}
                              placeholder="0"
                              onChange={(e) => handleGridCellChange(r.id, key, e.target.value)}
                              className={`w-full text-center py-1 rounded border text-xs font-bold outline-none focus:ring-1 focus:ring-amber-500 ${
                                val > 0
                                  ? 'bg-red-50 dark:bg-red-950/60 border-red-300 text-red-600 font-black'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Auto-sum Telak */}
                      <td className="p-2 text-center font-black bg-red-50/50 dark:bg-red-950/30 text-red-600 text-xs">
                        {sum8}
                      </td>

                      {/* Mandor & Papir */}
                      <td className="p-1">
                        <input
                          type="number"
                          min="0"
                          value={r.mandor === 0 ? '' : r.mandor}
                          placeholder="0"
                          onChange={(e) => handleGridCellChange(r.id, 'mandor', e.target.value)}
                          className="w-full text-center py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-600 bg-white dark:bg-slate-900"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          min="0"
                          value={r.papir === 0 ? '' : r.papir}
                          placeholder="0"
                          onChange={(e) => handleGridCellChange(r.id, 'papir', e.target.value)}
                          className="w-full text-center py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 bg-white dark:bg-slate-900"
                        />
                      </td>

                      {/* Delete Action */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteGridRow(r.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <datalist id="grid-nama-list">
            {references.namaTelak.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          {/* Footer Bar: Ringkasan & Tombol Simpan Borongan */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 text-white">
            <div className="flex items-center flex-wrap gap-4 text-xs font-mono">
              <span className="text-slate-300">
                Operator Terisi: <strong className="text-white text-sm">{gridTotals.validCount}</strong> orang
              </span>
              <span className="text-slate-300">
                Total Garapan: <strong className="text-amber-400 text-sm">{gridTotals.totalGarapan.toLocaleString('id-ID')}</strong> btg
              </span>
              <span className="text-slate-300">
                Total Cacat: <strong className="text-rose-400 text-sm">{gridTotals.totalTelak.toLocaleString('id-ID')}</strong> btg
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                Rasio: {gridTotals.rasio}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAddGridRow}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                + Tambah Baris
              </button>

              <button
                type="button"
                onClick={handleSubmitGrid}
                disabled={isSubmitting || gridTotals.validCount === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SIMPAN SEMUA ({gridTotals.validCount} OPERATOR) SEKALIGUS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. TAMPILAN MODE EXPRESS (SIMPAN & LANJUT OTOMATIS)                   */}
      {/* =================================================================== */}
      {activeInputMode === 'express' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn">
          {/* Header Info Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Mode Express Lapangan:</strong> Tanggal &amp; Lokal terkunci di atas. Tekan <em>Simpan &amp; Lanjut</em> untuk langsung beralih ke operator berikutnya dalam 3 detik!
              </span>
            </div>
            <span className="font-mono text-slate-500">
              Operator {expressIndex + 1} dari {availableOperatorsInLokal.length}
            </span>
          </div>

          {/* Form Express */}
          <div className="space-y-6">
            {/* Pemilihan Nama Operator & Navigasi Panah */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Nama Telak (Operator Giling) *</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={expressIndex <= 0}
                      onClick={() => handleExpressSelectOperator(expressIndex - 1)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[10px] font-bold disabled:opacity-30"
                    >
                      ◄ Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={expressIndex >= availableOperatorsInLokal.length - 1}
                      onClick={() => handleExpressSelectOperator(expressIndex + 1)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[10px] font-bold disabled:opacity-30"
                    >
                      Berikutnya ►
                    </button>
                  </div>
                </label>
                <input
                  type="text"
                  list="express-nama-list"
                  value={expressForm.NAMA}
                  onChange={(e) => setExpressForm({ ...expressForm, NAMA: e.target.value })}
                  placeholder="Ketik atau pilih nama operator..."
                  className="w-full text-sm font-black border rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <datalist id="express-nama-list">
                  {availableOperatorsInLokal.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              {/* Absensi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Absensi
                </label>
                <select
                  value={expressForm.ABSENSI}
                  onChange={(e) => setExpressForm({ ...expressForm, ABSENSI: e.target.value })}
                  className="w-full text-xs font-semibold border rounded-xl px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>
            </div>

            {/* Garapan dengan Tombol Preset Cepat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Jumlah Garapan (Batang Rokok) *</span>
                <span className="text-[11px] text-slate-400">Pilih cepat atau ketik manual:</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  value={expressForm.GARAPAN}
                  onChange={(e) => setExpressForm({ ...expressForm, GARAPAN: e.target.value })}
                  className="w-36 text-sm font-black border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 text-center"
                />

                {[3000, 3500, 3800, 4000, 4500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setExpressForm((prev) => ({ ...prev, GARAPAN: preset }));
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      Number(expressForm.GARAPAN) === preset
                        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {preset.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Touch Counters untuk 8 Cacat */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Hitung Cacat Rokok (Tekan Tombol Cepat)
                </h4>
                <div className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-xl">
                  Total Cacat: {KERUSAKAN_KEYS.reduce((s, k) => s + (Number(expressForm[k.key]) || 0), 0)} btg
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {KERUSAKAN_KEYS.map((item) => {
                  const val = Number(expressForm[item.key]) || 0;
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-2xl border transition-all ${
                        val > 0
                          ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.key} <span className="text-[10px] text-slate-400 font-normal">({item.label})</span>
                        </span>
                        <span className={`text-base font-black ${val > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {val}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleExpressDefectStep(item.key, -1)}
                          disabled={val === 0}
                          className="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-600 disabled:opacity-30"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExpressDefectStep(item.key, 1)}
                          className="flex-1 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExpressDefectStep(item.key, 5)}
                          className="flex-1 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-extrabold"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tombol Utama: SIMPAN & LANJUT KE OPERATOR BERIKUTNYA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleExpressSubmit(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Simpan Saja
              </button>

              <button
                type="button"
                onClick={() => handleExpressSubmit(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-slate-950" />
                    <span>SIMPAN &amp; LANJUT KE OPERATOR BERIKUTNYA ►</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. TAMPILAN MODE SMART PASTE (SALIN DARI WA / CATATAN MEMO)         */}
      {/* =================================================================== */}
      {activeInputMode === 'paste' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Salin-Tempel Teks Catatan / Chat WhatsApp
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tulis atau paste catatan lapangan mandor di bawah. Sistem cerdas otomatis memisahkan nama, garapan, dan kode cacat (CW, PK, LK, TK, MT, MD, AT, MM).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <textarea
                rows={7}
                value={pasteRawText}
                onChange={(e) => setPasteRawText(e.target.value)}
                placeholder={`Tempel catatan di sini, contoh:
Siti Aminah 3800 CW2 MD1
Budi Santoso 4000 PK1 LK2 MM3
Sri Wahyuni 3500 CW2 TK1 Mandor5
Fidzalika 28300 CW126 MD7`}
                className="w-full p-4 rounded-2xl font-mono text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPasteRawText(`Siti Aminah 3800 CW2 MD1\nBudi Santoso 4000 PK1 LK2 MM3\nSri Wahyuni 3500 CW2 TK1`);
                  }}
                  className="text-[11px] text-amber-600 hover:underline font-semibold"
                >
                  Contoh Catatan
                </button>

                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={isParsingText || !pasteRawText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Pratinjau &amp; Ekstrak Data</span>
                </button>
              </div>
            </div>

            {/* Petunjuk Format */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Format Penulisan Bebas:
              </span>
              <ul className="space-y-1.5 text-slate-500 dark:text-slate-400 text-[11px] list-disc list-inside leading-relaxed">
                <li>
                  <strong>Nama</strong>: Kata di awal baris (misal: <code>Siti Aminah</code>)
                </li>
                <li>
                  <strong>Garapan</strong>: Angka jumlah batang (misal: <code>3800</code>)
                </li>
                <li>
                  <strong>Kode Cacat</strong>: Huruf cacat diikuti jumlahnya, contoh: <code>CW2</code>, <code>MD1</code>, <code>PK3</code>, <code>Mandor5</code>
                </li>
                <li>Satu baris untuk satu orang operator.</li>
              </ul>
            </div>
          </div>

          {/* Tabel Hasil Ekstraksi Teks */}
          {parsedPasteRows.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600">
                  ✓ Berhasil mengenali {parsedPasteRows.length} data operator:
                </span>
                <button
                  type="button"
                  onClick={handleSubmitParsedPaste}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>SIMPAN {parsedPasteRows.length} DATA KE DATABASE</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5 text-center">#</th>
                      <th className="p-2.5">Nama Operator</th>
                      <th className="p-2.5">Lokal</th>
                      <th className="p-2.5 text-right">Garapan</th>
                      <th className="p-2 text-center text-red-500">CW</th>
                      <th className="p-2 text-center text-red-500">PK</th>
                      <th className="p-2 text-center text-red-500">LK</th>
                      <th className="p-2 text-center text-red-500">TK</th>
                      <th className="p-2 text-center text-red-500">MT</th>
                      <th className="p-2 text-center text-red-500">MD</th>
                      <th className="p-2 text-center text-red-500">AT</th>
                      <th className="p-2 text-center text-red-500">MM</th>
                      <th className="p-2.5 text-center text-red-600 font-extrabold">Telak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedPasteRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-center font-mono text-slate-400">{i + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{r.NAMA}</td>
                        <td className="p-2.5">{r.LOKAL}</td>
                        <td className="p-2.5 text-right font-bold">{r.GARAPAN.toLocaleString('id-ID')}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.CW || '-'}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.PK || '-'}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.LK || '-'}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.TK || '-'}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.MT || '-'}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.MD || '-'}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.AT || '-'}</td>
                        <td className="p-2 text-center font-bold text-red-600">{r.MM || '-'}</td>
                        <td className="p-2.5 text-center font-black text-red-600 bg-red-50/50 dark:bg-red-950/20">{r.KERUSAKAN_TELAK}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. TAMPILAN FORMULIR KLASIK (DETAIL SATU PER SATU)                   */}
      {/* =================================================================== */}
      {activeInputMode === 'classic' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Formulir Input Standar Detail (1 Operator)
            </h4>
            <button
              type="button"
              onClick={() => setClassicAutoCalc(!classicAutoCalc)}
              className="text-xs px-3 py-1 rounded-xl border font-bold flex items-center space-x-1"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Sum: {classicAutoCalc ? 'AKTIF' : 'MANUAL'}</span>
            </button>
          </div>

          <form onSubmit={handleClassicSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Telak (Operator Giling) *
                </label>
                <input
                  type="text"
                  list="classic-nama-telak"
                  placeholder="Ketik nama baru / pilih..."
                  required
                  value={classicForm.NAMA}
                  onChange={(e) => setClassicForm({ ...classicForm, NAMA: e.target.value })}
                  className="w-full text-xs font-bold border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <datalist id="classic-nama-telak">
                  {references.namaTelak.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Absensi Giling
                </label>
                <select
                  value={classicForm.ABSENSI}
                  onChange={(e) => setClassicForm({ ...classicForm, ABSENSI: e.target.value })}
                  className="w-full text-xs font-semibold border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jumlah Garapan (Batang Rokok) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Misal: 3500"
                  required
                  value={classicForm.GARAPAN}
                  onChange={(e) => setClassicForm({ ...classicForm, GARAPAN: e.target.value })}
                  className="w-full text-sm font-black border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            {/* 8 Defect Grid */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                8 Parameter Cacat Rokok Telak
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {KERUSAKAN_KEYS.map((k) => (
                  <div key={k.key} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {k.label} ({k.key})
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={classicForm[k.key]}
                      onChange={(e) =>
                        setClassicForm({
                          ...classicForm,
                          [k.key]: Math.max(0, parseInt(e.target.value, 10) || 0)
                        })
                      }
                      className="w-full text-center text-sm font-bold border rounded-lg py-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Data Operator'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
