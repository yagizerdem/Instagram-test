import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tfuvydqqmhsstllzhrfw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdXZ5ZHFxbWhzc3RsbHpocmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIzNTM1NTQsImV4cCI6MjAzNzkyOTU1NH0.l-7HFlR_Q0HIduNBgk6deHmnNLbsdOx3mtcV_QujL8k";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
