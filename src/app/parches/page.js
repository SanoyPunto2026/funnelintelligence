"use client";

import { useState, useEffect } from 'react';
import './parches.css';

const SLIDES_COUNT = 12;

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
          <div className="parches-glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '60px' }}>
            <span className="parches-badge">Caso de Estudio Real</span>
            <h1 className="parches-title-main" style={{ fontSize: '80px', margin: '10px 0 30px' }}>
              Crecer una Marca <br />
              <span className="parches-gradient-span">con IA y Consistencia</span>
            </h1>
            <p className="parches-desc-main" style={{ fontSize: '24px', maxWidth: '800px', margin: '0 auto 40px', fontWeight: '400' }}>
              De la artesanía manual a la escala viral en redes sociales.
            </p>
            <div className="parches-profile-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
              <div className="parches-profile-avatar">👨‍💻</div>
              <div style={{ textAlign: 'left' }}>
                <p className="parches-profile-name" style={{ fontSize: '18px' }}>Alejandro Ruiz</p>
                <p className="parches-profile-role" style={{ fontSize: '11px' }}>Fundador, Sano y Punto</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 2: PRESENTACIÓN PERSONAL */}
        <div className={`parches-slide ${currentSlide === 1 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '50px', maxWidth: '1000px', margin: '0 auto' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// Quién soy</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '60px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '220px', height: '220px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))', margin: '0 auto 20px', padding: '5px', boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0a0a14', display: 'flex', items: 'center', justify: 'center', fontSize: '90px', alignItems: 'center', justifyContent: 'center' }}>
                    🧑‍💻
                  </div>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '900', color: '#fff', margin: 0 }}>Alejandro Ruiz</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--neon-cyan)', marginTop: '5px', uppercase: 'true', letterSpacing: '0.1em' }}>BUILDER & CREATOR</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'start' }}>
                  <span style={{ fontSize: '24px', color: 'var(--neon-emerald)' }}>⚡</span>
                  <div>
                    <h4 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' }}>Práctica &gt; Teoría</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>Lo que construí en mi cuarto con IA, funcionando en la calle.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'start' }}>
                  <span style={{ fontSize: '24px', color: 'var(--neon-purple)' }}>🚀</span>
                  <div>
                    <h4 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' }}>Sano y Punto</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>La app móvil de nutrición creada para comer sano, rápido y sin estrés.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: CASO DE ESTUDIO (SANO Y PUNTO METRICS) */}
        <div className={`parches-slide ${currentSlide === 2 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// 01. EL IMPACTO REAL</span>
            <h2 className="parches-slide-title" style={{ fontSize: '50px', marginBottom: '40px' }}>Caso de Estudio: Sano y Punto</h2>
            
            <div className="parches-grid-3">
              <div className="parches-metric-card" style={{ padding: '40px' }}>
                <div className="parches-metric-label" style={{ fontSize: '12px' }}>// Comunidad</div>
                <div className="parches-metric-value emerald" style={{ fontSize: '72px' }}>+18K</div>
                <p className="parches-metric-desc" style={{ fontSize: '15px' }}>Seguidores calificados y altamente activos ganados en 3 meses.</p>
              </div>
              <div className="parches-metric-card" style={{ padding: '40px' }}>
                <div className="parches-metric-label" style={{ fontSize: '12px' }}>// Alcance Orgánico</div>
                <div className="parches-metric-value purple" style={{ fontSize: '72px' }}>1.5M+</div>
                <p className="parches-metric-desc" style={{ fontSize: '15px' }}>Reproducciones virales de videos creados con IA, sin pauta.</p>
              </div>
              <div className="parches-metric-card" style={{ padding: '40px' }}>
                <div className="parches-metric-label" style={{ fontSize: '12px' }}>// Conversión en App</div>
                <div className="parches-metric-value cyan" style={{ fontSize: '72px' }}>+2.5K</div>
                <p className="parches-metric-desc" style={{ fontSize: '15px' }}>Usuarios reales descargando e inscribiéndose en la App.</p>
              </div>
            </div>
            
            {/* Visual Metric placeholder when they upload it */}
            <div style={{ marginTop: '30px', height: '10px', background: 'linear-gradient(90deg, var(--neon-emerald), var(--neon-purple))', opacity: 0.1, borderRadius: '5px' }}></div>
          </div>
        </div>

        {/* SLIDE 4: EL CIMIENTO INVISIBLE (OFERTA Y PRODUCTO) */}
        <div className={`parches-slide ${currentSlide === 3 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '50px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// 02. ESTRATEGIA ANTES DE GRABAR</span>
            <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '30px' }}>La Oferta y el Producto</h2>
            
            <div className="parches-grid-2-layout" style={{ gap: '40px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', leading: '1.2' }}>
                  El contenido es el <span style={{ color: 'var(--neon-emerald)' }}>vehículo</span>,<br />
                  la oferta es el <span style={{ color: 'var(--neon-cyan)' }}>destino final</span>.
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', margin: 0, lineHeight: '1.5' }}>
                  Sin un producto o servicio claro, la viralidad en redes es simplemente una métrica de ego. Debes saber a dónde enviar el tráfico.
                </p>
              </div>
              
              <div style={{ background: 'rgba(5, 5, 10, 0.5)', border: '1px solid var(--glass-border)', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎯</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '900', color: '#fff', uppercase: 'true' }}>OFERTA CLARA</div>
                <div style={{ fontSize: '20px', color: 'var(--neon-emerald)', fontWeight: 'bold', marginTop: '10px' }}>
                  Foco ➡️ Conversión
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5: NICHO Y PASIÓN (LA REGLA DE LOS 50 POSTS) */}
        <div className={`parches-slide ${currentSlide === 4 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '50px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// 03. LA LEY DE LA CONSTANCIA</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '50px', alignItems: 'center' }}>
              <div>
                <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '20px' }}>Nicho y Pasión</h2>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--neon-emerald)', marginBottom: '15px' }}>
                  "La Regla de los 50 Posts"
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>
                  Crear contenido orgánico requiere constancia absoluta. Puedes publicar 50 videos sin ver resultados. Si no te apasiona el nicho, abandonarás por aburrimiento.
                </p>
              </div>
              
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '30px', borderRadius: '24px', textAlign: 'left' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f87171', margin: '0 0 10px 0' }}>El filtro del aburrimiento</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  Elegir un nicho solo por moda o dinero rápido te garantiza tirar la toalla en la primera semana sin reproducciones. El algoritmo premia la constancia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 6: TARGET Y COMPETENCIA */}
        <div className={`parches-slide ${currentSlide === 5 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '50px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>// 04. LA BRÚJULA DEL CONTENIDO</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '50px', alignItems: 'start' }}>
              <div>
                <h2 className="parches-slide-title" style={{ fontSize: '44px', marginBottom: '20px' }}>Target y Competencia</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--neon-cyan)', margin: '0 0 5px 0' }}>🎯 Target Fiel (Mujeres 35-45)</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Tus videos deben atacar sus dolores diarios (falta de tiempo, estrés al cocinar), no generalidades del gimnasio.</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--neon-cyan)', margin: '0 0 5px 0' }}>🔍 Benchmarking Activo</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Investiga competidores (con y sin IA). Identifica qué videos funcionan y replica los patrones de ganchos que ya tienen éxito.</p>
                  </div>
                </div>
              </div>
              
              <div className="parches-sidebar-checklist" style={{ padding: '30px' }}>
                <div className="parches-checklist-badge">MÉTRICAS</div>
                <h3 className="parches-checklist-title">📋 Ajustes de Target</h3>
                <div className="parches-check-item">
                  <span className="parches-check-label">Target Ideal</span>
                  <span className="parches-check-value emerald">Mujeres 35-45</span>
                </div>
                <div className="parches-check-item">
                  <span className="parches-check-label">Enfoque</span>
                  <span className="parches-check-value">Dolores Cotidianos</span>
                </div>
                <div className="parches-check-item">
                  <span className="parches-check-label">Competidores</span>
                  <span className="parches-check-value purple">Auditados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 7: ¿QUÉ ES UN FRAMEWORK? */}
        <div className={`parches-slide ${currentSlide === 6 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '50px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// 05. SISTEMAS VS CREATIVIDAD</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '40px', alignItems: 'center' }}>
              <div>
                <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '25px' }}>¿Qué es un Framework?</h2>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--neon-purple)', fontStyle: 'italic', marginBottom: '20px' }}>
                  "No improvises, sistematiza"
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>
                  Yo no me despierto cada mañana pensando qué tipo de video diferente inventar. Utilizo 2 o 3 plantillas probadas y varío los temas dentro de ellas.
                </p>
              </div>
              
              <div style={{ background: 'rgba(5, 5, 10, 0.6)', border: '1px solid var(--glass-border)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--neon-cyan)', marginBottom: '15px' }}>FÓRMULA DE ESCALA</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '900', color: '#fff', leading: '1.1' }}>
                  ESTRUCTURA<br />
                  <span style={{ color: 'var(--neon-emerald)' }}>+ VARIABLE</span><br />
                  <span style={{ color: 'var(--neon-purple)', fontSize: '22px' }}>= CONSISTENCIA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8: CASO REAL - ORGANOS PIXAR (SANO Y PUNTO) */}
        <div className={`parches-slide ${currentSlide === 7 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '50px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// 06. CASO SANO Y PUNTO</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '50px', alignItems: 'center' }}>
              <div>
                <h2 className="parches-slide-title" style={{ fontSize: '44px', marginBottom: '20px' }}>Framework "Órganos Pixar"</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-secondary)', fontSize: '15px' }}>
                  <p style={{ margin: 0 }}><strong>Estructura Fija:</strong> Órganos animados Pixar comiendo alimentos y reaccionando con dolor o felicidad, sumado a un caption científico nutricional.</p>
                  <p style={{ margin: 0 }}><strong>La Variable:</strong> Cambia el alimento, el tipo de órgano (hígado, riñones) y si le hace bien o mal.</p>
                </div>
              </div>
              
              <div className="parches-sidebar-checklist" style={{ padding: '30px' }}>
                <div className="parches-checklist-badge">SANO Y PUNTO</div>
                <h3 className="parches-checklist-title">🧠 Órgano + Alimento</h3>
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

        {/* SLIDE 9: ANATOMÍA DE UN VIDEO VIRAL */}
        <div className={`parches-slide ${currentSlide === 8 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '50px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>// 07. ESTRUCTURACIÓN DE GUION</span>
            <h2 className="parches-slide-title" style={{ fontSize: '40px', marginBottom: '30px' }}>Anatomía de un Video de 30 Segundos</h2>
            
            <div className="parches-grid-3">
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--neon-emerald)', fontWeight: 'bold', marginBottom: '10px' }}>01 // HOOK</div>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' }}>0 a 3 segundos</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Captura la atención inmediata del target enfocado en su dolor.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--neon-purple)', fontWeight: 'bold', marginBottom: '10px' }}>02 // CUERPO</div>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' }}>3 a 20 segundos</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Entrega la promesa del gancho de manera rápida y sin rodeos.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--neon-cyan)', fontWeight: 'bold', marginBottom: '10px' }}>03 // CTA</div>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' }}>20 a 30 segundos</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Llamado a la acción específico: Comentar palabra clave para automatizar entrega.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 10: 3 FRAMEWORKS DE INDUSTRIA */}
        <div className={`parches-slide ${currentSlide === 9 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>// 08. MOLDES DE INDUSTRIA</span>
            <h2 className="parches-slide-title" style={{ fontSize: '42px', marginBottom: '35px' }}>3 Frameworks de Contenido</h2>
            
            <div className="parches-grid-3">
              <div className="parches-framework-card emerald" style={{ padding: '30px' }}>
                <div className="parches-framework-num">01</div>
                <h3 className="parches-framework-title" style={{ fontSize: '22px' }}>Belleza y Estética</h3>
                <p className="parches-framework-subtitle" style={{ fontSize: '11px' }}>"El Ingrediente Héroe / El Proceso Visual"</p>
                <div className="parches-framework-preview-box" style={{ fontSize: '11px' }}>
                  <strong>Hook:</strong> "Si sufres de [problema], deja de usar..."<br/>
                  <strong>Cuerpo:</strong> Mostrar textura/antes-después y activo.<br/>
                  <strong>CTA:</strong> "Comenta [PIEL] para la rutina."
                </div>
              </div>

              <div className="parches-framework-card purple" style={{ padding: '30px' }}>
                <div className="parches-framework-num">02</div>
                <h3 className="parches-framework-title" style={{ fontSize: '22px' }}>Moda y Ropa</h3>
                <p className="parches-framework-subtitle" style={{ fontSize: '11px' }}>"Duelo de Outfits / Corrección"</p>
                <div className="parches-framework-preview-box" style={{ fontSize: '11px' }}>
                  <strong>Hook:</strong> "No combines [prenda] así si vas a..."<br/>
                  <strong>Cuerpo:</strong> Visualización rápido Incorrecto vs Correcto.<br/>
                  <strong>CTA:</strong> "Comenta [ESTILO] para los links."
                </div>
              </div>

              <div className="parches-framework-card cyan" style={{ padding: '30px' }}>
                <div className="parches-framework-num">03</div>
                <h3 className="parches-framework-title" style={{ fontSize: '22px' }}>Servicios y Consultores</h3>
                <p className="parches-framework-subtitle" style={{ fontSize: '11px' }}>"El Rompe-Mitos / Solución al Dolor"</p>
                <div className="parches-framework-preview-box" style={{ fontSize: '11px' }}>
                  <strong>Hook:</strong> "La gran mentira que te dijeron sobre..."<br/>
                  <strong>Cuerpo:</strong> Hablar directo a cámara y dar 3 pasos reales.<br/>
                  <strong>CTA:</strong> "Comenta [GUIA] para enviarte el PDF."
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 11: DINAMICA INTERACTIVA - EL CONSULTORIO */}
        <div className={`parches-slide ${currentSlide === 10 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// 09. INTERACCIÓN Y DEBATE</span>
            <h2 className="parches-slide-title" style={{ textAlign: 'center', fontSize: '46px' }}>El Consultorio en Vivo</h2>
            <p className="parches-desc-main" style={{ fontSize: '16px', marginBottom: '24px', textAlign: 'center', maxWidth: '600px' }}>
              ¡Hablemos de tus proyectos! Gira la ruleta para proponer un tema de debate en grupo.
            </p>

            {/* Question Card Box */}
            <div className="parches-hotseat-card" style={{ maxWidth: '650px', minHeight: '340px' }}>
              <div className="parches-hotseat-tag">TARJETA DE DEBATE {hotSeatIndex + 1}</div>
              
              <div className={`parches-spin-transition ${isSpinning ? 'opacity-20 scale-95 blur-xs' : 'opacity-100 scale-100'}`} style={{ transition: 'all 0.12s ease-in-out' }}>
                <h3 className="parches-hotseat-title" style={{ fontSize: '18px' }}>
                  {hotSeatQuestions[hotSeatIndex].title}
                </h3>
                <p className="parches-hotseat-question" style={{ fontSize: '28px' }}>
                  "{hotSeatQuestions[hotSeatIndex].question}"
                </p>
                <div className="parches-hotseat-tip-box" style={{ margin: '0 auto', fontSize: '13px' }}>
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

        {/* SLIDE 12: EL REGALO */}
        <div className={`parches-slide ${currentSlide === 11 ? 'active' : ''}`}>
          <div className="parches-grid-2-layout animate-fade-in" style={{ alignItems: 'center' }}>
            {/* Left Info Column */}
            <div style={{ textAlign: 'left' }}>
              <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// 10. CONCLUIR & REGALO</span>
              <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '24px' }}>Llévate Mi Framework Viral</h2>
              <p className="parches-desc-main" style={{ fontSize: '18px', marginBottom: '28px', lineHeight: '1.4' }}>
                Regístrate y recibe la plantilla con prompts de ChatGPT directa a tu correo.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '15px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold', fontSize: '18px' }}>✓</span>
                  <span><strong>Regla de oro:</strong> Primero manual, luego automatizado.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '15px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold', fontSize: '18px' }}>✓</span>
                  <span><strong>Recursividad:</strong> Optimiza costos y escala paso a paso.</span>
                </div>
              </div>
            </div>

            {/* Right Form / QR Column */}
            <div className="parches-form-card" style={{ padding: '40px' }}>
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <h3 className="parches-form-title" style={{ fontSize: '24px' }}>Regístrate y Descarga</h3>
                  <p className="parches-form-desc" style={{ marginBottom: '20px' }}>Ingresa tus datos para registrarte y descargar la plantilla.</p>
                  
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
