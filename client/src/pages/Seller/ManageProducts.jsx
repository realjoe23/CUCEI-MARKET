// ============================================================
// src/pages/Seller/ManageProducts.jsx
// CRUD completo del catálogo de productos.
// Fusionado: UI original + Desconexión de Firebase + Simulación CRUD
// ============================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import Modal       from '../../components/Modal/Modal';
import './Seller.css';
// import './ManageProducts.css'; // Asegúrate de tener este CSS

const EMPTY_FORM = { name: '', price: '', description: '', available: true };

export default function ManageProducts() {
  const { user } = useAuth();

  const [storeId, setStoreId]         = useState(null);
  const [storeActive, setStoreActive] = useState(false);
  const [allStores, setAllStores]     = useState([]);
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [storeError, setStoreError]   = useState('');

  // Modal agregar/editar
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState('');

  // Modal eliminar
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Cargar puesto y productos (Simulado) ──────────────────
  useEffect(() => {
    if (!user?.id_usuario) return;
    const cargarDatos = async () => {
      try {
        console.log('Buscando puestos para vendedor_id:', user.id_usuario);
        const storeRes = await fetch(`http://localhost:3001/api/stores/vendedor/${user.id_usuario}`);
        const storeJson = await storeRes.json();
        if (!storeRes.ok) {
          setStoreError(storeJson.error || 'No se encontró tu puesto');
          setLoading(false);
          return;
        }
        // storeJson ahora es un array de todos los puestos del vendedor
        setAllStores(storeJson);
        const primero = storeJson[0];
        setStoreId(primero.id_puesto);
        setStoreActive(primero.estado === 'activo');
        const prodRes = await fetch(`http://localhost:3001/api/stores/${primero.id_puesto}/products`);
        const prods = await prodRes.json();
        setProducts(prods.map(p => ({
          id: p.id_producto, name: p.nombre, price: p.precio,
          description: p.descripcion, available: p.disponible,
          imageUrl: p.imagen_url || null,
        })));
      } catch (err) {
        console.error('Error cargando datos:', err);
        setStoreError('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [user]);

  const cambiarPuesto = async (idPuesto) => {
    const store = allStores.find(s => s.id_puesto === parseInt(idPuesto));
    if (!store) return;
    setStoreId(store.id_puesto);
    setStoreActive(store.estado === 'activo');
    setLoading(true);
    const prodRes = await fetch(`http://localhost:3001/api/stores/${store.id_puesto}/products`);
    const prods = await prodRes.json();
    setProducts(prods.map(p => ({
      id: p.id_producto, name: p.nombre, price: p.precio,
      description: p.descripcion, available: p.disponible,
      imageUrl: p.imagen_url || null,
    })));
    setLoading(false);
  };

  // ── Abrir modal ───────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditTarget(product);
    setForm({
      name:        product.name,
      price:       product.price,
      description: product.description || '',
      available:   product.available !== false,
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  // ── Guardar (crear o editar) Simulado ──────────────────────
  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) {
      setFormError('Ingresa un precio válido.'); return;
    }
    setSaving(true);
    try {
      let response;
      if (editTarget) {
        const fd = new FormData();
        fd.append('nombre', form.name.trim());
        fd.append('precio', Number(form.price));
        fd.append('descripcion', form.description.trim());
        fd.append('disponible', form.available);
        if (imageFile) fd.append('imagen', imageFile);
        response = await fetch(`http://localhost:3001/api/products/${editTarget.id}`, {
          method: 'PUT',
          body: fd,
        });
      } else {
        const fd = new FormData();
        fd.append('id_puesto', storeId);
        fd.append('nombre', form.name.trim());
        fd.append('precio', Number(form.price));
        fd.append('descripcion', form.description.trim());
        fd.append('disponible', form.available);
        if (imageFile) fd.append('imagen', imageFile);
        response = await fetch('http://localhost:3001/api/products', {
          method: 'POST',
          body: fd,
        });
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al guardar');
      const mapped = {
        id: result.id_producto,
        name: result.nombre,
        price: result.precio,
        description: result.descripcion,
        available: result.disponible,
        imageUrl: result.imagen_url || null,
      };
      if (editTarget) {
        setProducts(prev => prev.map(p => p.id === editTarget.id ? mapped : p));
      } else {
        setProducts(prev => [...prev, mapped]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar (Simulado) ───────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  if (loading) return <div className="page-loading">Cargando productos…</div>;

  if (!storeId) return (
    <div className="seller-page">
      <div className="empty-state">
        <span className="empty-icon">🏪</span>
        <p>{storeError || 'Primero registra tu puesto'}</p>
        <small>Ve a "Registrar puesto" desde tu panel principal.</small>
      </div>
    </div>
  );

  return (
    <div className="seller-page" style={{ maxWidth: '1100px' }}>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Mis productos</h1>
          <p>{products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {allStores.length > 1 && (
            <select
              value={storeId || ''}
              onChange={e => cambiarPuesto(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--blue-border)', fontSize: '0.9rem' }}
            >
              {allStores.map(s => (
                <option key={s.id_puesto} value={s.id_puesto}>
                  {s.nombre} {s.estado !== 'activo' ? '(inactivo)' : ''}
                </option>
              ))}
            </select>
          )}
          <button
            className="btn-primary"
            onClick={openAdd}
            disabled={!storeActive}
            title={!storeActive ? 'Tu puesto está inactivo' : 'Agregar nuevo producto'}
          >
            + Agregar producto
          </button>
        </div>
      </div>

      {!storeActive && (
        <div className="inactive-notice">
          ⚠️ Tu puesto está <strong>inactivo</strong>. Los botones de edición están deshabilitados hasta que sea activado por el administrador.
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <p>No tienes productos registrados</p>
          <small>Agrega tu primer producto con el botón de arriba.</small>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              editable={storeActive}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modal: Agregar / Editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar producto' : 'Agregar producto'} onConfirm={handleSave} confirmLabel={saving ? 'Guardando…' : editTarget ? 'Guardar cambios' : 'Agregar'}>
        <div className="product-form">
          <div className="input-group">
            <label>Nombre del producto *</label>
            <input type="text" placeholder="Ej. Tacos de canasta" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Precio ($) *</label>
            <input type="number" min="0" step="0.50" placeholder="0.00" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Descripción breve</label>
            <textarea rows={2} placeholder="Ingredientes, tamaño, sabores…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Foto del producto</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="product-img-preview"><img src={imagePreview} alt="Vista previa" /></div>
            )}
          </div>
          <label className="availability-toggle">
            <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
            <span>Disponible para la venta</span>
          </label>
          {formError && <p className="msg-error" role="alert">{formError}</p>}
        </div>
      </Modal>

      {/* Modal: Confirmar eliminación */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Eliminar producto" onConfirm={handleDelete} confirmLabel={deleting ? 'Eliminando…' : 'Sí, eliminar'} confirmDanger>
        <p>¿Seguro que quieres eliminar <strong>{deleteTarget?.name}</strong>? Esta acción <strong>no se puede deshacer</strong>.</p>
      </Modal>
    </div>
  );
}