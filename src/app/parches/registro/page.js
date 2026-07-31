"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../parches.css';

export default function RegistroParches() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        // Redirect directly to the beautiful download & preview page
        router.push('/parches/descarga');
      } else {
        alert('Error al guardar el registro en el servidor');
      }
    } catch (err) {
      console.error('Error al registrar:', err);
      alert('Error de red al registrar');
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
