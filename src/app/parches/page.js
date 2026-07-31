"use client";

import { useState, useEffect } from 'react';
import './parches.css';

const SLIDES_COUNT = 6;

export default function ParchesPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [hotSeatIndex, setHotSeatIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', instagram: '' });
  const [leadsCount, setLeadsCount] = useState(0);

  // Hot Seat Questions/Debates
  const hotSeatQuestions = [
    {
      title: "🎯 Tu Propuesta de Valor",
      question: "¿Qué vendes exactamente y qué problema real resuelves?",
      tip: "Define el dolor que quitas, no las características de tu servicio."
    },
    {
      title: "🙋‍♀️ Tu Cliente Ideal",
      question: "¿A quién le estás hablando? Describe a tu target en una sola frase.",
      tip: "Ejemplo: Mujeres de 35-45 años que quieren entrenar en casa pero no tienen tiempo."
    },
    {
      title: "🛑 La Barrera Mental",
      question: "¿Cuál es tu mayor obstáculo hoy para empezar a subir videos de manera constante?",
      tip: "Identifica si es falta de ideas, vergüenza, edición o perfeccionismo."
    },
    {
      title: "🔥 La Pasión Infinita",
      question: "¿Qué tema o nicho te apasiona tanto que hablarías gratis de él durante los próximos 3 años?",
      tip: "Sin pasión real, la consistencia es imposible y el algoritmo te aburrirá."
    },
    {
      title: "💰 La Oferta de $500 USD",
      question: "Si tuvieras que vender un único producto de alto valor apoyado de IA, ¿qué ofrecerías?",
      tip: "Busca empaquetar tu conocimiento en una oferta irresistible e individual."
    }
  ];

  // Navigate slides
  const nextSlide = () => {
    if (currentSlide < SLIDES_COUNT - 1) {
      setDirection('forward');
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection('backward');
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return; // Ignore when typing in form
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  // Spin the Hot Seat Roulette
  const spinHotSeat = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setHotSeatIndex(prev => (prev + 1) % hotSeatQuestions.length);
      count++;
      if (count > 10) {
        clearInterval(interval);
        // Select a random final index
        const finalIndex = Math.floor(Math.random() * hotSeatQuestions.length);
        setHotSeatIndex(finalIndex);
        setIsSpinning(false);
      }
    }, 120);
  };

  // Submit leads to local database API
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/parches-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setLeadsCount(result.count || 0);
        setFormSubmitted(true);
      } else {
        alert('Error al guardar el registro en el servidor');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Error de red al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="parches-presentation-body">
      {/* Background Animated Mesh */}
      <div className="parches-mesh-bg"></div>

      {/* Header / Navbar */}
      <header className="parches-header">
        <div className="parches-logo-container">
          <div className="parches-logo-box">S</div>
          <div>
            <h3 className="parches-logo-title">SANO Y PUNTO</h3>
            <p className="parches-logo-subtitle">PARCHE DE IA #5 // MEDELLÍN</p>
          </div>
        </div>
        <div className="parches-status-badge">
          <span className="parches-status-dot"></span>
          <span>STATUS: IN LIVE</span>
          <span style={{ color: 'var(--text-muted)' }}>//</span>
          <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>
            SLIDE {currentSlide + 1}/{SLIDES_COUNT}
          </span>
        </div>
      </header>

      {/* Main Slide Area */}
      <section className="parches-viewport">
        
        {/* SLIDE 1: PORTADA */}
        <div className={`parches-slide ${currentSlide === 0 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span className="parches-badge">Caso de Estudio Real</span>
            <h1 className="parches-title-main">
              Crecer una Marca <br className="hidden md:block"/>
              <span className="parches-gradient-span">con IA y Consistencia</span>
            </h1>
            <p className="parches-desc-main" style={{ maxWidth: '720px', margin: '0 auto 20px' }}>
              De la artesanía manual a la escala viral en redes sociales.
            </p>
            <div className="parches-profile-card" style={{ margin: '20px auto 0' }}>
              <div className="parches-profile-avatar">👨‍💻</div>
              <div style={{ textAlign: 'left' }}>
                <p className="parches-profile-name">Alejandro Ruiz</p>
                <p className="parches-profile-role">Fundador, Sano y Punto</p>
              </div>
            </div>
            <div style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              Presiona <span style={{ color: 'var(--neon-emerald)' }}>ESPACIO</span> o la tecla <span style={{ color: 'var(--neon-emerald)' }}>→</span> para avanzar
            </div>
          </div>
        </div>

        {/* SLIDE 2: AUTORIDAD / RESULTADOS */}
        <div className={`parches-slide ${currentSlide === 1 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>// 01. EL IMPACTO REAL</span>
            <h2 className="parches-slide-title">Caso de Estudio: Sano y Punto</h2>
            <div className="parches-grid-3">
              <div className="parches-metric-card">
                <div className="parches-metric-label">// Comunidad</div>
                <div className="parches-metric-value emerald">+18K</div>
                <p className="parches-metric-desc">Seguidores calificados y altamente activos ganados en redes sociales en los últimos 3 meses.</p>
              </div>
              <div className="parches-metric-card">
                <div className="parches-metric-label">// Alcance Orgánico</div>
                <div className="parches-metric-value purple">1.5M+</div>
                <p className="parches-metric-desc">Reproducciones en Reels/Shorts creados con IA sin invertir ni un centavo en pauta de anuncios.</p>
              </div>
              <div className="parches-metric-card">
                <div className="parches-metric-label">// Conversión en App</div>
                <div className="parches-metric-value cyan">+2.5K</div>
                <p className="parches-metric-desc">Descargas e inscritos reales que pasaron del video a registrarse en nuestra aplicación de nutrición.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: EL CIMIENTO (OFERTA, PASIÓN Y COMPETENCIA) */}
        <div className={`parches-slide ${currentSlide === 2 ? 'active' : ''}`}>
          <div className="parches-grid-2-layout animate-fade-in">
            <div>
              <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139,92,246,0.15)' }}>// 02. LA ESTRATEGIA INVISIBLE</span>
              <h2 className="parches-slide-title">El Cimiento Invisible:<br />Oferta, Pasión y Competencia</h2>
              <p className="parches-desc-main" style={{ fontSize: '15px', marginBottom: '24px', lineHeight: '1.4' }}>
                Antes de presionar el botón de grabar, debes construir una base sólida. La viralidad sin estructura es tráfico desperdiciado y aburrimiento asegurado.
              </p>
              
              <div className="parches-steps-container">
                <div className="parches-step-row">
                  <div className="parches-step-num">1</div>
                  <div>
                    <h4 className="parches-step-headline">Nicho + Producto + Pasión</h4>
                    <p className="parches-step-body">Debes elegir algo que te guste genuinamente. Crear contenido requiere constancia (puedes subir 50 posts sin resultados inmediatos). Sin pasión, abandonarás antes de tiempo.</p>
                  </div>
                </div>
                <div className="parches-step-row">
                  <div className="parches-step-num">2</div>
                  <div>
                    <h4 className="parches-step-headline">El Target es tu Brújula (Ej. Mujeres 35-45)</h4>
                    <p className="parches-step-body">Los frameworks de tus videos deben hablarle a sus dolores específicos (falta de tiempo, recetas rápidas). Audita que las métricas le estén llegando a ellos.</p>
                  </div>
                </div>
                <div className="parches-step-row">
                  <div className="parches-step-num">3</div>
                  <div>
                    <h4 className="parches-step-headline">Estudio de Competencia (Con y Sin IA)</h4>
                    <p className="parches-step-body">Investiga a quienes ya tienen tracción en tu nicho. Compara sus mejores videos y extrae ganchos o estructuras para testear, en lugar de improvisar al azar.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="parches-sidebar-checklist">
              <div className="parches-checklist-badge">CHECKLIST</div>
              <h3 className="parches-checklist-title">📋 El Diagnóstico Inicial</h3>
              <div className="parches-check-item">
                <span className="parches-check-label">¿Qué ofreces?</span>
                <span className="parches-check-value emerald">App Sano y Punto</span>
              </div>
              <div className="parches-check-item">
                <span className="parches-check-label">¿Te apasiona?</span>
                <span className="parches-check-value">Sí, Nutrición Práctica</span>
              </div>
              <div className="parches-check-item">
                <span className="parches-check-label">¿Quién es el Target?</span>
                <span className="parches-check-value">Mujeres 35-45 años</span>
              </div>
              <div className="parches-check-item">
                <span className="parches-check-label">¿Competidores?</span>
                <span className="parches-check-value purple">Mapeados y validados</span>
              </div>
              <div className="parches-check-item">
                <span className="parches-check-label">Regla de oro:</span>
                <span className="parches-check-value red text-red-400">Prueba antes de publicar</span>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 4: QUÉ ES UN FRAMEWORK / LOS 3 DE INDUSTRIAS */}
        <div className={`parches-slide ${currentSlide === 3 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6,182,212,0.15)' }}>// 03. EL MOTOR DE LA CONSTANCIA</span>
            <h2 className="parches-slide-title">¿Qué es un Framework?</h2>
            <p className="parches-desc-main" style={{ fontSize: '16px', marginBottom: '32px' }}>
              No improvises ideas nuevas cada día. Apaláncate en **2 o 3 frameworks testeados y probados** donde solo varías el contenido temático dentro de esa estructura fija.
            </p>
            
            <div className="parches-grid-3">
              {/* Industry 1 */}
              <div className="parches-framework-card emerald">
                <div className="parches-framework-num">01</div>
                <h3 className="parches-framework-title">Belleza y Estética</h3>
                <p className="parches-framework-subtitle">"El Ingrediente Héroe / El Proceso Visual"</p>
                <div className="parches-framework-preview-box">
                  <strong>Hook:</strong> "Si sufres de [problema], deja de usar..."<br/>
                  <strong>Cuerpo:</strong> Mostrar textura/antes-después y activo.<br/>
                  <strong>CTA:</strong> "Comenta [PIEL] para enviarte la rutina."
                </div>
              </div>

              {/* Industry 2 */}
              <div className="parches-framework-card purple">
                <div className="parches-framework-num">02</div>
                <h3 className="parches-framework-title">Moda y Ropa</h3>
                <p className="parches-framework-subtitle">"Duelo de Outfits / Corrección Rápida"</p>
                <div className="parches-framework-preview-box">
                  <strong>Hook:</strong> "No combines [prenda] así si vas a..."<br/>
                  <strong>Cuerpo:</strong> Visualización rápido Incorrecto vs Correcto.<br/>
                  <strong>CTA:</strong> "Comenta [ESTILO] y te paso los links."
                </div>
              </div>

              {/* Industry 3 */}
              <div className="parches-framework-card cyan">
                <div className="parches-framework-num">03</div>
                <h3 className="parches-framework-title">Servicios y Consultores</h3>
                <p className="parches-framework-subtitle">"El Rompe-Mitos / Solución al Dolor"</p>
                <div className="parches-framework-preview-box">
                  <strong>Hook:</strong> "La gran mentira que te dijeron sobre..."<br/>
                  <strong>Cuerpo:</strong> Hablar directo a cámara y dar 3 pasos reales.<br/>
                  <strong>CTA:</strong> "Comenta [GUIA] y te envío mi PDF."
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5: DINAMICA INTERACTIVA - EL CONSULTORIO */}
        <div className={`parches-slide ${currentSlide === 4 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139,92,246,0.15)' }}>// 04. INTERACCIÓN Y DEBATE</span>
            <h2 className="parches-slide-title" style={{ textAlign: 'center' }}>El Consultorio en Vivo</h2>
            <p className="parches-desc-main" style={{ fontSize: '15px', marginBottom: '24px', textAlign: 'center', maxWidth: '500px' }}>
              ¡Hablemos de tus proyectos! Gira la ruleta para proponer un tema de debate en grupo.
            </p>

            {/* Question Card Box */}
            <div className="parches-hotseat-card">
              <div className="parches-hotseat-tag">TARJETA DE DEBATE {hotSeatIndex + 1}</div>
              
              <div className={`parches-spin-transition ${isSpinning ? 'opacity-20 scale-95 blur-xs' : 'opacity-100 scale-100'}`} style={{ transition: 'all 0.12s ease-in-out' }}>
                <h3 className="parches-hotseat-title">
                  {hotSeatQuestions[hotSeatIndex].title}
                </h3>
                <p className="parches-hotseat-question">
                  "{hotSeatQuestions[hotSeatIndex].question}"
                </p>
                <div className="parches-hotseat-tip-box" style={{ margin: '0 auto' }}>
                  <strong style={{ color: 'var(--neon-purple)' }}>RECOMENDACIÓN: </strong> 
                  {hotSeatQuestions[hotSeatIndex].tip}
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <button 
              onClick={spinHotSeat}
              disabled={isSpinning}
              className="parches-neon-btn"
            >
              <span>{isSpinning ? 'Girando...' : 'Girar Pregunta 🎰'}</span>
            </button>
          </div>
        </div>

        {/* SLIDE 6: EL REGALO */}
        <div className={`parches-slide ${currentSlide === 5 ? 'active' : ''}`}>
          <div className="parches-grid-2-layout animate-fade-in">
            {/* Left Info Column */}
            <div style={{ textAlign: 'left' }}>
              <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>// 05. REGALO EXCLUSIVO</span>
              <h2 className="parches-slide-title" style={{ fontSize: '42px' }}>Obtén Mi Framework de Contenido</h2>
              <p className="parches-desc-main" style={{ fontSize: '15px', marginBottom: '24px', lineHeight: '1.4' }}>
                Regístrate para probar **Sano y Punto** hoy y te enviaré directamente a tu correo el framework de ChatGPT que utilizo para generar guiones y videos virales personalizados a tu nicho.
              </p>
              
              <div className="parches-steps-container" style={{ gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>✓</span>
                  <span>Estructuras de guiones probadas (Pixar Concept)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>✓</span>
                  <span>Prompts listos y estructurados para ChatGPT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>✓</span>
                  <span>Acceso anticipado a la App Sano y Punto</span>
                </div>
              </div>
              
              <div style={{ marginTop: '28px', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-purple)' }}></span>
                <span>Primero manual, luego automatizar. Recursividad al poder.</span>
              </div>
            </div>

            {/* Right Form / QR Column */}
            <div className="parches-form-card">
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <h3 className="parches-form-title">Regístrate y Descarga</h3>
                  <p className="parches-form-desc">Completa tus datos para guardarte en la lista y enviarte la plantilla.</p>
                  
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

                  <div className="parches-form-group">
                    <label className="parches-form-label">Usuario Instagram (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="@usuario" 
                      value={formData.instagram}
                      onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                      className="parches-form-input"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="parches-form-submit-btn"
                  >
                    {loading ? 'Guardando...' : 'Registrar y Recibir Regalo'}
                  </button>
                </form>
              ) : (
                <div className="parches-success-container">
                  <div className="parches-success-icon">🎉</div>
                  <h3 className="parches-success-title">¡Inscripción Exitosa!</h3>
                  <p className="parches-success-desc">
                    ¡Gracias, {formData.name}! Tus datos se guardaron localmente. Te hemos enviado el Framework a **{formData.email}**.
                  </p>
                  
                  <div className="parches-qr-wrapper" style={{ margin: '0 auto' }}>
                    <div className="parches-qr-square">
                      <div className="parches-qr-corner-top">
                        <div className="parches-qr-eye"></div>
                        <div className="parches-qr-eye"></div>
                      </div>
                      <div className="parches-qr-center-label">SANO</div>
                      <div className="parches-qr-corner-bottom">
                        <div className="parches-qr-eye"></div>
                        <div className="parches-qr-dots-chunk">
                          <div className="parches-qr-dot"></div>
                          <div className="parches-qr-dot"></div>
                          <div className="parches-qr-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="parches-qr-caption">Escanea para ir a la Web App</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--neon-emerald)', marginTop: '8px', margin: '8px 0 0 0' }}>Leads totales: {leadsCount}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* Navigation Controls Bar */}
      <footer className="parches-footer">
        <div className="parches-nav-buttons">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="parches-btn-nav"
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentSlide === SLIDES_COUNT - 1}
            className="parches-btn-nav"
          >
            →
          </button>
        </div>

        <div className="parches-progress-bar-container">
          <div 
            className="parches-progress-bar-fill"
            style={{ width: `${((currentSlide + 1) / SLIDES_COUNT) * 100}%` }}
          ></div>
        </div>

        <div className="parches-footer-tip hidden md:block">
          Flechas <strong>←</strong> / <strong>→</strong> o <strong>Espacio</strong> para navegar
        </div>
      </footer>
    </main>
  );
}
