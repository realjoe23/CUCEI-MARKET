const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importar las rutas que creamos
const authRoutes = require('./routes/authRoutes');

const app = express();

// 2. Middlewares (Configuración del servidor)
app.use(cors()); // Permite que el frontend (puerto 5173) se conecte
app.use(express.json()); // Permite recibir datos en formato JSON
app.use(express.urlencoded({ extended: true })); // Permite recibir datos de formularios (FormData)

// 3. Definición de rutas (API Gateway)
// Todas las rutas de autenticación empezarán con /api/auth
app.use('/api/auth', authRoutes);

// 4. Ruta de prueba para verificar que el servidor esté vivo
app.get('/', (req, res) => {
    res.send('Servidor de CUCEI Market funcionando 🚀');
});

// 5. Encendido del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`  NEXOCODE - Backend CUCEI Market`);
    console.log(`  Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`==========================================`);
});