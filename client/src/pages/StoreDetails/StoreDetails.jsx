// ============================================================
// src/pages/StoreDetails/StoreDetails.jsx
// Vista a fondo de un puesto: productos y reseñas (RF08, RF11)
// Fusionado: UI original + Desconexión de Firebase + Mock Data
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import ProductCard from '../../components/ProductCard/ProductCard';
import './StoreDetails.css';

export default function StoreDetails() {
  const { id }            = useParams();
  const { user }          = useAuth();
  const [store,   setStore]   = useState(null);
  const [products,setProducts]= useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del formulario de reseña
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [reviewMsg,  setReviewMsg]    = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [storeRes, prodRes, revRes] = await Promise.all([
          fetch(`${API_URL}/api/stores/${id}`),
          fetch(`${API_URL}/api/stores/${id}/products`),
          fetch(`${API_URL}/api/stores/${id}/reviews`),
        ]);
        const storeData = await storeRes.json();
        const prodData  = await prodRes.json();
        const revData   = await revRes.json();
        setStore({
          id:          storeData.id_puesto,
          name:        storeData.nombre,
          location:    storeData.ubicacion,
          schedule:    storeData.horario,
          description: storeData.descripcion,
          category:    storeData.categoria,
        });
        setProducts(prodData.map(p => ({
          id: p.id_producto, name: p.nombre, price: p.precio,
          description: p.descripcion, available: p.disponible,
        })));
        setReviews(revData.map(r => ({
          id: r.id_resena, rating: r.calificacion, comment: r.comentario,
          authorName: r.usuarios?.nombre_completo || 'Usuario', createdAt: r.created_at,
        })));
      } catch (err) {
        console.error('Error cargando puesto:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const handleReviewSubmit = async () => {
    if (!user)   { setReviewMsg('Inicia sesión para dejar una reseña.'); return; }
    if (!rating) { setReviewMsg('Selecciona una calificación.'); return; }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/stores/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: user.id_usuario, calificacion: rating, comentario: comment.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al publicar');
      setReviews(prev => [{
        id: result.id_resena,
        rating: result.calificacion,
        comment: result.comentario,
        authorName: result.usuarios?.nombre_completo || user.nombre_completo || 'Usuario',
        createdAt: result.created_at,
      }, ...prev]);
      setRating(0);
      setComment('');
      setReviewMsg('¡Reseña publicada!');
      setTimeout(() => setReviewMsg(''), 3000);
    } catch (err) {
      setReviewMsg(err.message || 'Error al publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Cargando información del puesto…</div>;
  if (!store)  return (
    <div className="page-loading">
      <p>Puesto no encontrado. <Link to="/">Volver al catálogo</Link></p>
    </div>
  );

  return (
    <div className="store-details-page">
      <div className="store-detail-header">
        <div className="store-detail-info">
          <Link to="/" className="back-link">← Catálogo</Link>
          <h1>{store.name}</h1>
          <div className="store-meta-row">
            <span>📍 {store.location}</span>
            {store.schedule && <span>🕐 {store.schedule}</span>}
            {avgRating && <span>⭐ {avgRating} ({reviews.length} reseñas)</span>}
          </div>
          {store.description && <p className="store-description">{store.description}</p>}
        </div>
      </div>

      {products.length > 0 && (
        <section className="store-section">
          <h2>Menú / Catálogo</h2>
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="store-section">
        <h2>Reseñas</h2>
        <div className="review-form">
          <p className="review-form-title">Deja tu opinión</p>
          <div className="stars-input">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                className={`star-btn ${n <= (hoveredStar || rating) ? 'active' : ''}`}
                onMouseEnter={() => setHoveredStar(n)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(n)}
              >★</button>
            ))}
          </div>
          <textarea className="review-textarea" placeholder="Escribe tu comentario… (opcional)" value={comment} onChange={e => setComment(e.target.value)} rows={3} />
          {reviewMsg && <p className="review-msg">{reviewMsg}</p>}
          <button className="btn-submit-review" onClick={handleReviewSubmit} disabled={submitting}>
            {submitting ? 'Publicando…' : 'Publicar reseña'}
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="no-reviews">Sé el primero en dejar una reseña.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-top">
                  <div className="review-author-avatar">{(r.authorName || '?')[0].toUpperCase()}</div>
                  <div>
                    <p className="review-author">{r.authorName}</p>
                    <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })}</span>
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}