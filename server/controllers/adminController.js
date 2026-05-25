const supabase = require('../config/supabaseClient');

// Obtener todos los usuarios de la base de datos
exports.obtenerUsuarios = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*');

        if (error) {
            console.error("❌ ERROR DE SUPABASE:", error); // Esto se verá en tu terminal negra
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    } catch (err) {
        console.error("❌ ERROR DEL SERVIDOR:", err); // Esto también
        res.status(500).json({ error: err.message });
    }
};

// Cambiar estado de usuario (Aprobar/Rechazar/Suspender)
exports.actualizarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const { data, error } = await supabase
            .from('usuarios')
            .update({ estado: status, razon_rechazo: reason })
            .eq('id_usuario', id);

        if (error) throw error;
        res.json({ message: "Estado actualizado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};