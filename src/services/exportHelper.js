import * as XLSX from 'xlsx';
import { BULAN_LIST, KERUSAKAN_KEYS } from '../constants';

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

// Normalisasi header Excel
function normKey(k) {
  return String(k || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

// Parsing tanggal Excel (mendukung Date object, ISO string, format DD/MM/YYYY, dan Excel serial date number)
function parseExcelDate(val) {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    const pad = n => (n < 10 ? '0' : '') + n;
    return `${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())}`;
  }

  // Jika angka serial Excel (misal 45579)
  if (typeof val === 'number') {
    const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(dateObj.getTime())) {
      const pad = n => (n < 10 ? '0' : '') + n;
      return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
    }
  }

  const str = String(val).trim();

  // Match YYYY-MM-DD
  const mIso = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (mIso) {
    const pad = n => String(n).padStart(2, '0');
    return `${mIso[1]}-${pad(mIso[2])}-${pad(mIso[3])}`;
  }

  // Match DD-MM-YYYY atau DD/MM/YYYY
  const mDmY = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mDmY) {
    const pad = n => String(n).padStart(2, '0');
    return `${mDmY[3]}-${pad(mDmY[2])}-${pad(mDmY[1])}`;
  }

  return str;
}

// Parser & Validator Excel
export function parseAndValidateExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel kosong atau tidak memiliki data.');
        }

        const parsedRows = [];
        const errors = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // Baris di Excel (header di baris 1)

          // Petakan keys dengan normalisasi
          const mapped = {};
          Object.keys(row).forEach(k => {
            mapped[normKey(k)] = row[k];
          });

          // Ambil Tanggal
          const rawDate = mapped['TANGGAL'] || mapped['TGL'] || mapped['DATE'] || '';
          const tanggal = parseExcelDate(rawDate);

          // Ambil Nama Telak
          const nama = String(
            mapped['NAMA_TELAK'] || mapped['NAMA'] || mapped['OPERATOR'] || mapped['TELAK'] || ''
          ).trim();

          // Ambil Lokal
          const lokal = String(
            mapped['LOKAL'] || mapped['LOKASI'] || mapped['BAGIAN'] || ''
          ).trim();

          // Absensi
          const absensi = String(
            mapped['ABSENSI_GILING'] || mapped['ABSENSI'] || mapped['STATUS'] || 'Hadir'
          ).trim() || 'Hadir';

          // Garapan
          const garapan = Number(mapped['GARAPAN'] || mapped['JUMLAH_GARAPAN'] || mapped['TOTAL_GARAPAN'] || 0);

          // 8 Kerusakan
          const num = v => {
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
          };

          const cw = num(mapped['CW'] || mapped['COWONG'] || 0);
          const pk = num(mapped['PK'] || mapped['PAPIR_KUSUT'] || 0);
          const lk = num(mapped['LK'] || mapped['LEM_KURANG'] || 0);
          const tk = num(mapped['TK'] || mapped['TALIPAN_KOTOR'] || 0);
          const mt = num(mapped['MT'] || mapped['MUNTIR'] || 0);
          const md = num(mapped['MD'] || mapped['MEDOT'] || 0);
          const at = num(mapped['AT'] || mapped['ATOS'] || 0);
          const mm = num(mapped['MM'] || mapped['MEKAR_MINGKUP'] || 0);

          // Kerusakan Telak: jika ada di kolom atau hitung dari sum 8 kerusakan
          const sum8 = cw + pk + lk + tk + mt + md + at + mm;
          const kTelak = mapped['KERUSAKAN_TELAK'] !== undefined && mapped['KERUSAKAN_TELAK'] !== ''
            ? num(mapped['KERUSAKAN_TELAK'])
            : sum8;

          const kMandor = num(mapped['KERUSAKAN_MANDOR'] || mapped['MANDOR'] || 0);
          const kPapir = num(mapped['KEKURANGAN_PAPIR'] || mapped['PAPIR'] || 0);

          // Validasi kelayakan baris
          const rowErrors = [];
          if (!tanggal) rowErrors.push('Tanggal kosong');
          if (!nama) rowErrors.push('Nama Telak kosong');
          if (!lokal) rowErrors.push('Lokal kosong');
          if (garapan <= 0) rowErrors.push('Garapan 0 / kosong');

          // Date attributes
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

          const parsedObj = {
            rowNum,
            YEAR: year,
            MONTH: monthName,
            MONTH_NUMBER: monthNum,
            TANGGAL: tanggal,
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
            isValid: rowErrors.length === 0,
            errorMessage: rowErrors.join(', ')
          };

          parsedRows.push(parsedObj);
          if (rowErrors.length > 0) {
            errors.push({ rowNum, message: rowErrors.join(', ') });
          }
        });

        resolve({
          sheetName: firstSheetName,
          totalRows: parsedRows.length,
          validCount: parsedRows.filter(r => r.isValid).length,
          invalidCount: parsedRows.filter(r => !r.isValid).length,
          rows: parsedRows,
          errors
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
