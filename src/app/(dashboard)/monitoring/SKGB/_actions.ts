'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Types based on RPC function return structure
export interface SkgbPengeringanRecord {
  id: number
  kdprov: number
  nmprov: string
  kdkab: string
  nmkab: string
  kdkec: string
  nmkec: string
  lokasi: string
  idsubsegmen: string
  nks: number
  fase_amatan: number
  x: number
  y: number
  bulan_panen: string
  flag_sampel: string
  petugas?: string
  email_petugas?: string
  status_pendataan: string
  date_modified: string
  created_at: string
  tahun: number
  kegiatan_id: string
}

export interface SkgbPenggilinganRecord {
  id: number
  kdprov: string
  nmprov: string
  kdkab: string
  nmkab: string
  kdkec: string
  nmkec: string
  kddesa: string
  nmdesa: string
  id_sbr: string
  nks: string
  nama_usaha: string
  narahubung: string
  telp: string
  alamat_usaha: string
  x: number
  y: number
  skala_usaha: string
  flag_sampel: string
  petugas?: string
  email_petugas?: string
  status_pendataan: string
  date_modified: string
  created_at: string
  tahun: number
}

export interface PetugasRecord {
  id: number
  nama_petugas: string
  email_petugas: string
  satker_id: string
  jabatan: string
  no_hp: string
  status: string
}

// Fetch SKGB Pengeringan records by satker using RPC
export async function fetchSkgbPengeringanBySatker(satkerId: string): Promise<SkgbPengeringanRecord[]> {
  const { data, error } = await supabaseServer
    .rpc('get_skgb_pengeringan_records', { 
      p_kdkab: satkerId,
      p_limit: 1000,
      p_offset: 0
    })

  if (error) {
    console.error('Error fetching SKGB Pengeringan by satker:', error)
    throw new Error('Failed to fetch SKGB Pengeringan records')
  }

  return data || []
}

// Fetch SKGB Penggilingan records by satker using RPC
export async function fetchSkgbPenggilinganBySatker(satkerId: string): Promise<SkgbPenggilinganRecord[]> {
  const { data, error } = await supabaseServer
    .rpc('get_skgb_penggilingan_records', { 
      p_kdkab: satkerId,
      p_limit: 1000,
      p_offset: 0
    })

  if (error) {
    console.error('Error fetching SKGB Penggilingan by satker:', error)
    throw new Error('Failed to fetch SKGB Penggilingan records')
  }

  return data || []
}

// Fetch all SKGB Pengeringan records (for super_admin) using RPC
export async function fetchAllSkgbPengeringan(): Promise<SkgbPengeringanRecord[]> {
  const { data, error } = await supabaseServer
    .rpc('get_skgb_pengeringan_records', { 
      p_limit: 10000,
      p_offset: 0
    })

  if (error) {
    console.error('Error fetching all SKGB Pengeringan:', error)
    throw new Error('Failed to fetch SKGB Pengeringan records')
  }

  return data || []
}

// Fetch all SKGB Penggilingan records (for super_admin) using RPC
export async function fetchAllSkgbPenggilingan(): Promise<SkgbPenggilinganRecord[]> {
  const { data, error } = await supabaseServer
    .rpc('get_skgb_penggilingan_records', { 
      p_limit: 10000,
      p_offset: 0
    })

  if (error) {
    console.error('Error fetching all SKGB Penggilingan:', error)
    throw new Error('Failed to fetch SKGB Penggilingan records')
  }

  return data || []
}

// Type for update response
export interface UpdateResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Update SKGB Pengeringan record
export async function updateSkgbPengeringan(
  id: number,
  updates: {
    petugas?: string
    email_petugas?: string
    status_pendataan?: string
  }
): Promise<UpdateResponse<SkgbPengeringanRecord>> {
  console.log('updateSkgbPengeringan called with:', { id, updates })
  
  try {
    // Check if record exists first
    const { data: existingRecord, error: checkError } = await supabaseServer
      .from('skgb_pengeringan')
      .select('id, petugas, email_petugas, status_pendataan')
      .eq('id', id)
      .single()

    console.log('Existing record check:', { existingRecord, checkError })

    if (checkError) {
      console.error('Record not found or check failed:', checkError)
      throw new Error(`Record with id ${id} not found: ${checkError.message}`)
    }

    // Prepare update data - only use fields that exist in the table
    const updateData: Record<string, unknown> = {}
    
    // Based on table schema, only these fields exist and can be updated:
    if (updates.petugas !== undefined) {
      updateData.petugas = updates.petugas
    }
    if (updates.email_petugas !== undefined) {
      updateData.email_petugas = updates.email_petugas  
    }
    if (updates.status_pendataan !== undefined) {
      updateData.status_pendataan = updates.status_pendataan
    }
    
    // Don't manually set date_modified - there's a trigger that handles it
    // Based on the trigger: update_skgb_pengeringan_date_modified

    console.log('Update data prepared:', updateData)

    console.log('Attempting update on skgb_pengeringan table...')
    const { data, error } = await supabaseServer
      .from('skgb_pengeringan')
      .update(updateData)
      .eq('id', id)
      .select()

    console.log('Update result:', { data, error })

    if (error) {
      console.error('Error updating SKGB Pengeringan:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/monitoring/SKGB')
    return { success: true, data: data?.[0] }
  } catch (err) {
    console.error('Exception in updateSkgbPengeringan:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to update SKGB Pengeringan record: ${errorMessage}` }
  }
}

// Update SKGB Penggilingan record
export async function updateSkgbPenggilingan(
  id: number,
  updates: {
    petugas?: string
    email_petugas?: string
    status_pendataan?: string
  }
): Promise<UpdateResponse<SkgbPenggilinganRecord>> {
  console.log('updateSkgbPenggilingan called with:', { id, updates })
  
  try {
    // Check if record exists first
    const { data: existingRecord, error: checkError } = await supabaseServer
      .from('skgb_penggilingan')
      .select('id, petugas, email_petugas, status_pendataan')
      .eq('id', id)
      .single()

    console.log('Existing record check:', { existingRecord, checkError })

    if (checkError) {
      console.error('Record not found or check failed:', checkError)
      throw new Error(`Record with id ${id} not found: ${checkError.message}`)
    }

    // Prepare update data - only use fields that exist in the table
    const updateData: Record<string, unknown> = {}
    
    // Based on table schema (assuming similar to skgb_pengeringan):
    if (updates.petugas !== undefined) {
      updateData.petugas = updates.petugas
    }
    if (updates.email_petugas !== undefined) {
      updateData.email_petugas = updates.email_petugas
    }
    if (updates.status_pendataan !== undefined) {
      updateData.status_pendataan = updates.status_pendataan
    }
    
    // Don't manually set date_modified - assuming similar trigger exists
    
    console.log('Update data prepared:', updateData)

    const { data, error } = await supabaseServer
      .from('skgb_penggilingan')
      .update(updateData)
      .eq('id', id)
      .select()

    console.log('Update result:', { data, error })

    if (error) {
      console.error('Error updating SKGB Penggilingan:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/monitoring/SKGB')
    return { success: true, data: data?.[0] }
  } catch (err) {
    console.error('Exception in updateSkgbPenggilingan:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to update SKGB Penggilingan record: ${errorMessage}` }
  }
}

// Bulk update SKGB Pengeringan records
export async function bulkUpdateSkgbPengeringan(
  updates: Array<{
    id: number
    petugas?: string
    email_petugas?: string
    status_pendataan?: string
  }>
) {
  const promises = updates.map(({ id, ...updateData }) =>
    supabaseServer
      .from('skgb_pengeringan')
      .update(updateData) // Remove manual timestamp - trigger will handle it
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  
  // Check for errors
  const errors = results.filter((result) => result.error)
  if (errors.length > 0) {
    console.error('Bulk update errors:', errors)
    throw new Error('Failed to update some SKGB Pengeringan records')
  }

  revalidatePath('/monitoring/SKGB')
  return results.map((result) => result.data?.[0]).filter(Boolean)
}

// Bulk update SKGB Penggilingan records
export async function bulkUpdateSkgbPenggilingan(
  updates: Array<{
    id: number
    petugas?: string
    email_petugas?: string
    status_pendataan?: string
  }>
) {
  const promises = updates.map(({ id, ...updateData }) =>
    supabaseServer
      .from('skgb_penggilingan')
      .update(updateData) // Remove manual timestamp - trigger will handle it
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  
  // Check for errors
  const errors = results.filter((result) => result.error)
  if (errors.length > 0) {
    console.error('Bulk update errors:', errors)
    throw new Error('Failed to update some SKGB Penggilingan records')
  }

  revalidatePath('/monitoring/SKGB')
  return results.map((result) => result.data?.[0]).filter(Boolean)
}

// Get petugas by satker using RPC function
export async function getPetugasBySatker(satkerId: string): Promise<PetugasRecord[]> {
  console.log('getPetugasBySatker called with satkerId:', satkerId)
  
  try {
    const { data, error } = await supabaseServer
      .rpc('get_petugas_by_satker', { p_satker_id: satkerId })

    console.log('RPC response - data:', data)
    console.log('RPC response - error:', error)

    if (error) {
      console.error('Error fetching petugas by satker:', error)
      
      // Fallback: try direct table query if RPC fails
      console.log('Trying fallback direct table query...')
      
      // Try different possible table names
      let fallbackData = null
      let fallbackError = null
      
      // Try petugas_db first
      const result1 = await supabaseServer
        .from('petugas_db')
        .select('id, nama_petugas, email_petugas, satker_id, jabatan, no_hp, status')
        .eq('satker_id', satkerId)
        .eq('status', 'aktif')
        .order('nama_petugas', { ascending: true })
      
      if (result1.error) {
        console.log('petugas_db table not found, trying petugas...')
        // Try petugas table
        const result2 = await supabaseServer
          .from('petugas')
          .select('id, nama, email, satker_id')
          .eq('satker_id', satkerId)
          .order('nama', { ascending: true })
        
        if (result2.error) {
          console.log('petugas table also not found:', result2.error)
          fallbackError = result2.error
        } else {
          // Map petugas data to PetugasRecord format
          fallbackData = result2.data?.map(p => ({
            id: p.id,
            nama_petugas: p.nama,
            email_petugas: p.email,
            satker_id: p.satker_id,
            jabatan: '',
            no_hp: '',
            status: 'aktif'
          })) || []
        }
      } else {
        fallbackData = result1.data
      }

      console.log('Fallback response - data:', fallbackData)
      console.log('Fallback response - error:', fallbackError)

      if (fallbackError) {
        throw new Error(`Failed to fetch petugas data: ${error.message}`)
      }

      return fallbackData || []
    }

    return data || []
  } catch (err) {
    console.error('Exception in getPetugasBySatker:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to fetch petugas data: ${errorMessage}`)
  }
}

// Get all petugas (for super_admin)
export async function getAllPetugas(): Promise<PetugasRecord[]> {
  console.log('getAllPetugas called')
  
  try {
    // Try petugas_db first
    const { data: dbData, error: dbError } = await supabaseServer
      .from('petugas_db')
      .select('id, nama_petugas, email_petugas, satker_id, jabatan, no_hp, status')
      .eq('status', 'aktif')
      .order('nama_petugas', { ascending: true })

    if (dbError) {
      console.log('petugas_db not found, trying petugas table...')
      // Try petugas table as fallback
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from('petugas')
        .select('id, nama, email, satker_id')
        .order('nama', { ascending: true })

      if (fallbackError) {
        console.error('Error fetching all petugas:', fallbackError)
        throw new Error('Failed to fetch petugas data')
      }

      // Map petugas data to PetugasRecord format
      return fallbackData?.map(p => ({
        id: p.id,
        nama_petugas: p.nama,
        email_petugas: p.email,
        satker_id: p.satker_id,
        jabatan: '',
        no_hp: '',
        status: 'aktif'
      })) || []
    }

    return dbData || []
  } catch (err) {
    console.error('Exception in getAllPetugas:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to fetch petugas data: ${errorMessage}`)
  }
}

// Fetch SKGB records with pagination support
export async function fetchSkgbRecordsWithPagination(
  skgbType: 'pengeringan' | 'penggilingan',
  satkerId?: string,
  page: number = 1,
  limit: number = 50
): Promise<{ records: (SkgbPengeringanRecord | SkgbPenggilinganRecord)[], total: number }> {
  console.log(`fetchSkgbRecordsWithPagination called with: ${skgbType}, satkerId: ${satkerId}, page: ${page}, limit: ${limit}`)
  
  const offset = (page - 1) * limit
  
  try {
    if (skgbType === 'pengeringan') {
      const { data, error } = await supabaseServer
        .rpc('get_skgb_pengeringan_records', { 
          p_kdkab: satkerId || null,
          p_limit: limit,
          p_offset: offset
        })

      if (error) {
        console.error('Error fetching SKGB Pengeringan with pagination:', error)
        throw new Error('Failed to fetch SKGB Pengeringan records')
      }

      // Get total count for pagination
      let count = 0
      if (satkerId) {
        const { count: totalCount } = await supabaseServer
          .from('skgb_pengeringan')
          .select('*', { count: 'exact', head: true })
          .eq('kdkab', satkerId)
        count = totalCount || 0
      } else {
        const { count: totalCount } = await supabaseServer
          .from('skgb_pengeringan')
          .select('*', { count: 'exact', head: true })
        count = totalCount || 0
      }

      console.log(`Found ${count} total pengeringan records`)
      return { records: data || [], total: count }
    } else {
      const { data, error } = await supabaseServer
        .rpc('get_skgb_penggilingan_records', { 
          p_kdkab: satkerId || null,
          p_limit: limit,
          p_offset: offset
        })

      if (error) {
        console.error('Error fetching SKGB Penggilingan with pagination:', error)
        throw new Error('Failed to fetch SKGB Penggilingan records')
      }

      // Get total count for pagination
      let count = 0
      if (satkerId) {
        const { count: totalCount } = await supabaseServer
          .from('skgb_penggilingan')
          .select('*', { count: 'exact', head: true })
          .eq('kdkab', satkerId)
        count = totalCount || 0
      } else {
        const { count: totalCount } = await supabaseServer
          .from('skgb_penggilingan')
          .select('*', { count: 'exact', head: true })
        count = totalCount || 0
      }

      console.log(`Found ${count} total penggilingan records`)
      return { records: data || [], total: count }
    }
  } catch (err) {
    console.error('Exception in fetchSkgbRecordsWithPagination:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to fetch SKGB records: ${errorMessage}`)
  }
}

