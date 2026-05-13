const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Exportamos el cliente para que cualquier controlador pueda usarlo
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;