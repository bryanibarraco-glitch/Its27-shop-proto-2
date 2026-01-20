import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://cumxihwdtxgyoujuisdt.supabase.co';
const supabaseKey = 'sb_publishable_kZew5w0hO9_XpVUNuUeVVg_bavTwqYr';

export const supabase = createClient(supabaseUrl, supabaseKey);