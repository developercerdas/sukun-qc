export const BULAN_LIST = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
  "Agustus", "September", "Oktober", "November", "Desember"
];

export const KERUSAKAN_KEYS = [
  { key: "CW", label: "Cowong", color: "#ef4444" },
  { key: "PK", label: "Papir Kusut", color: "#f97316" },
  { key: "LK", label: "Lem Kurang", color: "#f59e0b" },
  { key: "TK", label: "Talipan Kotor", color: "#10b981" },
  { key: "MT", label: "Muntir", color: "#3b82f6" },
  { key: "MD", label: "Medot", color: "#6366f1" },
  { key: "AT", label: "Atos", color: "#8b5cf6" },
  { key: "MM", label: "Mekar Mingkup", color: "#ec4899" }
];

export const INITIAL_REFERENCES = {
  namaTelak: [
    "Siti Aminah", "Sri Wahyuni", "Suparti", "Ngatemi", "Rukmini",
    "Sulastri", "Sunarti", "Endang", "Kusmiyati", "Sumarsih"
  ],
  lokal: [
    "Lokal 1", "Lokal 2", "Lokal 3", "Lokal 4", "Lokal 5",
    "Lokal A", "Lokal B", "Lokal C", "Lokal D"
  ]
};

export const INITIAL_SAMPLE_DATA = [
  {
    id: "sample-1",
    YEAR: 2026,
    MONTH: "Oktober",
    MONTH_NUMBER: 10,
    TANGGAL: "2026-10-12",
    NAMA: "Siti Aminah",
    LOKAL: "Lokal 1",
    ABSENSI: "Hadir",
    GARAPAN: 3500,
    CW: 4,
    PK: 3,
    LK: 5,
    TK: 2,
    MT: 1,
    MD: 2,
    AT: 1,
    MM: 0,
    KERUSAKAN_TELAK: 18,
    KERUSAKAN_MANDOR: 12,
    KEKURANGAN_PAPIR: 2,
    created_at: "2026-10-12T08:30:00Z"
  },
  {
    id: "sample-2",
    YEAR: 2026,
    MONTH: "Oktober",
    MONTH_NUMBER: 10,
    TANGGAL: "2026-10-12",
    NAMA: "Sri Wahyuni",
    LOKAL: "Lokal 2",
    ABSENSI: "Hadir",
    GARAPAN: 3800,
    CW: 2,
    PK: 5,
    LK: 3,
    TK: 1,
    MT: 0,
    MD: 3,
    AT: 0,
    MM: 1,
    KERUSAKAN_TELAK: 15,
    KERUSAKAN_MANDOR: 9,
    KEKURANGAN_PAPIR: 0,
    created_at: "2026-10-12T08:35:00Z"
  },
  {
    id: "sample-3",
    YEAR: 2026,
    MONTH: "Oktober",
    MONTH_NUMBER: 10,
    TANGGAL: "2026-10-13",
    NAMA: "Suparti",
    LOKAL: "Lokal 1",
    ABSENSI: "Hadir",
    GARAPAN: 3200,
    CW: 6,
    PK: 8,
    LK: 4,
    TK: 3,
    MT: 2,
    MD: 1,
    AT: 2,
    MM: 1,
    KERUSAKAN_TELAK: 27,
    KERUSAKAN_MANDOR: 18,
    KEKURANGAN_PAPIR: 5,
    created_at: "2026-10-13T09:00:00Z"
  },
  {
    id: "sample-4",
    YEAR: 2026,
    MONTH: "Oktober",
    MONTH_NUMBER: 10,
    TANGGAL: "2026-10-13",
    NAMA: "Ngatemi",
    LOKAL: "Lokal 3",
    ABSENSI: "Hadir",
    GARAPAN: 4000,
    CW: 3,
    PK: 4,
    LK: 2,
    TK: 0,
    MT: 1,
    MD: 2,
    AT: 1,
    MM: 0,
    KERUSAKAN_TELAK: 13,
    KERUSAKAN_MANDOR: 7,
    KEKURANGAN_PAPIR: 1,
    created_at: "2026-10-13T09:15:00Z"
  }
];
