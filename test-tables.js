const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wcaemhlxpgoxkmnvrzdb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTables() {
  console.log('=== Testing SKGB Tables ===');
  
  // Test skgb_pengeringan
  console.log('\n1. Testing skgb_pengeringan table...');
  try {
    const { data, error } = await supabase
      .from('skgb_pengeringan')
      .select('id, petugas, email_petugas, status_pendataan, date_modified')
      .limit(1);
    
    console.log('skgb_pengeringan - Data:', data);
    console.log('skgb_pengeringan - Error:', error);
    
    if (data && data.length > 0) {
      console.log('Table structure:', Object.keys(data[0]));
    }
  } catch (err) {
    console.error('skgb_pengeringan error:', err);
  }

  // Test skgb_penggilingan
  console.log('\n2. Testing skgb_penggilingan table...');
  try {
    const { data, error } = await supabase
      .from('skgb_penggilingan')
      .select('id, petugas, email_petugas, status_pendataan, date_modified')
      .limit(1);
    
    console.log('skgb_penggilingan - Data:', data);
    console.log('skgb_penggilingan - Error:', error);
    
    if (data && data.length > 0) {
      console.log('Table structure:', Object.keys(data[0]));
    }
  } catch (err) {
    console.error('skgb_penggilingan error:', err);
  }

  // Test petugas_db
  console.log('\n3. Testing petugas_db table...');
  try {
    const { data, error } = await supabase
      .from('petugas_db')
      .select('*')
      .limit(1);
    
    console.log('petugas_db - Data:', data);
    console.log('petugas_db - Error:', error);
    
    if (data && data.length > 0) {
      console.log('Table structure:', Object.keys(data[0]));
    }
  } catch (err) {
    console.error('petugas_db error:', err);
  }

  // Test petugas
  console.log('\n4. Testing petugas table...');
  try {
    const { data, error } = await supabase
      .from('petugas')
      .select('*')
      .limit(1);
    
    console.log('petugas - Data:', data);
    console.log('petugas - Error:', error);
    
    if (data && data.length > 0) {
      console.log('Table structure:', Object.keys(data[0]));
    }
  } catch (err) {
    console.error('petugas error:', err);
  }

  // Test RPC function
  console.log('\n5. Testing get_petugas_by_satker RPC...');
  try {
    const { data, error } = await supabase
      .rpc('get_petugas_by_satker', { p_satker_id: '3201' });
    
    console.log('RPC - Data:', data);
    console.log('RPC - Error:', error);
  } catch (err) {
    console.error('RPC error:', err);
  }

  console.log('\n=== Test Complete ===');
}

testTables().catch(console.error);
