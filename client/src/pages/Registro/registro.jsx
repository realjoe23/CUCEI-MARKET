import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Registro.css';

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });
  const [kardexFile, setKardexFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setKardexFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validaciones básicas de interfaz
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!kardexFile) {
      alert("Por favor, sube tu Kardex en PDF para validar tu promedio");
      return;
    }

    setLoading(true);

    try {
      // 2. Usamos FormData para poder enviar el archivo PDF
      const dataToSend = new FormData();
      dataToSend.append('nombre', formData.nombre);
      dataToSend.append('codigo', formData.codigo);
      dataToSend.append('correo', formData.correo);
      dataToSend.append('password', formData.password);
      dataToSend.append('rol', 'vendedor');
      dataToSend.append('kardex', kardexFile); // El archivo PDF

      // 3. Petición al servidor (Capa de Aplicación)
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        body: dataToSend, 
        // Nota: No ponemos 'Content-Type', el navegador lo hace solo con FormData
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registro exitoso. Tu cuenta aparecerá en Supabase.");
        navigate('/login'); // Redirigir al login tras éxito
      } else {
        alert(`Error: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("Error de conexión. Asegúrate de que el servidor (puerto 3001) esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-wrapper">
      <div className="registro-card">
        <div className="registro-header">
          <h2>CUCEI Market</h2>
          <p>Registro de Nuevo Vendedor</p>
        </div>

        <form onSubmit={handleSubmit} className="registro-form">
          <div className="input-group">
            <label>NOMBRE COMPLETO</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleInputChange} 
              placeholder="Ej. Juan Pérez"
              required 
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>CÓDIGO</label>
              <input 
                type="text" 
                name="codigo" 
                value={formData.codigo} 
                onChange={handleInputChange} 
                placeholder="220XXXXXX"
                required 
              />
            </div>
            <div className="input-group">
              <label>CORREO INSTITUCIONAL</label>
              <input 
                type="email" 
                name="correo" 
                value={formData.correo} 
                onChange={handleInputChange} 
                placeholder="usuario@alumnos.udg.mx"
                required 
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>CONTRASEÑA</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label>CONFIRMAR CONTRASEÑA</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>

          <div className="file-upload-group">
            <label>KARDEX CERTIFICADO (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              required 
            />
            {kardexFile && <p className="file-name">Archivo: {kardexFile.name}</p>}
          </div>

          <div className="form-actions">
            <Link to="/login" className="btn-back">← Volver al Login</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Finalizar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;