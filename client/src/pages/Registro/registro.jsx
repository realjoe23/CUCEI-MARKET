import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './registro.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });
  const [kardexFile, setKardexFile] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setKardexFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log("Datos de registro:", formData, "Archivo:", kardexFile?.name);
    // TODO: Enviar datos y archivo PDF al backend
  };

  return (
    <div className="registro-wrapper">
      <div className="registro-card">
        <div className="registro-header">
          <h2>CUCEI Market</h2>
          <p>Crear cuenta de vendedor</p>
        </div>

        <form onSubmit={handleSubmit} className="registro-form">
          <div className="input-group">
            <label>NOMBRE COMPLETO</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>CÓDIGO DE ESTUDIANTE</label>
              <input type="text" name="codigo" value={formData.codigo} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>CORREO INSTITUCIONAL</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>CONTRASEÑA</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>CONFIRMAR CONTRASEÑA</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="file-upload-group">
            <label>SUBIR KARDEX CERTIFICADO (PDF max 5MB)</label>
            <input type="file" accept=".pdf" onChange={handleFileChange} required />
          </div>

          <div className="form-actions">
            <Link to="/login" className="btn-back">← Atrás</Link>
            <button type="submit" className="btn-primary">Crear cuenta</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;