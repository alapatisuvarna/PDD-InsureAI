import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Error: Missing Supabase URL or Anon Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.log('DB_STATUS: ERROR', error.message);
    } else {
      console.log('DB_STATUS: SUCCESS', data);
    }
  } catch (e) {
    console.log('DB_STATUS: EXCEPTION', e.message);
  }
}

test();
