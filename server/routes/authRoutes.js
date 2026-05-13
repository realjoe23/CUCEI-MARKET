const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');

// Configuración básica para procesar el archivo en memoria
const upload = multer({ storage: multer.memoryStorage() });

// Agregamos 'upload.single(kardex)' para que intercepte el archivo
router.post('/register', upload.single('kardex'), authController.registrarUsuario);
router.post('/login', authController.loginUsuario);

module.exports = router;