"use client";

import '../parches.css';

export default function DescargaFramework() {
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
        textAlign: 'center',
      }}>
        {/* Minimalist Visual Card */}
        <div className="parches-form-card" style={{ 
          padding: '50px 30px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 80px rgba(16, 185, 129, 0.1)',
        }}>
          {/* Success Icon */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid var(--neon-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
              margin: '0 auto',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon-emerald)' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>

          <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)', marginBottom: '15px' }}>
            // PROCESO COMPLETADO
          </span>
          
          <h1 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', margin: '0 0 10px', lineHeight: '1.2' }}>
            ¡Gracias por Asistir!
          </h1>
          
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 35px', maxWidth: '360px' }}>
            Haz clic en el botón de abajo para descargar tu copia del framework listo para ser usado con cualquier IA.
          </p>

          {/* Core Download Button */}
          <a 
            href="/framework_estandar.md"
            download="Framework_Estandar_Reels_TikTok.md"
            className="parches-form-submit-btn"
            style={{ 
              fontSize: '16px', 
              fontWeight: '900', 
              padding: '20px 40px', 
              width: '100%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              textDecoration: 'none', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, var(--neon-emerald), #059669)',
              borderRadius: '16px', 
              color: '#fff', 
              border: 'none',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Descargar Framework (.md)</span>
          </a>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px', fontFamily: 'var(--font-mono)' }}>
            Formato compatible con Claude, ChatGPT y Antigravity
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Parche de IA #5 — Medellín 2026
          </p>
        </div>
      </div>
    </main>
  );
}
