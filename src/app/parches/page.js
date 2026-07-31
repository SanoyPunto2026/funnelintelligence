"use client";

import { useState, useEffect } from 'react';
import './parches.css';

const SLIDES_COUNT = 10;

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
      title: "🎯 Propuesta de Valor",
      question: "¿Qué vendes exactamente y qué dolor real quitas?",
      tip: "Define el dolor cotidiano, no las características."
    },
    {
      title: "🙋‍♀️ Tu Cliente Ideal",
      question: "¿A quién le hablas? Descríbelo en una frase corta.",
      tip: "Ej: Mujeres de 35-45 años que no tienen tiempo de cocinar."
    },
    {
      title: "🛑 La Barrera Mental",
      question: "¿Cuál es tu mayor obstáculo para subir videos constantemente?",
      tip: "Falta de ideas, miedo a la cámara, edición o perfeccionismo."
    },
    {
      title: "🔥 Pasión Infinita",
      question: "¿De qué tema hablarías gratis durante los próximos 3 años?",
      tip: "Sin pasión real, te vas a aburrir antes de ver resultados."
    },
    {
      title: "💰 La Oferta de $500 USD",
      question: "Si tuvieras que vender un servicio de alto valor con IA, ¿qué sería?",
      tip: "Empaqueta tu conocimiento en una oferta de alta conversión."
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
            <h3 className="parches-logo-title" style={{ fontSize: '18px', tracking: '0.05em' }}>PARCHE DE IA #5</h3>
            <p className="parches-logo-subtitle">MEDELLÍN // COLOMBIA</p>
          </div>
        </div>
        <div className="parches-status-badge">
          <span className="parches-status-dot"></span>
          <span>STATUS: IN LIVE</span>
        </div>
      </header>

      {/* Main Slide Area */}
      <section className="parches-viewport">
        
        {/* SLIDE 1: PORTADA */}
        <div className={`parches-slide ${currentSlide === 0 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '70px' }}>
            <span className="parches-badge">Caso de Estudio Real</span>
            <h1 className="parches-title-main" style={{ fontSize: '80px', margin: '10px 0 30px' }}>
              Crecer y Automatizar <br />
              <span className="parches-gradient-span">una Marca con IA</span>
            </h1>
            <p className="parches-desc-main" style={{ fontSize: '26px', maxWidth: '900px', margin: '0 auto 10px', fontWeight: '400' }}>
              Cómo crecer 100k en 3 meses con un framework y consistencia.
            </p>
          </div>
        </div>

        {/* SLIDE 2: QUIEN SOY + RESULTADOS SANO Y PUNTO */}
        <div className={`parches-slide ${currentSlide === 1 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// Quién soy & Resultados</span>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
              <h2 className="parches-slide-title" style={{ fontSize: '48px', margin: 0 }}>Alejandro Ruiz // Sano y Punto</h2>
              <span className="parches-footer-tip" style={{ color: 'var(--neon-cyan)' }}>ORGANIC TRAFFIC apalancado en IA</span>
            </div>

            <div className="parches-grid-3">
              <div className="parches-metric-card" style={{ padding: '50px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="parches-metric-label" style={{ fontSize: '16px', marginBottom: '20px' }}>// Comunidad</div>
                <div className="parches-metric-value emerald" style={{ fontSize: '80px', margin: 0 }}>+18K</div>
              </div>
              <div className="parches-metric-card" style={{ padding: '50px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="parches-metric-label" style={{ fontSize: '16px', marginBottom: '20px' }}>// Alcance Orgánico</div>
                <div className="parches-metric-value purple" style={{ fontSize: '80px', margin: 0 }}>1.5M+</div>
              </div>
              <div className="parches-metric-card" style={{ padding: '50px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="parches-metric-label" style={{ fontSize: '16px', marginBottom: '20px' }}>// Conversión en App</div>
                <div className="parches-metric-value cyan" style={{ fontSize: '80px', margin: 0 }}>+2.5K</div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: EL CIMIENTO: OFERTA, NICHO Y CONSTANCIA (Merged 4 & 5) */}
        <div className={`parches-slide ${currentSlide === 2 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '55px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// 02. EL CIMIENTO INVISIBLE</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '40px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 className="parches-slide-title" style={{ fontSize: '42px', margin: 0 }}>La Oferta y la Pasión</h2>
                <div style={{ fontSize: '30px', fontWeight: '900', color: '#fff', lineHeight: '1.2' }}>
                  El contenido es el <span style={{ color: 'var(--neon-emerald)' }}>vehículo</span>,<br />
                  la oferta es el <span style={{ color: 'var(--neon-cyan)' }}>destino final</span>.
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--neon-purple)', fontStyle: 'italic', marginTop: '10px' }}>
                  "No improvises sin producto"
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(5, 5, 10, 0.5)', border: '1px solid var(--glass-border)', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '950', color: 'var(--neon-emerald)' }}>"La Regla de los 50 Posts"</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#f87171' }}>⚠️ El filtro del aburrimiento</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 4: TARGET Y COMPETENCIA */}
        <div className={`parches-slide ${currentSlide === 3 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '60px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>// 03. LA BRÚJULA DEL CONTENIDO</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '60px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <h2 className="parches-slide-title" style={{ fontSize: '48px', margin: 0 }}>Target y Competencia</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div>
                    <h4 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--neon-cyan)', margin: 0 }}>🎯 Target Fiel (Mujeres 35-45)</h4>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--neon-cyan)', margin: 0 }}>🔍 Benchmarking Activo</h4>
                  </div>
                </div>
              </div>
              
              <div className="parches-sidebar-checklist" style={{ padding: '35px 30px' }}>
                <div className="parches-checklist-badge">MÉTRICAS</div>
                <h3 className="parches-checklist-title" style={{ fontSize: '20px', marginBottom: '25px' }}>📋 Ajustes</h3>
                <div className="parches-check-item">
                  <span className="parches-check-label">Target Ideal</span>
                  <span className="parches-check-value emerald">Mujeres 35-45</span>
                </div>
                <div className="parches-check-item">
                  <span className="parches-check-label">Enfoque</span>
                  <span className="parches-check-value">Dolor Cotidiano</span>
                </div>
                <div className="parches-check-item">
                  <span className="parches-check-label">Competidores</span>
                  <span className="parches-check-value purple">Auditados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5: ¿QUÉ ES UN FRAMEWORK? */}
        <div className={`parches-slide ${currentSlide === 4 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '60px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// 04. SISTEMAS VS CREATIVIDAD</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '50px', alignItems: 'center' }}>
              <div>
                <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '25px' }}>¿Qué es un Framework?</h2>
                <div style={{ fontSize: '42px', fontWeight: '950', color: 'var(--neon-purple)', fontStyle: 'italic', margin: 0 }}>
                  "No improvises, sistematiza"
                </div>
              </div>
              
              <div style={{ background: 'rgba(5, 5, 10, 0.6)', border: '1px solid var(--glass-border)', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--neon-cyan)', marginBottom: '15px' }}>FÓRMULA DE ESCALA</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '900', color: '#fff', leading: '1.1' }}>
                  ESTRUCTURA<br />
                  <span style={{ color: 'var(--neon-emerald)' }}>+ VARIABLE</span><br />
                  <span style={{ color: 'var(--neon-purple)', fontSize: '24px' }}>= CONSISTENCIA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 6: CASO REAL - ORGANOS PIXAR (SANO Y PUNTO) */}
        <div className={`parches-slide ${currentSlide === 5 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '60px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// 05. CASO SANO Y PUNTO</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '60px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <h2 className="parches-slide-title" style={{ fontSize: '48px', margin: 0 }}>Framework "Órganos Pixar"</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>
                    1. Estructura Pixar Fija 🤖
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--neon-emerald)' }}>
                    2. Variación de Comida / Órgano 🥦
                  </div>
                </div>
              </div>
              
              <div className="parches-sidebar-checklist" style={{ padding: '30px' }}>
                <div className="parches-checklist-badge">SANO Y PUNTO</div>
                <h3 className="parches-checklist-title" style={{ fontSize: '18px' }}>🧠 Estructura</h3>
                <div className="parches-check-item">
                  <span className="parches-check-label">Hígado</span>
                  <span className="parches-check-value emerald">Grasa ➡️ Reacción Dolor</span>
                </div>
                <div className="parches-check-item">
                  <span className="parches-check-label">Estómago</span>
                  <span className="parches-check-value cyan">Kéfir ➡️ Reacción Corazón</span>
                </div>
                <div className="parches-check-item">
                  <span className="parches-check-label">Riñón</span>
                  <span className="parches-check-value">Agua ➡️ Reacción Energía</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 7: ANATOMÍA DE UN VIDEO VIRAL */}
        <div className={`parches-slide ${currentSlide === 6 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '60px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>// 06. ESTRUCTURACIÓN DE GUION</span>
            <h2 className="parches-slide-title" style={{ fontSize: '44px', marginBottom: '40px' }}>Anatomía del Video (30 Segundos)</h2>
            
            <div className="parches-grid-3" style={{ gap: '30px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '45px 30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--neon-emerald)', fontWeight: 'bold', marginBottom: '15px' }}>01 // HOOK</div>
                <h4 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', margin: 0 }}>0 a 3 seg</h4>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '45px 30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--neon-purple)', fontWeight: 'bold', marginBottom: '15px' }}>02 // CUERPO</div>
                <h4 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', margin: 0 }}>3 a 20 seg</h4>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '45px 30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--neon-cyan)', fontWeight: 'bold', marginBottom: '15px' }}>03 // CTA</div>
                <h4 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', margin: 0 }}>20 a 30 seg</h4>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8: 3 FRAMEWORKS DE INDUSTRIA */}
        <div className={`parches-slide ${currentSlide === 7 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>// 07. MOLDES DE INDUSTRIA</span>
            <h2 className="parches-slide-title" style={{ fontSize: '42px', marginBottom: '45px' }}>3 Frameworks de Contenido</h2>
            
            <div className="parches-grid-3">
              <div className="parches-framework-card emerald" style={{ padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div className="parches-framework-num">01</div>
                <h3 className="parches-framework-title" style={{ fontSize: '28px', marginBottom: '10px' }}>Belleza y Estética</h3>
                <p className="parches-framework-subtitle" style={{ fontSize: '13px', color: 'var(--neon-emerald)', margin: 0 }}>"El Ingrediente Héroe"</p>
              </div>

              <div className="parches-framework-card purple" style={{ padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div className="parches-framework-num">02</div>
                <h3 className="parches-framework-title" style={{ fontSize: '28px', marginBottom: '10px' }}>Moda y Ropa</h3>
                <p className="parches-framework-subtitle" style={{ fontSize: '13px', color: 'var(--neon-purple)', margin: 0 }}>"Duelo de Outfits"</p>
              </div>

              <div className="parches-framework-card cyan" style={{ padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div className="parches-framework-num">03</div>
                <h3 className="parches-framework-title" style={{ fontSize: '28px', marginBottom: '10px' }}>Servicios y Consultores</h3>
                <p className="parches-framework-subtitle" style={{ fontSize: '13px', color: 'var(--neon-cyan)', margin: 0 }}>"El Rompe-Mitos"</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 9: DINAMICA INTERACTIVA - EL CONSULTORIO */}
        <div className={`parches-slide ${currentSlide === 8 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// 08. INTERACCIÓN Y DEBATE</span>
            <h2 className="parches-slide-title" style={{ textAlign: 'center', fontSize: '46px' }}>El Consultorio en Vivo</h2>
            
            {/* Question Card Box */}
            <div className="parches-hotseat-card" style={{ maxWidth: '650px', minHeight: '320px', marginTop: '20px' }}>
              <div className="parches-hotseat-tag">TARJETA DE DEBATE {hotSeatIndex + 1}</div>
              
              <div className={`parches-spin-transition ${isSpinning ? 'opacity-20 scale-95 blur-xs' : 'opacity-100 scale-100'}`} style={{ transition: 'all 0.12s ease-in-out' }}>
                <h3 className="parches-hotseat-title" style={{ fontSize: '18px' }}>
                  {hotSeatQuestions[hotSeatIndex].title}
                </h3>
                <p className="parches-hotseat-question" style={{ fontSize: '32px', margin: 0 }}>
                  "{hotSeatQuestions[hotSeatIndex].question}"
                </p>
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

        {/* SLIDE 10: EL REGALO */}
        <div className={`parches-slide ${currentSlide === 9 ? 'active' : ''}`}>
          <div className="parches-grid-2-layout animate-fade-in" style={{ alignItems: 'center' }}>
            {/* Left Info Column */}
            <div style={{ textAlign: 'left' }}>
              <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// 09. CONCLUIR & REGALO</span>
              <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '40px' }}>Llévate Mi Framework Viral</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '22px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--neon-emerald)', fontSize: '26px' }}>✓</span>
                  <span>Primero manual, luego automatizado.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '22px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--neon-emerald)', fontSize: '26px' }}>✓</span>
                  <span>Recursividad al poder.</span>
                </div>
              </div>
            </div>

            {/* Right Form / QR Column */}
            <div className="parches-form-card" style={{ padding: '40px' }}>
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <h3 className="parches-form-title" style={{ fontSize: '24px' }}>Regístrate y Descarga</h3>
                  
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
                    style={{ fontSize: '14px', fontWeight: '900', padding: '18px' }}
                  >
                    {loading ? 'Guardando...' : 'Obtener Framework'}
                  </button>
                </form>
              ) : (
                <div className="parches-success-container">
                  <div className="parches-success-icon">🎉</div>
                  <h3 className="parches-success-title" style={{ fontSize: '26px' }}>¡Inscripción Exitosa!</h3>
                  <p className="parches-success-desc" style={{ fontSize: '14px' }}>
                    ¡Gracias, {formData.name}! Tus datos se guardaron localmente en el servidor. Te hemos enviado el Framework a **{formData.email}**.
                  </p>
                  
                  <div className="parches-qr-wrapper" style={{ margin: '0 auto', width: '180px', height: '180px' }}>
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
                  <p className="parches-qr-caption" style={{ fontSize: '10px' }}>Escanea para ir a la Web App</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--neon-emerald)', marginTop: '8px', margin: '8px 0 0 0' }}>Leads totales: {leadsCount}</p>
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

        <div className="parches-footer-tip hidden md:block" style={{ fontSize: '10px' }}>
          Flechas <strong>←</strong> / <strong>→</strong> o <strong>Espacio</strong> para navegar
        </div>
      </footer>
    </main>
  );
}
