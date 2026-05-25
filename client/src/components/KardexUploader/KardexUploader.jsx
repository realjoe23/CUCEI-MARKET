// ============================================================
// src/components/KardexUploader/KardexUploader.jsx
// Componente para subir el Kardex (PDF).
// Fusionado: UI original + Simulación de subida (Sin Firebase)
// ============================================================

import React, { useState, useRef } from 'react';
import './KardexUploader.css';

const MAX_SIZE_MB = 5;

export default function KardexUploader({ userId, onUploadComplete }) {
  const [file, setFile]           = useState(null);
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');
  const [dragging, setDragging]   = useState(false);
  const inputRef                  = useRef(null);

  /* ── Validación del archivo ─────────────────────────────── */
  const validateFile = (f) => {
    if (!f) return 'No se seleccionó ningún archivo.';
    if (f.type !== 'application/pdf') return 'Solo se aceptan archivos en formato PDF.';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `El archivo supera el límite de ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const handleFileSelect = (f) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError('');
    setDone(false);
    setProgress(0);
    setFile(f);
  };

  /* ── Drag & Drop ────────────────────────────────────────── */
  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = ()  => setDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  /* ── Subida Simulada ────────────────────────────────────── */
  const handleUpload = () => {
    if (!file || uploading) return;

    setUploading(true);
    setError('');

    // Simulamos el progreso de subida
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploading(false);
        setDone(true);
        // Devolvemos una URL falsa para que el formulario principal no falle
        onUploadComplete && onUploadComplete('http://rutafalsa.com/kardex.pdf');
      }
    }, 300);
  };

  /* ── Reiniciar ──────────────────────────────────────────── */
  const handleReset = () => {
    setFile(null);
    setProgress(0);
    setDone(false);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="kardex-uploader">
      {!done && (
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
        >
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => handleFileSelect(e.target.files[0])} hidden />
          {file ? (
            <>
              <span className="dz-icon">📄</span>
              <span className="dz-filename">{file.name}</span>
              <span className="dz-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </>
          ) : (
            <>
              <span className="dz-icon">⬆️</span>
              <span className="dz-label">Arrastra tu Kardex aquí o <u>haz clic</u></span>
              <span className="dz-hint">Solo PDF · máx. {MAX_SIZE_MB} MB</span>
            </>
          )}
        </div>
      )}

      {done && (
        <div className="upload-success">
          <span>✅</span>
          <span>Kardex listo (Simulado)</span>
          <button type="button" className="btn-reset-upload" onClick={handleReset}>Cambiar</button>
        </div>
      )}

      {error && <p className="upload-error">{error}</p>}

      {uploading && (
        <div className="progress-wrap">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <span className="progress-label">{progress}%</span>
        </div>
      )}

      {file && !uploading && !done && (
        <button type="button" className="btn-upload" onClick={handleUpload}>Adjuntar Kardex</button>
      )}
    </div>
  );
}