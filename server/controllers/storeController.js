// ============================================================
// server/controllers/storeController.js
// ============================================================

const supabase = require('../config/supabaseClient');

// ── Obtener todos los puestos activos (Home pública) ────────────
exports.obtenerPuestosActivos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('puestos')
            .select('*')
            .eq('estado', 'activo')
            .order('nombre', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener todos los puestos (Admin) ──────────────────────────
exports.obtenerTodosPuestos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('puestos')
            .select('*, usuarios(nombre_completo, correo_institucional)')
            .order('nombre', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Aprobar / Rechazar puesto (Admin) ───────────────────────
exports.actualizarEstadoPuesto = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const { error } = await supabase
            .from('puestos')
            .update({ estado })
            .eq('id_puesto', parseInt(id));
        if (error) throw error;
        res.json({ message: 'Estado del puesto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.registrarPuesto = async (req, res) => {
    try {
        const { nombre, categoria, ubicacion, horario, descripcion, vendedor_id } = req.body;

        // 1. Validación básica
        if (!nombre || !categoria || !ubicacion || !vendedor_id) {
            return res.status(400).json({ 
                error: "Faltan datos obligatorios (nombre, categoría, ubicación o ID de vendedor)" 
            });
        }

        // 2. Conversión segura del ID a entero
        const vId = parseInt(vendedor_id);
        if (isNaN(vId)) {
            return res.status(400).json({ error: "El ID del vendedor debe ser un número válido" });
        }

        // 3. Inserción en Supabase
        const { data, error } = await supabase
            .from('puestos')
            .insert([{ 
                nombre, 
                categoria, 
                ubicacion, 
                horario, 
                descripcion, 
                vendedor_id: vId, 
                estado: 'inactivo' 
            }]);

        if (error) {
            console.error("Error de Supabase:", error);
            throw error;
        }

        res.status(201).json({ message: "Puesto registrado con éxito", data });

    } catch (error) {
        console.error("Error al registrar puesto:", error);
        res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
};

// ── Obtener puesto por vendedor ───────────────────────────────
exports.obtenerPuestoVendedor = async (req, res) => {
    try {
        const { vendedor_id } = req.params;
        const { data, error } = await supabase
            .from('puestos')
            .select('*')
            .eq('vendedor_id', parseInt(vendedor_id))
            .order('id_puesto', { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'No tienes un puesto registrado' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener puesto por ID ─────────────────────────────────────
exports.obtenerPuesto = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('puestos')
            .select('*')
            .eq('id_puesto', parseInt(id))
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Puesto no encontrado' });
    }
};

// ── Productos ─────────────────────────────────────────────────
exports.obtenerProductos = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id_puesto', parseInt(id))
            .order('created_at', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.agregarProducto = async (req, res) => {
    try {
        const { id_puesto, nombre, precio, descripcion, disponible } = req.body;

        // Subir imagen si viene
        let imagen_url = null;
        if (req.file) {
            const fileName = `productos/${id_puesto}-${Date.now()}-${req.file.originalname}`;
            const { error: storageError } = await supabase.storage
                .from('productos')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
            if (storageError) throw new Error(`Error al subir imagen: ${storageError.message}`);
            const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName);
            imagen_url = urlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('productos')
            .insert([{ id_puesto: parseInt(id_puesto), nombre, precio: parseFloat(precio), descripcion, disponible, imagen_url }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, disponible } = req.body;

        // Subir imagen nueva si viene
        let updateData = { nombre, precio: parseFloat(precio), descripcion, disponible };
        if (req.file) {
            const fileName = `productos/${id}-${Date.now()}-${req.file.originalname}`;
            const { error: storageError } = await supabase.storage
                .from('productos')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
            if (storageError) throw new Error(`Error al subir imagen: ${storageError.message}`);
            const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName);
            updateData.imagen_url = urlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('productos')
            .update(updateData)
            .eq('id_producto', parseInt(id))
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id_producto', parseInt(id));
        if (error) throw error;
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Reseñas ───────────────────────────────────────────────────
exports.obtenerResenas = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('reseñas')
            .select('*, usuarios(nombre_completo)')
            .eq('id_puesto', parseInt(id))
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.agregarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario, calificacion, comentario } = req.body;
        const { data, error } = await supabase
            .from('reseñas')
            .insert([{ id_puesto: parseInt(id), id_usuario: parseInt(id_usuario), calificacion: parseInt(calificacion), comentario }])
            .select('*, usuarios(nombre_completo)');
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};