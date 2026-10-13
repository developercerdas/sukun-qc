import { useState, useEffect } from 'react';

export const NAMA_HARI = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
];

export const NAMA_BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getHariFromDateString(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return NAMA_HARI[d.getDay()] || '';
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : NAMA_HARI[d.getDay()];
}

export function getCurrentJamWIB() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
}

export function formatFullWIB(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const hari = NAMA_HARI[d.getDay()];
  const tgl = d.getDate();
  const bulan = NAMA_BULAN_ID[d.getMonth()];
  const tahun = d.getFullYear();
  const pad = (n) => String(n).padStart(2, '0');
  const jam = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`;

  return `${hari}, ${tgl} ${bulan} ${tahun} • ${jam}`;
}

// React Hook untuk Jam Live Realtime WIB di Header / Sidebar
export function useLiveWIB() {
  const [timeStr, setTimeStr] = useState(() => formatFullWIB());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(formatFullWIB());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeStr;
}
