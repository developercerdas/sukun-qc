import * as XLSX from 'xlsx';
import { BULAN_LIST, KERUSAKAN_KEYS } from '../constants';
import { getHariFromDateString } from '../utils/dateHelper';

export function exportToExcel(data, filename = 'Sukun_QC_Data_Produksi.xlsx') {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const formattedRows = data.map((d, index) => ({
    "NO": index + 1,
    "YEAR": d.YEAR || '',
    "MONTH": d.MONTH || '',
    "MONTH NUMBER": d.MONTH_NUMBER || '',
    "TANGGAL": d.TANGGAL || '',
    "NAMA TELAK": d.NAMA || '',
    "LOKAL": d.LOKAL || '',
    "ABSENSI GILING": d.ABSENSI || 'Hadir',
    "GARAPAN": Number(d.GARAPAN || 0),
    "COWONG (CW)": Number(d.CW || 0),
    "PAPIR KUSUT (PK)": Number(d.PK || 0),
    "LEM KURANG (LK)": Number(d.LK || 0),
    "TALIPAN KOTOR (TK)": Number(d.TK || 0),
    "MUNTIR (MT)": Number(d.MT || 0),
    "MEDOT (MD)": Number(d.MD || 0),
    "ATOS (AT)": Number(d.AT || 0),
    "MEKAR MINGKUP (MM)": Number(d.MM || 0),
    "KERUSAKAN TELAK": Number(d.KERUSAKAN_TELAK || 0),
    "KERUSAKAN MANDOR": Number(d.KERUSAKAN_MANDOR || 0),
    "KEKURANGAN PAPIR": Number(d.KEKURANGAN_PAPIR || 0),
    "RASIO TELAK (%)": d.GARAPAN > 0 ? ((d.KERUSAKAN_TELAK / d.GARAPAN) * 100).toFixed(2) + '%' : '0.00%'
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DATAKU');

  const colWidths = Object.keys(formattedRows[0]).map(key => ({
    wch: Math.max(key.length + 3, 12)
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
}

export function exportToCSV(data, filename = 'Sukun_QC_Data.csv') {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Unduh Template Excel Kosong Resmi untuk Input Harian
export function downloadExcelTemplate() {
  const sampleTemplate = [
    {
      "TANGGAL": "2026-10-14",
      "NAMA TELAK": "Siti Aminah",
      "LOKAL": "Lokal 1",
      "ABSENSI GILING": "Hadir",
      "GARAPAN": 3500,
      "CW": 4,
      "PK": 3,
      "LK": 2,
      "TK": 1,
      "MT": 0,
      "MD": 2,
      "AT": 1,
      "MM": 0,
      "KERUSAKAN MANDOR": 10,
      "KEKURANGAN PAPIR": 1
    },
    {
      "TANGGAL": "2026-10-14",
      "NAMA TELAK": "Sri Wahyuni",
      "LOKAL": "Lokal 2",
      "ABSENSI GILING": "Hadir",
      "GARAPAN": 4000,
      "CW": 2,
      "PK": 4,
      "LK": 1,
      "TK": 0,
      "MT": 1,
      "MD": 1,
      "AT": 0,
      "MM": 1,
      "KERUSAKAN MANDOR": 8,
      "KEKURANGAN PAPIR": 0
    },
    {
      "TANGGAL": "2026-10-14",
      "NAMA TELAK": "Suparti",
      "LOKAL": "Lokal 1",
      "ABSENSI GILING": "Hadir",
      "GARAPAN": 3800,
      "CW": 5,
      "PK": 2,
      "LK": 3,
      "TK": 2,
      "MT": 0,
      "MD": 3,
      "AT": 1,
      "MM": 0,
      "KERUSAKAN MANDOR": 12,
      "KEKURANGAN PAPIR": 2
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleTemplate);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'TEMPLATE_QC');

  const colWidths = Object.keys(sampleTemplate[0]).map(key => ({
    wch: Math.max(key.length + 4, 14)
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, 'Template_Input_QC_PT_Sukun.xlsx');
}

// Kamus Nama Bulan Indonesia untuk Parsing Format Teks Tanggal
const MONTH_MAP = {
  jan: '01', januari: '01',
  feb: '02', februari: '02',
  mar: '03', maret: '03',
  apr: '04', april: '04',
  mei: '05', may: '05',
  jun: '06', juni: '06', june: '06',
  jul: '07', juli: '07', july: '07',
  agu: '08', ags: '08', agus: '08', agustus: '08', aug: '08', august: '08',
  sep: '09', sept: '09', september: '09',
  okt: '10', oct: '10', oktober: '10', october: '10',
  nov: '11', nop: '11', november: '11',
  des: '12', dec: '12', desember: '12', december: '12'
};

// Pemetaan Alias Header Kolom Lengkap Industri Pabrik Rokok
const HEADER_ALIASES = {
  TANGGAL: [
    'TANGGAL', 'TGL', 'DATE', 'TGL_PRODUKSI', 'TANGGAL_PRODUKSI',
    'WAKTU', 'HARI_TANGGAL', 'TGL_GILING', 'TANGGAL_GILING', 'TANGGAL_KERJA', 'TGL_KERJA'
  ],
  NAMA: [
    'NAMA_TELAK', 'NAMA', 'OPERATOR', 'TELAK', 'PEKERJA', 'KARYAWAN',
    'NAMA_KARYAWAN', 'NAMA_OPERATOR', 'NAMA_GILING', 'PENGEPAK', 'NAMA_PENGEPAK', 'NAMA_LENGKAP'
  ],
  LOKAL: [
    'LOKAL', 'LOKASI', 'BAGIAN', 'LINE', 'MEJA', 'POS', 'UNIT', 'GROUP',
    'GRUP', 'REGU', 'LOKAL_GILING', 'RUANGAN'
  ],
  ABSENSI: [
    'ABSENSI_GILING', 'ABSENSI', 'STATUS', 'KEHADIRAN', 'ABSEN',
    'KETERANGAN', 'KET', 'PRESENSI', 'ABS'
  ],
  GARAPAN: [
    'GARAPAN', 'JUMLAH_GARAPAN', 'TOTAL_GARAPAN', 'JML_GARAPAN', 'HASIL',
    'HASIL_GILING', 'QTY', 'TOTAL', 'OUTPUT', 'PRODUKSI', 'BATANG',
    'JML', 'JUMLAH', 'TARGET', 'REALISASI', 'TOTAL_HASIL', 'JML_BATANG'
  ],
  CW: ['CW', 'COWONG', 'DEFECT_CW', 'KERUSAKAN_CW'],
  PK: ['PK', 'PAPIR_KUSUT', 'KUSUT', 'DEFECT_PK', 'KERUSAKAN_PK'],
  LK: ['LK', 'LEM_KURANG', 'LEM', 'DEFECT_LK', 'KERUSAKAN_LK'],
  TK: ['TK', 'TALIPAN_KOTOR', 'TALIPAN', 'DEFECT_TK', 'KERUSAKAN_TK'],
  MT: ['MT', 'MUNTIR', 'DEFECT_MT', 'KERUSAKAN_MT'],
  MD: ['MD', 'MEDOT', 'DEFECT_MD', 'KERUSAKAN_MD'],
  AT: ['AT', 'ATOS', 'KERAS', 'DEFECT_AT', 'KERUSAKAN_AT'],
  MM: ['MM', 'MEKAR_MINGKUP', 'MEKAR', 'DEFECT_MM', 'KERUSAKAN_MM'],
  KERUSAKAN_TELAK: [
    'KERUSAKAN_TELAK', 'TELAK', 'TOTAL_TELAK', 'TOTAL_KERUSAKAN_TELAK',
    'JML_TELAK', 'TOTAL_KERUSAKAN', 'DEFECT_TELAK', 'TOTAL_DEFECT', 'TOTAL_RUSAK'
  ],
  KERUSAKAN_MANDOR: ['KERUSAKAN_MANDOR', 'MANDOR', 'TOTAL_MANDOR', 'DEFECT_MANDOR', 'RUSAK_MANDOR'],
  KEKURANGAN_PAPIR: ['KEKURANGAN_PAPIR', 'PAPIR', 'KURANG_PAPIR', 'KEK_PAPIR', 'DEFECT_PAPIR'],
  HARI: ['HARI', 'DAY'],
  JAM_WIB: ['JAM_WIB', 'JAM', 'WAKTU', 'TIME']
};

// Normalisasi header Excel
function normKey(k) {
  return String(k || '')
    .trim()
    .toUpperCase()
    .replace(/[\s\.\-_/]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Mencari canonical key dari alias
function findCanonicalKey(rawKey) {
  const norm = normKey(rawKey);
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(norm)) return canonical;
  }
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    for (const a of aliases) {
      if (norm === a || norm.startsWith(a + '_') || norm.endsWith('_' + a)) {
        return canonical;
      }
    }
  }
  return norm;
}

// Parsing tanggal Excel ke YYYY-MM-DD
export function parseExcelDate(val) {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, '0');
    const d = String(val.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'number') {
    const utcDays = Math.floor(val - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  const mIso = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (mIso) return `${mIso[1]}-${String(mIso[2]).padStart(2, '0')}-${String(mIso[3]).padStart(2, '0')}`;
  
  const mDmY = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (mDmY) {
    let yr = mDmY[3];
    if (yr.length === 2) yr = '20' + yr;
    return `${yr}-${String(mDmY[2]).padStart(2, '0')}-${String(mDmY[1]).padStart(2, '0')}`;
  }

  const mText = str.match(/^(\d{1,2})[\s\-_/]+([a-zA-Z]+)[\s\-_/]+(\d{2,4})/);
  if (mText) {
    let yr = mText[3];
    if (yr.length === 2) yr = '20' + yr;
    const monthKey = mText[2].toLowerCase();
    const m = MONTH_MAP[monthKey];
    if (m) {
      return `${yr}-${m}-${String(mText[1]).padStart(2, '0')}`;
    }
  }
  return str;
}

// Format Absensi agar angka desimal Excel terkonversi dengan rapi
export function formatAbsensi(val) {
  if (val === undefined || val === null || val === '') return 'Hadir';
  if (typeof val === 'number') {
    if (val >= 0 && val <= 1) {
      if (val === 1) return 'Hadir';
      return `${Math.round(val * 100)}%`;
    }
    return String(val);
  }
  const s = String(val).trim();
  const num = parseFloat(s);
  if (!isNaN(num) && num >= 0 && num <= 1 && s.includes('.')) {
    if (num === 1) return 'Hadir';
    return `${Math.round(num * 100)}%`;
  }
  return s || 'Hadir';
}

// Helper untuk membaca Workbook Excel dan mendeteksi semua Sheet
export function readWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        resolve(workbook);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Parser & Validator Excel Super Cerdas
export async function parseAndValidateExcel(fileOrWorkbook, options = {}) {
  let workbook;
  if (fileOrWorkbook && fileOrWorkbook.SheetNames) {
    workbook = fileOrWorkbook;
  } else {
    workbook = await readWorkbook(fileOrWorkbook);
  }

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
  }

  const { sheetName = null, combineAllSheets = false } = options;
  const sheetsToProcess = combineAllSheets
    ? sheetNames
    : [sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0]];

  const parsedRows = [];
  const errors = [];
  let ignoredFooterCount = 0;

  for (const sName of sheetsToProcess) {
    const worksheet = workbook.Sheets[sName];
    if (!worksheet) continue;

    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', blankrows: false });
    if (!rawRows || rawRows.length === 0) continue;

    let lastKnownTanggal = '';
    let lastKnownLokal = '';

    rawRows.forEach((row, index) => {
      const rowNum = index + 2;

      // Petakan keys dengan canonical matcher
      const mapped = {};
      Object.keys(row).forEach((k) => {
        const canonical = findCanonicalKey(k);
        mapped[canonical] = row[k];
      });

      const rawNama = String(mapped['NAMA'] || '').trim();

      // Abaikan baris kosong total
      const hasAnyValue = Object.values(row).some(
        (v) => v !== '' && v !== null && v !== undefined
      );
      if (!hasAnyValue) return;

      // Abaikan baris footer / summary (seperti TOTAL, JUMLAH, RATA-RATA, dsb)
      if (
        /^(TOTAL|JUMLAH|SUBTOTAL|RATA[\s\-_]*RATA|GRAND[\s\-_]*TOTAL|SUMMARY|KESELURUHAN|STATISTIK)/i.test(
          rawNama
        )
      ) {
        ignoredFooterCount++;
        return;
      }

      // Ambil Tanggal (dukung carry forward untuk merged cells)
      const rawDate = mapped['TANGGAL'] || '';
      let tanggal = parseExcelDate(rawDate);
      if (tanggal) {
        lastKnownTanggal = tanggal;
      } else if (lastKnownTanggal && rawNama) {
        tanggal = lastKnownTanggal;
      }

      // Ambil Nama Telak
      const nama = rawNama;

      // Ambil Lokal (dukung carry forward untuk merged cells)
      let lokal = String(mapped['LOKAL'] || '').trim();
      if (lokal) {
        lastKnownLokal = lokal;
      } else if (lastKnownLokal) {
        lokal = lastKnownLokal;
      } else {
        lokal = 'Lokal 1';
      }

      // Absensi
      const absensi = formatAbsensi(mapped['ABSENSI']);

      // Angka helper
      const num = (v) => {
        if (typeof v === 'number') return isNaN(v) ? 0 : v;
        const n = parseFloat(String(v || '').replace(/,/g, ''));
        return isNaN(n) ? 0 : n;
      };

      // Garapan (fleksibel: >= 0)
      const garapan = num(mapped['GARAPAN']);

      // 8 Jenis Kerusakan
      const cw = num(mapped['CW']);
      const pk = num(mapped['PK']);
      const lk = num(mapped['LK']);
      const tk = num(mapped['TK']);
      const mt = num(mapped['MT']);
      const md = num(mapped['MD']);
      const at = num(mapped['AT']);
      const mm = num(mapped['MM']);

      // Kerusakan Telak
      const sum8 = cw + pk + lk + tk + mt + md + at + mm;
      let kTelak = mapped['KERUSAKAN_TELAK'] !== undefined && mapped['KERUSAKAN_TELAK'] !== ''
        ? num(mapped['KERUSAKAN_TELAK'])
        : sum8;
      if (sum8 > 0 && kTelak === 0) {
        kTelak = sum8;
      }

      const kMandor = num(mapped['KERUSAKAN_MANDOR']);
      const kPapir = num(mapped['KEKURANGAN_PAPIR']);

      // Validasi baris
      const rowErrors = [];
      if (!nama) rowErrors.push('Nama Telak kosong');
      if (!tanggal) rowErrors.push('Tanggal tidak ditemukan');
      if (garapan < 0) rowErrors.push('Garapan tidak boleh negatif');

      // Waktu & Hari
      let year = new Date().getFullYear();
      let monthNum = new Date().getMonth() + 1;
      let monthName = BULAN_LIST[monthNum - 1];

      if (tanggal) {
        const parts = tanggal.split('-');
        if (parts.length >= 2) {
          year = parseInt(parts[0], 10) || year;
          monthNum = parseInt(parts[1], 10) || monthNum;
          monthName = BULAN_LIST[monthNum - 1] || '';
        }
      }

      const hari = mapped['HARI'] || getHariFromDateString(tanggal) || '';
      const jam = mapped['JAM_WIB'] || '07:00 WIB';

      const isValid = rowErrors.length === 0;

      const parsedObj = {
        sheetName: sName,
        rowNum,
        YEAR: year,
        MONTH: monthName,
        MONTH_NUMBER: monthNum,
        TANGGAL: tanggal,
        HARI: hari,
        JAM_WIB: jam,
        NAMA: nama,
        LOKAL: lokal,
        ABSENSI: absensi,
        GARAPAN: garapan,
        CW: cw,
        PK: pk,
        LK: lk,
        TK: tk,
        MT: mt,
        MD: md,
        AT: at,
        MM: mm,
        KERUSAKAN_TELAK: kTelak,
        KERUSAKAN_MANDOR: kMandor,
        KEKURANGAN_PAPIR: kPapir,
        isValid,
        errorMessage: rowErrors.join(', ')
      };

      parsedRows.push(parsedObj);
      if (!isValid) {
        errors.push({ sheetName: sName, rowNum, message: rowErrors.join(', ') });
      }
    });
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return {
    sheetNames,
    activeSheet: combineAllSheets ? 'Semua Sheet' : sheetsToProcess[0],
    isMultiSheet: sheetNames.length > 1,
    workbook,
    totalRows: parsedRows.length,
    validCount,
    invalidCount,
    ignoredFooterCount,
    rows: parsedRows,
    errors
  };
}
