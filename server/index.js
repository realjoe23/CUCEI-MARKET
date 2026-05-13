const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la Capa de Datos (Supabase)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// RF-04: Ruta de prueba para verificar conexión
app.get('/api/test-db', async (req, res) => {
  const { data, error } = await supabase.from('usuarios').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Conexión exitosa a la base de datos", data });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de NEXOCODE corriendo en puerto ${PORT}`);
});