export const BULAN_LIST = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
  "Agustus", "September", "Oktober", "November", "Desember"
];

export const BIAYA_PER_BATANG_RUSAK = 150; // Estimasi kerugian bahan baku (Tembakau, Papir, Saus) Rp 150 / batang

export const KERUSAKAN_KEYS = [
  {
    key: "CW",
    label: "Cowong",
    shortDesc: "Ujung batang berlubang / tembakau rontok",
    location: "Ujung Rokok",
    color: "#ef4444",
    mitigation: "Periksa ketajaman pisau pemotong telak dan kepadatan racikan tembakau di ujung corong."
  },
  {
    key: "PK",
    label: "Papir Kusut",
    shortDesc: "Kertas papir bergelombang / terlipat",
    location: "Badan Batang",
    color: "#f97316",
    mitigation: "Periksa kelembaban kertas papir dan tekanan roll penarik meja agar tarikan rata."
  },
  {
    key: "LK",
    label: "Lem Kurang",
    shortDesc: "Sambungan papir terbuka / tidak rapat",
    location: "Garis Lem",
    color: "#f59e0b",
    mitigation: "Periksa kekentalan lem kanji/perekat dan kebersihan spuit aplikator lem agar tidak tersumbat."
  },
  {
    key: "TK",
    label: "Talipan Kotor",
    shortDesc: "Noda oli / kotoran mesin di batang",
    location: "Permukaan Papir",
    color: "#10b981",
    mitigation: "Bersihkan sabuk konveyor/talipan gilingan dari akumulasi oli dan debu tembakau."
  },
  {
    key: "MT",
    label: "Muntir",
    shortDesc: "Batang rokok terpelintir spiral",
    location: "Struktur Batang",
    color: "#06b6d4",
    mitigation: "Kalibrasi keselarasan rol pemutar meja giling agar kedua sisi menggulung seimbang."
  },
  {
    key: "MD",
    label: "Medot",
    shortDesc: "Batang rokok patah / putus di tengah",
    location: "Badan Batang",
    color: "#6366f1",
    mitigation: "Atur elastisitas papir dan hindari tarikan menyentak saat penggulungan manual."
  },
  {
    key: "AT",
    label: "Atos",
    shortDesc: "Batang terlalu padat / keras melebihi standar",
    location: "Kepadatan Isi",
    color: "#8b5cf6",
    mitigation: "Sesuaikan takaran timbangan tembakau per batang agar tidak melebihi gramatur standar."
  },
  {
    key: "MM",
    label: "Mekar Mingkup",
    shortDesc: "Diameter ujung rokok tidak seragam",
    location: "Ujung Rokok",
    color: "#ec4899",
    mitigation: "Periksa keausan cetakan corong telak agar lingkaran diameter tetap presisi."
  }
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

export const INITIAL_SAMPLE_DATA = [];

