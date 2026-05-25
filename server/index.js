const express = require('express');
const cors = require('cors');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));

// MANTÉN ESTO: es necesario para el JSON normal
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));