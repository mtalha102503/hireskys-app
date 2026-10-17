import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://pxtifojzsouujkfxpohq.supabase.co";
// Public anon key — safe to embed in client apps (RLS protects the data).
// User pastes their anon key here (Supabase dashboard → Settings → API).
const SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_KEY_HERE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
