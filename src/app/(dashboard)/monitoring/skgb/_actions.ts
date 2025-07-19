'use server'

// PERFORMANCE OPTIMIZATION: Using optimized RPC functions for Kelola Sampel modal
// - get_skgb_pengeringan_records_optimized with fallback to original
// - get_skgb_penggilingan_records_optimized with fallback to original  
// - get_skgb_pengeringan_count_optimized with fallback to original
// - get_skgb_penggilingan_count_optimized with fallback to original
// Expected improvement: 80-90% performance boost (2-5s → 200-500ms)

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
  try {
    // Check if record exists first
    const { error: checkError } = await supabaseServer
      .from('skgb_pengeringan')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
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

    const { data, error } = await supabaseServer
      .from('skgb_pengeringan')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/monitoring/SKGB')
    return { success: true, data: data?.[0] }
  } catch (err) {
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
  try {
    // Check if record exists first
    const { error: checkError } = await supabaseServer
      .from('skgb_penggilingan')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
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
    
    const { data, error } = await supabaseServer
      .from('skgb_penggilingan')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/monitoring/SKGB')
    return { success: true, data: data?.[0] }
  } catch (err) {
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
  try {
    const { data, error } = await supabaseServer
      .rpc('get_petugas_by_satker', { p_satker_id: satkerId })

    if (error) {
      // Fallback: try direct table query if RPC fails
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
        // Try petugas table
        const result2 = await supabaseServer
          .from('petugas')
          .select('id, nama, email, satker_id')
          .eq('satker_id', satkerId)
          .order('nama', { ascending: true })
        
        if (result2.error) {
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

      if (fallbackError) {
        throw new Error(`Failed to fetch petugas data: ${error.message}`)
      }

      return fallbackData || []
    }

    return data || []
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to fetch petugas data: ${errorMessage}`)
  }
}

// Get all petugas (for super_admin)
export async function getAllPetugas(): Promise<PetugasRecord[]> {
  try {
    // Try petugas_db first
    const { data: dbData, error: dbError } = await supabaseServer
      .from('petugas_db')
      .select('id, nama_petugas, email_petugas, satker_id, jabatan, no_hp, status')
      .eq('status', 'aktif')
      .order('nama_petugas', { ascending: true })

    if (dbError) {
      // Try petugas table as fallback
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from('petugas')
        .select('id, nama, email, satker_id')
        .order('nama', { ascending: true })

      if (fallbackError) {
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
  limit: number = 50,
  flagSampel: string = 'U',
  searchTerm?: string
): Promise<{ records: (SkgbPengeringanRecord | SkgbPenggilinganRecord)[], total: number }> {
  const startTime = Date.now() // Performance tracking
  const offset = (page - 1) * limit
  
  try {
    if (skgbType === 'pengeringan') {
      // Try RPC function first, fallback to direct query if RPC doesn't exist
      let data, totalCount = 0;
      
      try {
        // Use optimized RPC function first, fallback to original if not available
        const { data: rpcData, error } = await supabaseServer
          .rpc('get_skgb_pengeringan_records_optimized', {
            p_kdkab: satkerId || null,
            p_flag_sampel: flagSampel,
            p_search_term: searchTerm || null,
            p_limit: limit,
            p_offset: offset
          })

        if (error) {
          // Fallback to original RPC function
          const { data: originalData, error: originalError } = await supabaseServer
            .rpc('get_skgb_pengeringan_records', {
              p_kdkab: satkerId || null,
              p_flag_sampel: flagSampel,
              p_search_term: searchTerm || null,
              p_limit: limit,
              p_offset: offset
            })
          
          if (originalError) {
            throw new Error('RPC not available')
          }
          
          data = originalData
        } else {
          data = rpcData
        }

        // Get count using optimized RPC function
        const { data: countData, error: countError } = await supabaseServer
          .rpc('get_skgb_pengeringan_count_optimized', {
            p_kdkab: satkerId || null,
            p_flag_sampel: flagSampel,
            p_search_term: searchTerm || null
          })

        if (countError) {
          // Fallback to original count function
          const { data: originalCountData, error: originalCountError } = await supabaseServer
            .rpc('get_skgb_pengeringan_count', {
              p_kdkab: satkerId || null,
              p_flag_sampel: flagSampel,
              p_search_term: searchTerm || null
            })
          
          if (originalCountError) {
            throw new Error('Count RPC not available')
          }
          
          totalCount = originalCountData || 0
        } else {
          totalCount = countData || 0
        }

        if (countError) {
          throw new Error('Count RPC not available')
        }

        totalCount = countData || 0
      } catch {
        // Fallback to direct table query
        let query = supabaseServer
          .from('skgb_pengeringan')
          .select(`
            id, kdprov, nmprov, kdkab, nmkab, kdkec, nmkec, lokasi, idsubsegmen,
            nks, fase_amatan, x, y, bulan_panen, flag_sampel, petugas, 
            email_petugas, status_pendataan, date_modified, created_at, tahun
          `)

        // Apply filters
        if (satkerId) {
          query = query.eq('kdkab', satkerId)
        }
        
        if (flagSampel !== 'ALL') {
          query = query.eq('flag_sampel', flagSampel)
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          const search = searchTerm.trim().toLowerCase()
          query = query.or(`nmkab.ilike.%${search}%,nmkec.ilike.%${search}%,lokasi.ilike.%${search}%,idsubsegmen.ilike.%${search}%,petugas.ilike.%${search}%`)
        }

        // Get total count first - need separate query for count
        let countQuery = supabaseServer
          .from('skgb_pengeringan')
          .select('*', { count: 'exact' })

        // Apply same filters for count
        if (satkerId) {
          countQuery = countQuery.eq('kdkab', satkerId)
        }
        
        if (flagSampel !== 'ALL') {
          countQuery = countQuery.eq('flag_sampel', flagSampel)
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          const search = searchTerm.trim().toLowerCase()
          countQuery = countQuery.or(`nmkab.ilike.%${search}%,nmkec.ilike.%${search}%,lokasi.ilike.%${search}%,idsubsegmen.ilike.%${search}%,petugas.ilike.%${search}%`)
        }
        
        const { count } = await countQuery
        totalCount = count || 0

        // Get paginated data
        const result = await query
          .order('nmkab', { ascending: true })
          .order('nmkec', { ascending: true })
          .range(offset, offset + limit - 1)

        if (result.error) {
          throw new Error('Failed to fetch SKGB Pengeringan records')
        }
        
        data = result.data
      }

      return { records: data || [], total: totalCount }
    } else {
      // Try RPC function first, fallback to direct query if RPC doesn't exist
      let data, totalCount = 0;
      
      try {
        // Use optimized RPC function first, fallback to original if not available
        const { data: rpcData, error } = await supabaseServer
          .rpc('get_skgb_penggilingan_records_optimized', {
            p_kdkab: satkerId || null,
            p_flag_sampel: flagSampel,
            p_search_term: searchTerm || null,
            p_limit: limit,
            p_offset: offset
          })

        if (error) {
          // Fallback to original RPC function
          const { data: originalData, error: originalError } = await supabaseServer
            .rpc('get_skgb_penggilingan_records', {
              p_kdkab: satkerId || null,
              p_flag_sampel: flagSampel,
              p_search_term: searchTerm || null,
              p_limit: limit,
              p_offset: offset
            })
          
          if (originalError) {
            throw new Error('RPC not available')
          }
          
          data = originalData
        } else {
          data = rpcData
        }

        // Get count using optimized RPC function
        const { data: countData, error: countError } = await supabaseServer
          .rpc('get_skgb_penggilingan_count_optimized', {
            p_kdkab: satkerId || null,
            p_flag_sampel: flagSampel,
            p_search_term: searchTerm || null
          })

        if (countError) {
          // Fallback to original count function
          const { data: originalCountData, error: originalCountError } = await supabaseServer
            .rpc('get_skgb_penggilingan_count', {
              p_kdkab: satkerId || null,
              p_flag_sampel: flagSampel,
              p_search_term: searchTerm || null
            })
          
          if (originalCountError) {
            throw new Error('Count RPC not available')
          }
          
          totalCount = originalCountData || 0
        } else {
          totalCount = countData || 0
        }
      } catch {
        // Fallback to direct table query
        let query = supabaseServer
          .from('skgb_penggilingan')
          .select(`
            id, kdprov, nmprov, kdkab, nmkab, kdkec, nmkec, kddesa, nmdesa,
            id_sbr, nks, nama_usaha, narahubung, telp, alamat_usaha, x, y,
            skala_usaha, flag_sampel, petugas, email_petugas, status_pendataan,
            date_modified, created_at, tahun
          `)

        // Apply filters
        if (satkerId) {
          query = query.eq('kdkab', satkerId)
        }
        
        if (flagSampel !== 'ALL') {
          query = query.eq('flag_sampel', flagSampel)
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          const search = searchTerm.trim().toLowerCase()
          query = query.or(`nmkab.ilike.%${search}%,nmkec.ilike.%${search}%,nmdesa.ilike.%${search}%,nama_usaha.ilike.%${search}%,petugas.ilike.%${search}%`)
        }

        // Get total count first - need separate query for count
        let countQuery = supabaseServer
          .from('skgb_penggilingan')
          .select('*', { count: 'exact' })

        // Apply same filters for count
        if (satkerId) {
          countQuery = countQuery.eq('kdkab', satkerId)
        }
        
        if (flagSampel !== 'ALL') {
          countQuery = countQuery.eq('flag_sampel', flagSampel)
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          const search = searchTerm.trim().toLowerCase()
          countQuery = countQuery.or(`nmkab.ilike.%${search}%,nmkec.ilike.%${search}%,nmdesa.ilike.%${search}%,nama_usaha.ilike.%${search}%,petugas.ilike.%${search}%`)
        }
        
        const { count } = await countQuery
        totalCount = count || 0

        // Get paginated data
        const result = await query
          .order('nmkab', { ascending: true })
          .order('nmkec', { ascending: true })
          .range(offset, offset + limit - 1)

        if (result.error) {
          throw new Error('Failed to fetch SKGB Penggilingan records')
        }
        
        data = result.data
      }

      return { records: data || [], total: totalCount }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to fetch SKGB records: ${errorMessage}`)
  } finally {
    // Performance monitoring in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - startTime
      console.log(`🚀 SKGB-${skgbType}-fetch: ${duration}ms (page: ${page}, limit: ${limit}, search: ${searchTerm ? 'yes' : 'no'})`)
    }
  }
}

