"use client";

import { useState } from 'react';
import '../parches.css';

export default function RegistroParches() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/parches-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormSubmitted(true);
      }
    } catch (err) {
      console.error('Error al registrar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-display)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {!formSubmitted ? (
          <div className="parches-form-card" style={{ padding: '40px 30px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)', marginBottom: '15px', display: 'inline-block' }}>// PARCHE DE IA #5</span>
              <h1 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', margin: '10px 0 8px', fontFamily: 'var(--font-display)' }}>Descarga el Framework Viral</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Regístrate y recibe el framework estándar para crear guiones de Reels y TikTok con IA.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="parches-form-group">
                <label className="parches-form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Tu nombre" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="parches-form-input"
                />
              </div>
              
              <div className="parches-form-group">
                <label className="parches-form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  placeholder="tu@correo.com" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="parches-form-input"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="parches-form-submit-btn"
                style={{ fontSize: '14px', fontWeight: '900', padding: '18px', width: '100%', marginTop: '10px' }}
              >
                {loading ? 'Guardando...' : '🎁 Obtener Framework Gratis'}
              </button>
            </form>
          </div>
        ) : (
          <div className="parches-form-card" style={{ padding: '40px 30px', textAlign: 'center' }}>
            {/* Success State */}
            <div style={{ marginBottom: '20px' }}>
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--neon-emerald)', margin: '0 auto 15px', display: 'block' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <h2 style={{ fontSize: '26px', fontWeight: '950', color: '#fff', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>¡Registro Exitoso!</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 25px' }}>
                ¡Gracias, <strong style={{ color: 'var(--neon-emerald)' }}>{formData.name}</strong>! Tu framework está listo para descargar.
              </p>
            </div>

            {/* Download Button */}
            <a 
              href="/framework_estandar.md"
              download="Framework_Estandar_Reels_TikTok.md"
              className="parches-form-submit-btn"
              style={{ 
                fontSize: '16px', fontWeight: '900', padding: '20px', 
                width: '100%', display: 'block', textDecoration: 'none', textAlign: 'center',
                background: 'linear-gradient(135deg, var(--neon-emerald), #059669)',
                borderRadius: '16px', color: '#fff', border: 'none',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
              }}
            >
              📥 Descargar Framework (.md)
            </a>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '18px', fontFamily: 'var(--font-mono)' }}>
              Tip: Abre el archivo .md en Notion, Obsidian o cualquier editor de Markdown para personalizar tu framework.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Parche de IA #5 — Medellín 2026
          </p>
        </div>
      </div>
    </main>
  );
}
