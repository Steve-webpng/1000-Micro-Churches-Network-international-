import { createClient } from '@supabase/supabase-js';

// Using credentials provided by the user
const SUPABASE_URL = "https://tgadvwegqwkgvqgldbcq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYWR2d2VncXdrZ3ZxZ2xkYmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDg2NjAsImV4cCI6MjA3OTEyNDY2MH0.X9JDzi2FnEnbivHKFZesdsNnQVQJEHZzs7AWwwVFTGQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
