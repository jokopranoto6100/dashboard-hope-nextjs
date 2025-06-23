// /app/(dashboard)/monitoring/simtp/types.ts

export interface SimtpMonthStatus {
    file_type: 'STP_BULANAN';
    file_name: string;
    uploaded_at: string;
  }
  
  export interface SimtpAnnualStatus {
    LAHAN_TAHUNAN?: { uploaded_at: string; file_name: string; };
    ALSIN_TAHUNAN?: { uploaded_at: string; file_name: string; };
    BENIH_TAHUNAN?: { uploaded_at: string; file_name: string; };
  }
  
  // ======================= PERBAIKAN UTAMA DI SINI =======================
  // Nama parameter index diubah dari `kabupaten_kode` menjadi `kode`
  export type SimtpMonitoringData = {
    [kode: string]: {
      months: { [month: number]: SimtpMonthStatus };
      annuals: SimtpAnnualStatus;
    };
  };
  // =======================================================================
  
  export interface SimtpTableRow {
    nmkab: string;
    kab_kode: string;
    '1': SimtpMonthStatus | null;
    '2': SimtpMonthStatus | null;
    '3': SimtpMonthStatus | null;
    '4': SimtpMonthStatus | null;
    '5': SimtpMonthStatus | null;
    '6': SimtpMonthStatus | null;
    '7': SimtpMonthStatus | null;
    '8': SimtpMonthStatus | null;
    '9': SimtpMonthStatus | null;
    '10': SimtpMonthStatus | null;
    '11': SimtpMonthStatus | null;
    '12': SimtpMonthStatus | null;
    annuals: SimtpAnnualStatus;
  }