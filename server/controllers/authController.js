// server/controllers/authController.js

// 1. IMPORTAR el cliente desde config (NO lo vuelvas a crear aquí)
const supabase = require('../config/supabaseClient'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registrarUsuario = async (req, res) => {
    try {
        // Ahora req.body tendrá los datos gracias a Multer
        const { nombre, correo, password, rol, codigo } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({ message: "Error: Faltan campos obligatorios" });
        }


        // Hashing de contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar en la tabla 'usuarios' de Supabase
        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                { 
                    nombre_completo: nombre, 
                    correo_institucional: correo, 
                    contrasena: passwordHash, 
                    rol: rol || 'vendedor',
                    codigo_estudiante: codigo 
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({ message: "Usuario creado exitosamente", user: data[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginUsuario = async (req, res) => {
    res.json({ message: "Endpoint de login listo" });
};