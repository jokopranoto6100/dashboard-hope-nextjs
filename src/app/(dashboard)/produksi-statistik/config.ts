// Lokasi: src/app/(dashboard)/produksi-statistik/config.ts

// Pastikan semua konstanta ini di-export dengan benar.

export const KABUPATEN_MAP: { [key: string]: string } = {
    "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah",
    "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu",
    "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya",
    "6171": "Pontianak", "6172": "Singkawang"
};

export const MONTH_NAMES: { [key: string]: string } = {
    "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "Mei", "6": "Jun",
    "7": "Jul", "8": "Agu", "9": "Sep", "10": "Okt", "11": "Nov", "12": "Des"
};

export const FULL_MONTH_NAMES: { [key: string]: string[] } = {
    "1": ["1", "Januari"], "2": ["2", "Februari"], "3": ["3", "Maret"],
    "4": ["4", "April"], "5": ["5", "Mei"], "6": ["6", "Juni"],
    "7": ["7", "Juli"], "8": ["8", "Agustus"], "9": ["9", "September"],
    "10": ["10", "Oktober"], "11": ["11", "November"], "12": ["12", "Desember"]
};