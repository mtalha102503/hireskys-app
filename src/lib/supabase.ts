import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://pxtifojzsouujkfxpohq.supabase.co";
// Public anon key — safe to embed in client apps (RLS protects the data).
// User pastes their anon key here (Supabase dashboard → Settings → API).
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dGlmb2p6c291dWprZnhwb2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTQ1OTIsImV4cCI6MjA4MTQ3MDU5Mn0.h0zbDWv6wgcFi200vB_7nRTiHkJ7MwiReYsFWZ22QlA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
