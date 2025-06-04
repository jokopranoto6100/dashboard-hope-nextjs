export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ksa_amatan: {
        Row: {
          amatan: string | null
          bulan: number | null
          evaluasi: string | null
          flag_kode_12: string | null
          id: number
          id_segmen: string | null
          kabupaten: string | null
          kode_kab: string | null
          kode_kec: string | null
          n: number | null
          nama: string | null
          note: string | null
          status: string | null
          subsegmen: string | null
          tahun: number | null
          tanggal: string | null
        }
        Insert: {
          amatan?: string | null
          bulan?: number | null
          evaluasi?: string | null
          flag_kode_12?: string | null
          id?: number
          id_segmen?: string | null
          kabupaten?: string | null
          kode_kab?: string | null
          kode_kec?: string | null
          n?: number | null
          nama?: string | null
          note?: string | null
          status?: string | null
          subsegmen?: string | null
          tahun?: number | null
          tanggal?: string | null
        }
        Update: {
          amatan?: string | null
          bulan?: number | null
          evaluasi?: string | null
          flag_kode_12?: string | null
          id?: number
          id_segmen?: string | null
          kabupaten?: string | null
          kode_kab?: string | null
          kode_kec?: string | null
          n?: number | null
          nama?: string | null
          note?: string | null
          status?: string | null
          subsegmen?: string | null
          tahun?: number | null
          tanggal?: string | null
        }
        Relationships: []
      }
      log_refresh_mv: {
        Row: {
          last_refreshed: string | null
          view_name: string
        }
        Insert: {
          last_refreshed?: string | null
          view_name: string
        }
        Update: {
          last_refreshed?: string | null
          view_name?: string
        }
        Relationships: []
      }
      master_sampel_ubinan: {
        Row: {
          bulan: string | null
          Cadangan: number | null
          id: number
          idsegmen: string | null
          jenis_sampel: string | null
          kab: number | null
          kec: number | null
          namalok: string | null
          nmkab: string | null
          nmkec: string | null
          rilis: string | null
          subround: number | null
          subsegmen: string | null
          tahun: number | null
          Utama: number | null
          x: number | null
          y: number | null
        }
        Insert: {
          bulan?: string | null
          Cadangan?: number | null
          id?: number
          idsegmen?: string | null
          jenis_sampel?: string | null
          kab?: number | null
          kec?: number | null
          namalok?: string | null
          nmkab?: string | null
          nmkec?: string | null
          rilis?: string | null
          subround?: number | null
          subsegmen?: string | null
          tahun?: number | null
          Utama?: number | null
          x?: number | null
          y?: number | null
        }
        Update: {
          bulan?: string | null
          Cadangan?: number | null
          id?: number
          idsegmen?: string | null
          jenis_sampel?: string | null
          kab?: number | null
          kec?: number | null
          namalok?: string | null
          nmkab?: string | null
          nmkec?: string | null
          rilis?: string | null
          subround?: number | null
          subsegmen?: string | null
          tahun?: number | null
          Utama?: number | null
          x?: number | null
          y?: number | null
        }
        Relationships: []
      }
      produksi_statistik: {
        Row: {
          bulan: string | null
          bulan_ke: number | null
          id: number
          indikator: string
          jenis_data: string
          kode_wilayah: string
          komoditas: string
          level: string
          nama_wilayah: string
          nilai: number | null
          satuan: string | null
          tahun: number
        }
        Insert: {
          bulan?: string | null
          bulan_ke?: number | null
          id?: number
          indikator: string
          jenis_data: string
          kode_wilayah: string
          komoditas: string
          level: string
          nama_wilayah: string
          nilai?: number | null
          satuan?: string | null
          tahun: number
        }
        Update: {
          bulan?: string | null
          bulan_ke?: number | null
          id?: number
          indikator?: string
          jenis_data?: string
          kode_wilayah?: string
          komoditas?: string
          level?: string
          nama_wilayah?: string
          nilai?: number | null
          satuan?: string | null
          tahun?: number
        }
        Relationships: []
      }
      ubinan_raw: {
        Row: {
          "bs/sseg": string | null
          bulan_panen: string | null
          bulanmaster: string | null
          date_modified: string | null
          "des/seg": string | null
          fasetanam: string | null
          id: string
          kab: number | null
          kec: number | null
          komoditas: string | null
          lat: number | null
          long: number | null
          nks: string | null
          prioritas: string | null
          prov: number | null
          r101: string | null
          r102: string | null
          r103: string | null
          r104: string | null
          r110_palawija: string | null
          r111: string | null
          r111a_label: string | null
          r111a_lain: string | null
          r111a_value: string | null
          r112: string | null
          r112a_label: string | null
          r112a_value: string | null
          r113: string | null
          r201_palawija: string | null
          r303a: string | null
          r303b: string | null
          r304_accuracy: string | null
          r304_latitude: string | null
          r304_longitude: string | null
          r401a: string | null
          r401b: string | null
          r501_label: string | null
          r501_value: string | null
          r501a: string | null
          r501b: string | null
          r502a: string | null
          r502b: string | null
          r601_label: string | null
          r601_value: string | null
          r602_label: string | null
          r602_value: string | null
          r603: string | null
          r604: number | null
          r605_label: string | null
          r605_value: string | null
          r606a_label: string | null
          r606a_value: string | null
          r606b_label: string | null
          r606b_value: string | null
          r607_label: string | null
          r607_value: string | null
          r608: number | null
          r609_label: string | null
          r609_value: number | null
          r610_1: number | null
          r610_2: number | null
          r610_3: number | null
          r610_4: number | null
          r610_5: number | null
          r610_6: number | null
          r610_7: number | null
          r611_label: string | null
          r611_value: string | null
          r701: number | null
          r702: number | null
          r801a_label: string | null
          r801a_value: string | null
          r801b_label: string | null
          r801b_lain: string | null
          r801b_value: string | null
          r801c_label: string | null
          r801c_value: string | null
          r801d_label: string | null
          r801d_value: string | null
          r801e_label: string | null
          r801e_value: string | null
          r802a_label: string | null
          r802a_value: string | null
          r802b_label: string | null
          r802b_lain: string | null
          r802b_value: string | null
          r802c_label: string | null
          r802c_value: string | null
          r803a_label: string | null
          r803a_value: string | null
          r803b_label: string | null
          r803b_value: string | null
          r803c_1: string | null
          r803c_2: string | null
          r803c_3: string | null
          r803c_4: string | null
          r803c_lain: string | null
          r803di_label: string | null
          r803di_value: string | null
          r804a_label: string | null
          r804a_value: string | null
          r804b_label: string | null
          r804b_value: string | null
          r805a_label: string | null
          r805a_value: string | null
          r805b_label: string | null
          r805b_value: string | null
          r806a_label: string | null
          r806a_value: string | null
          r806b_label: string | null
          r806b_value: string | null
          r807a_label: string | null
          r807a_value: string | null
          r807b_label: string | null
          r807b_value: string | null
          r808a_label: string | null
          r808a_value: string | null
          r808b_label: string | null
          r808b_value: string | null
          r809a_label: string | null
          r809a_value: string | null
          r809b_label: string | null
          r809b_value: string | null
          r901: string | null
          status: string | null
          subround: number | null
          tahun: number | null
          uploaded_at: string | null
          url: string | null
          validasi: string | null
        }
        Insert: {
          "bs/sseg"?: string | null
          bulan_panen?: string | null
          bulanmaster?: string | null
          date_modified?: string | null
          "des/seg"?: string | null
          fasetanam?: string | null
          id?: string
          kab?: number | null
          kec?: number | null
          komoditas?: string | null
          lat?: number | null
          long?: number | null
          nks?: string | null
          prioritas?: string | null
          prov?: number | null
          r101?: string | null
          r102?: string | null
          r103?: string | null
          r104?: string | null
          r110_palawija?: string | null
          r111?: string | null
          r111a_label?: string | null
          r111a_lain?: string | null
          r111a_value?: string | null
          r112?: string | null
          r112a_label?: string | null
          r112a_value?: string | null
          r113?: string | null
          r201_palawija?: string | null
          r303a?: string | null
          r303b?: string | null
          r304_accuracy?: string | null
          r304_latitude?: string | null
          r304_longitude?: string | null
          r401a?: string | null
          r401b?: string | null
          r501_label?: string | null
          r501_value?: string | null
          r501a?: string | null
          r501b?: string | null
          r502a?: string | null
          r502b?: string | null
          r601_label?: string | null
          r601_value?: string | null
          r602_label?: string | null
          r602_value?: string | null
          r603?: string | null
          r604?: number | null
          r605_label?: string | null
          r605_value?: string | null
          r606a_label?: string | null
          r606a_value?: string | null
          r606b_label?: string | null
          r606b_value?: string | null
          r607_label?: string | null
          r607_value?: string | null
          r608?: number | null
          r609_label?: string | null
          r609_value?: number | null
          r610_1?: number | null
          r610_2?: number | null
          r610_3?: number | null
          r610_4?: number | null
          r610_5?: number | null
          r610_6?: number | null
          r610_7?: number | null
          r611_label?: string | null
          r611_value?: string | null
          r701?: number | null
          r702?: number | null
          r801a_label?: string | null
          r801a_value?: string | null
          r801b_label?: string | null
          r801b_lain?: string | null
          r801b_value?: string | null
          r801c_label?: string | null
          r801c_value?: string | null
          r801d_label?: string | null
          r801d_value?: string | null
          r801e_label?: string | null
          r801e_value?: string | null
          r802a_label?: string | null
          r802a_value?: string | null
          r802b_label?: string | null
          r802b_lain?: string | null
          r802b_value?: string | null
          r802c_label?: string | null
          r802c_value?: string | null
          r803a_label?: string | null
          r803a_value?: string | null
          r803b_label?: string | null
          r803b_value?: string | null
          r803c_1?: string | null
          r803c_2?: string | null
          r803c_3?: string | null
          r803c_4?: string | null
          r803c_lain?: string | null
          r803di_label?: string | null
          r803di_value?: string | null
          r804a_label?: string | null
          r804a_value?: string | null
          r804b_label?: string | null
          r804b_value?: string | null
          r805a_label?: string | null
          r805a_value?: string | null
          r805b_label?: string | null
          r805b_value?: string | null
          r806a_label?: string | null
          r806a_value?: string | null
          r806b_label?: string | null
          r806b_value?: string | null
          r807a_label?: string | null
          r807a_value?: string | null
          r807b_label?: string | null
          r807b_value?: string | null
          r808a_label?: string | null
          r808a_value?: string | null
          r808b_label?: string | null
          r808b_value?: string | null
          r809a_label?: string | null
          r809a_value?: string | null
          r809b_label?: string | null
          r809b_value?: string | null
          r901?: string | null
          status?: string | null
          subround?: number | null
          tahun?: number | null
          uploaded_at?: string | null
          url?: string | null
          validasi?: string | null
        }
        Update: {
          "bs/sseg"?: string | null
          bulan_panen?: string | null
          bulanmaster?: string | null
          date_modified?: string | null
          "des/seg"?: string | null
          fasetanam?: string | null
          id?: string
          kab?: number | null
          kec?: number | null
          komoditas?: string | null
          lat?: number | null
          long?: number | null
          nks?: string | null
          prioritas?: string | null
          prov?: number | null
          r101?: string | null
          r102?: string | null
          r103?: string | null
          r104?: string | null
          r110_palawija?: string | null
          r111?: string | null
          r111a_label?: string | null
          r111a_lain?: string | null
          r111a_value?: string | null
          r112?: string | null
          r112a_label?: string | null
          r112a_value?: string | null
          r113?: string | null
          r201_palawija?: string | null
          r303a?: string | null
          r303b?: string | null
          r304_accuracy?: string | null
          r304_latitude?: string | null
          r304_longitude?: string | null
          r401a?: string | null
          r401b?: string | null
          r501_label?: string | null
          r501_value?: string | null
          r501a?: string | null
          r501b?: string | null
          r502a?: string | null
          r502b?: string | null
          r601_label?: string | null
          r601_value?: string | null
          r602_label?: string | null
          r602_value?: string | null
          r603?: string | null
          r604?: number | null
          r605_label?: string | null
          r605_value?: string | null
          r606a_label?: string | null
          r606a_value?: string | null
          r606b_label?: string | null
          r606b_value?: string | null
          r607_label?: string | null
          r607_value?: string | null
          r608?: number | null
          r609_label?: string | null
          r609_value?: number | null
          r610_1?: number | null
          r610_2?: number | null
          r610_3?: number | null
          r610_4?: number | null
          r610_5?: number | null
          r610_6?: number | null
          r610_7?: number | null
          r611_label?: string | null
          r611_value?: string | null
          r701?: number | null
          r702?: number | null
          r801a_label?: string | null
          r801a_value?: string | null
          r801b_label?: string | null
          r801b_lain?: string | null
          r801b_value?: string | null
          r801c_label?: string | null
          r801c_value?: string | null
          r801d_label?: string | null
          r801d_value?: string | null
          r801e_label?: string | null
          r801e_value?: string | null
          r802a_label?: string | null
          r802a_value?: string | null
          r802b_label?: string | null
          r802b_lain?: string | null
          r802b_value?: string | null
          r802c_label?: string | null
          r802c_value?: string | null
          r803a_label?: string | null
          r803a_value?: string | null
          r803b_label?: string | null
          r803b_value?: string | null
          r803c_1?: string | null
          r803c_2?: string | null
          r803c_3?: string | null
          r803c_4?: string | null
          r803c_lain?: string | null
          r803di_label?: string | null
          r803di_value?: string | null
          r804a_label?: string | null
          r804a_value?: string | null
          r804b_label?: string | null
          r804b_value?: string | null
          r805a_label?: string | null
          r805a_value?: string | null
          r805b_label?: string | null
          r805b_value?: string | null
          r806a_label?: string | null
          r806a_value?: string | null
          r806b_label?: string | null
          r806b_value?: string | null
          r807a_label?: string | null
          r807a_value?: string | null
          r807b_label?: string | null
          r807b_value?: string | null
          r808a_label?: string | null
          r808a_value?: string | null
          r808b_label?: string | null
          r808b_value?: string | null
          r809a_label?: string | null
          r809a_value?: string | null
          r809b_label?: string | null
          r809b_value?: string | null
          r901?: string | null
          status?: string | null
          subround?: number | null
          tahun?: number | null
          uploaded_at?: string | null
          url?: string | null
          validasi?: string | null
        }
        Relationships: []
      }
      ubinan_raw_files_metadata: {
        Row: {
          file_name: string
          id: number
          tahun: number
          uploaded_at: string
        }
        Insert: {
          file_name: string
          id?: number
          tahun: number
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          id?: number
          tahun?: number
          uploaded_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      chart_amatan_summary: {
        Row: {
          bulan: number | null
          jumlah: number | null
          kabupaten: string | null
          n: number | null
          tahun: number | null
        }
        Relationships: []
      }
      kondisi_panen: {
        Row: {
          bulan: number | null
          id_segmen: string | null
          is_panen: boolean | null
          is_tanam: boolean | null
          kabupaten: string | null
          kode_kab: string | null
          n: number | null
          n_prev: number | null
          subsegmen: string | null
          tahun: number | null
        }
        Relationships: []
      }
      rekap_amatan_pivot: {
        Row: {
          "1": number | null
          "10": number | null
          "11": number | null
          "12": number | null
          "2": number | null
          "3": number | null
          "4": number | null
          "5": number | null
          "6": number | null
          "7": number | null
          "8": number | null
          "9": number | null
          id_subsegmen: string | null
          tahun: number | null
        }
        Relationships: []
      }
      ubinan_anomali: {
        Row: {
          anomali: string[] | null
          "bs/sseg": string | null
          "des/seg": string | null
          kab: number | null
          kec: number | null
          komoditas: string | null
          prov: number | null
          r604: number | null
          r608: number | null
          r609_value: number | null
          r610_1: number | null
          r610_4: number | null
          r701: number | null
          r702: number | null
          subround: number | null
          tahun: number | null
          timestamp_refresh: string | null
        }
        Relationships: []
      }
      ubinan_dashboard: {
        Row: {
          "1": number | null
          "10": number | null
          "11": number | null
          "12": number | null
          "2": number | null
          "3": number | null
          "4": number | null
          "5": number | null
          "6": number | null
          "7": number | null
          "8": number | null
          "9": number | null
          anomali: string[] | null
          bulan: string | null
          Cadangan: number | null
          id: number | null
          id_join: string | null
          id_subsegmen: string | null
          idsegmen: string | null
          jenis_sampel: string | null
          kab: number | null
          kec: number | null
          komoditas: string | null
          lewat_panen_1: number | null
          lewat_panen_10: number | null
          lewat_panen_11: number | null
          lewat_panen_12: number | null
          lewat_panen_2: number | null
          lewat_panen_3: number | null
          lewat_panen_4: number | null
          lewat_panen_5: number | null
          lewat_panen_6: number | null
          lewat_panen_7: number | null
          lewat_panen_8: number | null
          lewat_panen_9: number | null
          namalok: string | null
          nmkab: string | null
          nmkec: string | null
          r604: number | null
          r608: number | null
          r610_1: number | null
          r610_4: number | null
          r701: number | null
          r702: number | null
          rilis: string | null
          status: string | null
          subround: number | null
          subsegmen: string | null
          tahun: number | null
          timestamp_refresh: string | null
          Utama: number | null
          validasi: string | null
          x: number | null
          y: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_all_managed_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          created_at: string
          username: string
          role: string
        }[]
      }
      update_user_custom_role: {
        Args: { user_id_to_update: string; new_custom_role: string }
        Returns: string
      }
      update_user_custom_username: {
        Args: { user_id_to_update: string; new_custom_username: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
