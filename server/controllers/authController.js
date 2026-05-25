// server/controllers/authController.js
const supabase = require('../config/supabaseClient'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol, codigo } = req.body;
        const file = req.file; // Aquí viene el PDF gracias a Multer

        // 1. Validaciones básicas de negocio
        if (!nombre || !correo || !password) {
            return res.status(400).json({ message: "Error: Faltan campos obligatorios" });
        }

        if (!file) {
            return res.status(400).json({ message: "Error: El archivo Kardex es obligatorio" });
        }

        // 2. Subir el PDF a Supabase Storage
        // Creamos un nombre único para el archivo usando el código del estudiante y la fecha
        const safeCodigo = (codigo || 'sin-codigo').toString().replace(/[^a-zA-Z0-9]/g, '-');
        const fileName = `kardex-${safeCodigo}-${Date.now()}.pdf`;

        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('kardex') // El nombre del bucket que creaste
            .upload(fileName, file.buffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (storageError) {
            throw new Error(`Error al subir Storage: ${storageError.message}`);
        }

        // 3. Obtener la URL pública del archivo subido
        const { data: publicUrlData } = supabase
            .storage
            .from('kardex')
            .getPublicUrl(fileName);

        const kardexUrl = publicUrlData.publicUrl;

        // 4. Seguridad: Hashing de la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 5. Insertar en la tabla 'usuarios' incluyendo la URL del Kardex
        const { data, error: dbError } = await supabase
            .from('usuarios')
            .insert([
                { 
                    nombre_completo: nombre, 
                    correo_institucional: correo, 
                    contrasena: passwordHash, 
                    rol: rol || 'vendedor',
                    codigo_estudiante: codigo,
                    kardex_url: kardexUrl,
                    estado: 'pendiente'
                }
            ])
            .select();

        if (dbError) throw dbError;

        res.status(201).json({ 
            message: "Usuario creado exitosamente y Kardex guardado en la nube", 
            user: data[0] 
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: error.message });
    }
};


exports.loginUsuario = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // 1. Validar que vengan los campos
        if (!correo || !password) {
            return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
        }

        // 2. Buscar al usuario en la base de datos de Supabase
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo_institucional', correo)
            .single(); // Trae un solo registro

        if (error || !usuario) {
            return res.status(401).json({ message: "El correo no está registrado" });
        }

        // 3. Comparar la contraseña escrita con el hash encriptado de la BD
        const match = await bcrypt.compare(password, usuario.contrasena);
        if (!match) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // 4. Generar el Token de sesión (JWT) para seguridad
        // Usamos una frase secreta temporal, idealmente vendría de tu .env
        const secret = process.env.JWT_SECRET || 'NEXOCODE_SECRET_KEY';
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol }, 
            secret, 
            { expiresIn: '24h' }
        );

        // 5. Responder al cliente con el formato exacto que React espera
        res.status(200).json({
            message: "Login exitoso",
            token,
            user: {
                id_usuario: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                correo_institucional: usuario.correo_institucional,
                rol: usuario.rol,          // 👈 ¡Aquí está el 'rol' que le faltaba a React!
                estado: usuario.estado || 'pendiente',
                codigo_estudiante: usuario.codigo_estudiante
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};