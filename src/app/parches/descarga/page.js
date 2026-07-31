"use client";

import { useState } from 'react';
import '../parches.css';

export default function DescargaFramework() {
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const rawPromptBase = `"{{PROMPT_BASE_EN_INGLES}}, Unreal Engine 5 style, highly detailed, realistic textures, no text, no letters, no watermark."`;

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '40px 20px',
      fontFamily: 'var(--font-display)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
      }}>
        {/* Floating Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          padding: '15px 30px',
          borderRadius: '24px',
          position: 'sticky',
          top: '20px',
          zIndex: 100,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          marginBottom: '40px',
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '950', margin: 0, color: '#fff' }}>Framework Estándar</h1>
            <p style={{ fontSize: '11px', color: 'var(--neon-emerald)', margin: 0, fontFamily: 'var(--font-mono)' }}>READY TO EXPORT</p>
          </div>
          
          <a 
            href="/framework_estandar.md"
            download="Framework_Estandar_Reels_TikTok.md"
            className="parches-form-submit-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: '900',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--neon-emerald), #059669)',
              color: '#fff',
              boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)',
              margin: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            <span>Descargar archivo .md</span>
          </a>
        </div>

        {/* Beautiful document page rendering */}
        <div style={{
          background: 'rgba(15, 15, 25, 0.4)',
          border: '1px solid var(--glass-border)',
          borderRadius: '32px',
          padding: '50px 40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}>
          {/* Document Header */}
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '30px', marginBottom: '30px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)', marginBottom: '15px', display: 'inline-block' }}>📖 FRAMEWORK VIRAL</span>
            <h1 style={{ fontSize: '38px', fontWeight: '950', color: '#fff', margin: '0 0 10px', lineHeight: '1.2' }}>Framework Estándar: Creación de Guiones</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Este es un framework parametrizado diseñado para ser duplicado y adaptado a cualquier nicho, cuenta o formato de video corto. Utiliza variables entre llaves dobles <code style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{"{{VARIABLE}}"}</code> para que cualquier creador de contenido pueda estandarizar sus propios formatos.
            </p>
          </div>

          {/* Section 1 */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--neon-purple)' }}>01 /</span> Concepto y Formato
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NOMBRE DEL FORMATO</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{"{{NOMBRE_DEL_FORMATO}}"}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ej: Súper Alimentos para, Finanzas en 30s...</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>OBJETIVO DE MARKETING</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{"{{OBJETIVO_DE_MARKETING}}"}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ej: Autoridad, educación, conversión...</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NICHO / AUDIENCIA</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{"{{NICHO_Y_AUDIENCIA}}"}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ej: Nutrición saludable, skincare, fintech...</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TONO DE COMUNICACIÓN</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{"{{TONO}}"}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ej: Divertido, informal, serio, inspirador...</div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--neon-purple)' }}>02 /</span> Estilo Visual e Identidad (IA)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ESTILO VISUAL BASE</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{"{{ESTILO_VISUAL}}"}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SUJETO O PERSONAJE PRINCIPAL</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{"{{PERSONAJE_O_SUJETO}}"}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PROMPT IA GENERAL DE IMAGEN</div>
                  <button 
                    onClick={() => handleCopy(rawPromptBase, "prompt")} 
                    style={{ background: 'none', border: 'none', color: copiedText === "prompt" ? 'var(--neon-emerald)' : 'var(--neon-cyan)', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    {copiedText === "prompt" ? "¡Copiado! ✓" : "Copiar Prompt 📋"}
                  </button>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--neon-cyan)', lineHeight: '1.4' }}>
                  {rawPromptBase}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--neon-purple)' }}>03 /</span> Estructura de Escenas (Guion)
            </h3>
            
            {/* Escena 0: Hook */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>ESCENA 0: HOOK (GANCHO - 1 a 3s)</div>
                <span style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--neon-cyan)', fontSize: '11px', padding: '3px 8px', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>RETENCIÓN</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>🎥 <strong>Concepto Visual:</strong> {"{{DESCRIPCION_VISUAL_DEL_GANCHO}}"}</div>
                <div>🗣️ <strong>Locución (Voz en Off):</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>"{"{{PREGUNTA_O_AFIRMACION_SHOCKEANTE}}"}"</span></div>
                <div>🎵 <strong>Audio / ASMR:</strong> {"{{EFECTOS_SONIDO}}"}</div>
                <div>🎬 <strong>Control de Video:</strong> {"{{INSTRUCCIONES_DE_EDICION}}"}</div>
              </div>
            </div>

            {/* Escena 1 to N: Cuerpo */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--neon-emerald)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>ESCENA 1 A N: EL CUERPO (PUNTOS DE VALOR)</div>
                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--neon-emerald)', fontSize: '11px', padding: '3px 8px', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>EDUCACIÓN</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>🎥 <strong>Concepto Visual:</strong> {"{{DESCRIPCION_INTERACCION}}"}</div>
                <div>🗣️ <strong>Locución (Voz en Off):</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>"{"{{EXPLICACION_CORTA_DEL_VALOR_X}}"}"</span></div>
                <div>🎵 <strong>Audio / ASMR:</strong> {"{{EFECTOS_SONIDO}}"}</div>
                <div>🎬 <strong>Control de Video:</strong> {"{{INSTRUCCIONES_DE_EDICION}}"}</div>
              </div>
            </div>

            {/* Escena Final: Outro / CTA */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--neon-purple)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>ESCENA FINAL: OUTRO / CTA (CONVERSIÓN)</div>
                <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--neon-purple)', fontSize: '11px', padding: '3px 8px', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>ACCIONAR</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>🎥 <strong>Concepto Visual:</strong> {"{{CARRUSEL_O_CIERRE_VISUAL}}"}</div>
                <div>🗣️ <strong>Locución (CTA):</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>"{"{{LLAMADO_A_LA_ACCION_EXPLICITO}}"}"</span></div>
                <div>🎵 <strong>Audio / ASMR:</strong> {"{{EFECTOS_SONIDO}}"}</div>
              </div>
            </div>
          </div>

          {/* Section 4: Example */}
          <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '30px', borderRadius: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--neon-emerald)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 Ejemplo de Adaptación (Skincare)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 15px' }}>
              Ejemplo de cómo un usuario del nicho skincare completaría las variables del framework para crear su video:
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <div>• <strong>Formato:</strong> 3 Ingredientes Clave contra el Acné</div>
              <div>• <strong>Estilo Visual:</strong> Render 3D Pixar (Un poro de la piel con carita)</div>
              <div>• <strong>Locución Hook:</strong> "¿Cansada de que los granitos aparezcan en el peor momento? Tu piel te está pidiendo estos 3 ingredientes."</div>
              <div>• <strong>Locución Cuerpo:</strong> "1. Ácido Salicílico: Limpia el poro desde adentro y reduce la inflamación."</div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Parche de IA #5 — Medellín 2026 // Alejandro Ruiz
          </p>
        </div>
      </div>
    </main>
  );
}
