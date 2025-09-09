// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const URL = process.env.REACT_APP_SUPABASE_URL
const ANON = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(URL, ANON)
