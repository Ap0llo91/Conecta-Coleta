// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eylttegagagwvkkyddno.supabase.co'; // Cole seu URL aqui
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bHR0ZWdhZ2Fnd3Zra3lkZG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDk3ODQsImV4cCI6MjA3NjcyNTc4NH0.VcCykL_yUHF2hLR69Ay9EVUm_Mbdqn_HmEE6yytS93w'; // Cole sua Chave Anon aqui

export const supabase = createClient(supabaseUrl, supabaseAnonKey);