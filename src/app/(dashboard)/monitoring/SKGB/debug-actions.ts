'use server'

import { supabaseServer } from '@/lib/supabase-server'

export async function debugSkgbData(satkerId: string) {
  console.log('=== DEBUG SKGB DATA FOR SATKER:', satkerId, '===')
  
  try {
    // Test 1: Check if RPC functions exist
    console.log('Testing RPC functions...')
    
    const { data: rpcTest, error: rpcError } = await supabaseServer
      .rpc('get_skgb_pengeringan_records', {
        p_kdkab: satkerId,
        p_flag_sampel: 'U',
        p_search_term: null,
        p_limit: 5,
        p_offset: 0
      })
    
    console.log('RPC Test Result:', { data: rpcTest, error: rpcError })
    
    // Test 2: Direct table query
    console.log('Testing direct table query...')
    
    const { data: directData, error: directError } = await supabaseServer
      .from('skgb_pengeringan')
      .select('id, kdkab, nmkab, flag_sampel')
      .eq('kdkab', satkerId)
      .limit(5)
    
    console.log('Direct Query Result:', { data: directData, error: directError })
    
    // Test 3: Check available kdkab values
    console.log('Checking available kdkab values...')
    
    const { data: kdkabData, error: kdkabError } = await supabaseServer
      .from('skgb_pengeringan')
      .select('kdkab, nmkab')
      .like('kdkab', `%${satkerId.slice(-3)}%`)
      .limit(10)
    
    console.log('Available kdkab values:', { data: kdkabData, error: kdkabError })
    
    return {
      rpc: { data: rpcTest, error: rpcError },
      direct: { data: directData, error: directError },
      kdkab: { data: kdkabData, error: kdkabError }
    }
    
  } catch (error) {
    console.error('Debug error:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
