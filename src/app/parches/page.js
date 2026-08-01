"use client";

import { useState, useEffect } from 'react';
import './parches.css';

const SLIDES_COUNT = 10;

export default function ParchesPresentation() {
    const [currentSlide, setCurrentSlide] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const scaleX = (viewportWidth * 0.95) / 1200;
      const scaleY = (viewportHeight * 0.72) / 675; // leave room for header/footer
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const downloadPresentationPDF = async () => {
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    try {
      if (typeof html2canvas === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }
      if (typeof window.jspdf === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }
    } catch (e) {
      console.error('Error loading print dependencies:', e);
      alert('Error de red al cargar las librerías de impresión.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [16, 9]
    });

    const slides = document.querySelectorAll('.parches-slide');
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '0';
    tempContainer.style.top = '0';
    tempContainer.style.zIndex = '-9999';
    tempContainer.style.background = '#030307';
    tempContainer.style.width = '1200px';
    tempContainer.style.boxSizing = 'border-box';
    document.body.appendChild(tempContainer);

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const clone = slide.cloneNode(true);
      clone.classList.add('active');
      
      clone.style.display = 'flex';
      clone.style.opacity = '1';
      clone.style.visibility = 'visible';
      clone.style.position = 'relative';
      clone.style.width = '1200px';
      clone.style.height = '675px';
      clone.style.maxHeight = 'none';
      clone.style.maxWidth = 'none';
      clone.style.transform = 'none';
      clone.style.transition = 'none';
      clone.style.left = 'auto';
      clone.style.top = 'auto';
      clone.style.padding = '40px';
      clone.style.boxSizing = 'border-box';
      clone.style.background = 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 45%), radial-gradient(circle at 50% 50%, #080810 0%, #030307 100%)';
      
      const glassCards = clone.querySelectorAll('.parches-glass-card');
      glassCards.forEach(card => {
        card.style.background = 'rgba(10, 10, 20, 0.95)';
        card.style.backdropFilter = 'none';
      });

      const animElements = clone.querySelectorAll('.animate-fade-in');
      animElements.forEach(el => {
        el.classList.remove('animate-fade-in');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.animation = 'none';
        el.style.transition = 'none';
      });

      tempContainer.appendChild(clone);

      try {
        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#030307',
          logging: false
        });

        tempContainer.removeChild(clone);

        const imgData = canvas.toDataURL('image/png');
        if (i > 0) {
          pdf.addPage([16, 9], 'landscape');
        }
        pdf.addImage(imgData, 'PNG', 0, 0, 16, 9);
      } catch (err) {
        console.error('Error rendering slide:', i, err);
      }
    }

    document.body.removeChild(tempContainer);
    pdf.save('Presentacion_Framework_IA.pdf');
  };

  const [direction, setDirection] = useState('forward');
  const [hotSeatIndex, setHotSeatIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', instagram: '' });
  const [leadsCount, setLeadsCount] = useState(0);

  // Hot Seat Questions/Debates (20 Content Creation & AI Workflows)
  const hotSeatQuestions = [
    {
      title: "🧠 DEBATE 1: ¿Guion 100% IA vs Guion con Toque Humano?",
      question: "¿Dejarías que la IA (tipo ChatGPT) escriba y publique tus guiones de Reels automáticamente, o crees que la edición manual humana es obligatoria para poder vender?",
      tip: "Debate sobre el impacto de la voz de marca vs la automatización total."
    },
    {
      title: "🧠 DEBATE 2: ¿Cantidad vs Calidad en la Era de la IA?",
      question: "Con la facilidad que nos da la IA, ¿prefieres publicar 3 videos diarios de calidad promedio generados en minutos, o 1 solo video a la semana hiper-producido?",
      tip: "Analiza el impacto del volumen en el algoritmo vs el impacto de la retención."
    },
    {
      title: "🧠 DEBATE 3: ¿Estructura Fija vs Improvisación Creativa?",
      question: "¿Usar un 'Framework' estructurado (como el de Sano & Punto) limita tu creatividad a largo plazo, o es la única forma real de no quemarse al crear contenido?",
      tip: "El balance entre sistematizar operaciones y mantener la creatividad."
    },
    {
      title: "🧠 DEBATE 4: ¿Marca con Rostro vs Marca Sin Rostro (IA)?",
      question: "Para escalar un negocio hoy, ¿es más rápido y rentable crear una marca visual con avatares 3D generados por IA, o salir tú mismo a grabar cada video?",
      tip: "Compara la escalabilidad del sistema sin rostro vs la confianza de la marca personal."
    },
    {
      title: "🧠 DEBATE 5: ¿Delegar la Edición mata tu estilo?",
      question: "Si automatizas toda tu edición de video con herramientas de IA en un clic, ¿pierdes la identidad visual de tu marca o simplemente estás ganando velocidad?",
      tip: "Evalúa si el estilo propio depende del esfuerzo manual o de las directrices creativas."
    },
    {
      title: "🧠 DEBATE 6: ¿Voz Humana vs Voz Clonada?",
      question: "Para un Reel educativo, ¿crees que el público rechaza las voces clonadas ultra-realistas por IA, o ya nadie nota la diferencia si el contenido es suficientemente bueno?",
      tip: "Discute la percepción del usuario y el límite de lo 'uncanny' (valle inquietante)."
    },
    {
      title: "🧠 DEBATE 7: ¿IA para Ideas vs IA para Ejecución?",
      question: "En tu flujo de trabajo, ¿prefieres usar la IA solo para que te dé ideas de contenido (brainstorming), o le exiges que te entregue el guion completo listo para grabar?",
      tip: "Compara los tiempos de fricción en la redacción vs la delegación completa."
    },
    {
      title: "🧠 DEBATE 8: ¿Replicar a la Competencia vs Inventar?",
      question: "Si usas IA para extraer la estructura exacta de un Reel viral de tu competencia y adaptarlo a tu nicho, ¿es un hack de crecimiento estratégico o falta de originalidad?",
      tip: "Debate la línea entre modelar estructuras virales y la clonación creativa."
    },
    {
      title: "🧠 DEBATE 9: ¿Atención (Vistas) vs Intención (Leads)?",
      question: "¿De qué sirve usar IA para tener un Reel de 1 millón de vistas si no tienes un lead magnet automatizado (como un QR o embudo) para capturar esos contactos?",
      tip: "Analiza el objetivo final del contenido: viralidad de vanidad vs conversión real."
    },
    {
      title: "🧠 DEBATE 10: ¿Música Viral vs Audio Limpio/ASMR?",
      question: "Para retener la atención, ¿prefieres depender de los audios en tendencia de Instagram/TikTok, o crear tu propia atmósfera de sonido (ASMR) como hace Sano & Punto?",
      tip: "Debate la dependencia del motor de recomendación vs el valor de producción del diseño sonoro."
    },
    {
      title: "🧠 DEBATE 11: ¿El Gancho (Hook) o el Desarrollo?",
      question: "Si tienes poco tiempo para optimizar un Reel con IA, ¿inviertes el 80% del esfuerzo en perfeccionar los primeros 3 segundos (Gancho) o en la explicación del video?",
      tip: "Discute dónde recae el mayor peso de retención según el algoritmo."
    },
    {
      title: "🧠 DEBATE 12: ¿Automatización de DMs vs Respuesta Manual?",
      question: "Si un Reel viral explota, ¿es mejor automatizar las respuestas en comentarios (con IA) para entregar tu oferta al instante, o la respuesta manual genera más confianza?",
      tip: "Evalúa las tasas de conversión y fricción del usuario en embudos de chat."
    },
    {
      title: "🧠 DEBATE 13: ¿Videos Largos vs Videos Cortos con IA?",
      question: "Con la IA reduciendo los tiempos de producción, ¿deberíamos enfocarnos 100% en contenido vertical corto, o el formato largo de YouTube sigue siendo el rey para vender?",
      tip: "Compara el descubrimiento rápido (Reels) vs la fidelización profunda (Videos largos)."
    },
    {
      title: "🧠 DEBATE 14: ¿El fin de la edición de video tradicional?",
      question: "Con editores automáticos impulsados por IA, ¿sigue siendo rentable para un creador contratar un editor humano mensual, o todo el presupuesto debería ir a escalar pauta?",
      tip: "Analiza la eficiencia de costos y la comoditización de la edición básica."
    },
    {
      title: "🧠 DEBATE 15: ¿Un solo nicho vs Variedad automatizada?",
      question: "Si la IA te permite crear contenido de cualquier tema en minutos, ¿es mejor mantener una cuenta hiper-enfocada en un solo problema, o hablar de varios temas para ganar alcance?",
      tip: "El balance entre la autoridad específica de nicho y el alcance masivo general."
    },
    {
      title: "🧠 DEBATE 16: ¿Subtítulos Estilo Hormiga vs Minimalismo?",
      question: "¿Los subtítulos súper rápidos y coloridos realmente aumentan la retención, o ya están saturando visualmente al usuario y es mejor volver a diseños limpios y sutiles?",
      tip: "Analiza la fatiga visual del formato TikTok vs la elegancia corporativa."
    },
    {
      title: "🧠 DEBATE 17: ¿Optimizar para el Algoritmo o para el Cliente?",
      question: "Al promptear a la IA, ¿le pides que estructure el guion para que se vuelva viral en la plataforma, o que lo escriba para que le hable únicamente a tu comprador ideal?",
      tip: "Debate sobre el tráfico basura no calificado vs leads calificados costosos."
    },
    {
      title: "🧠 DEBATE 18: ¿Reutilización Nativa vs Copiar-Pegar? ",
      question: "¿Usar automatizaciones para publicar exactamente el mismo video de TikTok en Reels y Shorts funciona igual de bien, o hay que adaptar nativamente el formato para cada red?",
      tip: "El impacto del esfuerzo de adaptación vs la conveniencia de la distribución masiva."
    },
    {
      title: "🧠 DEBATE 19: ¿El Llamado a la Acción (CTA) al inicio o al final?",
      question: "En un video automatizado de 30 segundos, ¿haces el llamado a la acción agresivo en el segundo 10, o esperas a que la persona reciba todo el valor hasta el final del Reel?",
      tip: "Analiza el abandono de visualización vs la intención de compra temprana."
    },
    {
      title: "🧠 DEBATE 20: ¿Aprender a grabar o aprender a promptear?",
      question: "Para alguien que empieza a crear contenido hoy, ¿qué habilidad le será más rentable en 2 años: ser un experto comunicando frente a la cámara, o ser un maestro de los prompts IA?",
      tip: "Discute el valor del carisma humano frente al apalancamiento tecnológico."
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
          <div>
            <h3 className="parches-logo-title" style={{ fontSize: '18px', tracking: '0.05em' }}>PARCHE DE IA #5</h3>
            <p className="parches-logo-subtitle">MEDELLÍN // COLOMBIA</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={downloadPresentationPDF}
            style={{
              background: 'linear-gradient(135deg, var(--neon-emerald), var(--neon-purple))',
              color: '#000',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '999px',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            📥 Descargar PDF
          </button>
          <div className="parches-status-badge">
            <span className="parches-status-dot"></span>
            <span>STATUS: IN LIVE</span>
          </div>
        </div>
      </header>

      {/* Main Slide Area */}
      <section className="parches-viewport">
        <div className="parches-slides-scale-container" style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: '1200px',
          height: '675px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
        
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
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// Quién soy & Resultados</span>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="parches-slide-title" style={{ fontSize: '48px', margin: 0 }}>Fundador Sano & Punto</h2>
              <span className="parches-footer-tip" style={{ color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                ORGANIC TRAFFIC apalancado en IA
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
              {/* Asymmetrical Column Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '25px', width: '100%', alignItems: 'center' }}>
                
                {/* Left Column: Huge Meta Suite Results Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-cyan)', marginBottom: '8px', letterSpacing: '0.1em' }}>// META BUSINESS SUITE // 25.4 MILLONES DE REPRODUCCIONES</div>
                  <img src="/sano_results_chart.png" alt="Meta Suite Results Chart" style={{ width: '100%', height: 'auto', maxHeight: '460px', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} />
                </div>

                {/* Right Column: Profiles side-by-side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
                  {/* Instagram Profile */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--neon-purple)', marginBottom: '8px', letterSpacing: '0.05em' }}>// INSTAGRAM</div>
                    <img src="/sano_instagram.png" alt="Instagram Profile" style={{ width: '100%', height: 'auto', maxHeight: '430px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }} />
                  </div>
                  
                  {/* Facebook Profile */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--neon-emerald)', marginBottom: '8px', letterSpacing: '0.05em' }}>// FACEBOOK</div>
                    <img src="/sano_facebook.png" alt="Facebook Profile" style={{ width: '100%', height: 'auto', maxHeight: '430px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: EL CIMIENTO: OFERTA, NICHO Y CONSTANCIA (Merged 4 & 5) */}
        <div className={`parches-slide ${currentSlide === 2 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '55px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// EL CIMIENTO INVISIBLE</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '40px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 className="parches-slide-title" style={{ fontSize: '42px', margin: 0 }}>La Oferta y la Pasión</h2>
                <div style={{ fontSize: '30px', fontWeight: '900', color: '#fff', lineHeight: '1.2' }}>
                  El contenido es el <span style={{ color: 'var(--neon-emerald)' }}>vehículo</span>,<br />
                  la oferta es el <span style={{ color: 'var(--neon-cyan)' }}>destino final</span>.
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--neon-purple)', fontStyle: 'italic', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-purple)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  "No improvises sin producto"
                </div>
                {/* Visual Pipeline diagram */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid var(--glass-border)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>1. Oferta Única</div>
                  <div style={{ color: 'var(--text-secondary)' }}>➔</div>
                  <div style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>2. Contenido IA</div>
                  <div style={{ color: 'var(--text-secondary)' }}>➔</div>
                  <div style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>3. Escala 🚀</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(5, 5, 10, 0.5)', border: '1px solid var(--glass-border)', padding: '30px', borderRadius: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-emerald)', marginBottom: '10px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <div style={{ fontSize: '32px', fontWeight: '950', color: 'var(--neon-emerald)' }}>"La Regla de los 50 Posts"</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f87171' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#f87171' }}>El filtro del aburrimiento</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 4: TARGET Y COMPETENCIA */}
        <div className={`parches-slide ${currentSlide === 3 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '60px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>// LA BRÚJULA DEL CONTENIDO</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '60px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon-cyan)' }}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                    <h4 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: 0 }}>Target Fiel (Mujeres 35-45)</h4>
                  </div>
                  {/* Visual Distribution Graphic */}
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      <span>Core Demográfico</span>
                      <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>78% del Tráfico</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, var(--neon-cyan), #06b6d4)', boxShadow: '0 0 10px rgba(6,182,212,0.5)' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon-cyan)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <h4 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: 0 }}>Benchmarking Activo</h4>
                  </div>
                  {/* Visual Benchmark Pulse */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--neon-cyan)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>⚡ Viral Reels Auditados</span>
                    <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--neon-emerald)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>📈 Modelado de Éxito</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                <img 
                  src="/demographics_gender_age.png" 
                  alt="Demografía de Género y Edad Sano y Punto" 
                  style={{ width: '100%', height: 'auto', maxHeight: '240px', objectFit: 'contain', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                />
                <img 
                  src="/demographics_countries.png" 
                  alt="Demografía por Países Sano y Punto" 
                  style={{ width: '100%', height: 'auto', maxHeight: '240px', objectFit: 'contain', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5: ¿QUÉ ES UN FRAMEWORK? */}
        <div className={`parches-slide ${currentSlide === 4 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '60px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// SISTEMAS VS CREATIVIDAD</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '50px', alignItems: 'center' }}>
              <div>
                <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '25px' }}>¿Qué es un Framework?</h2>
                <div style={{ fontSize: '42px', fontWeight: '950', color: 'var(--neon-purple)', fontStyle: 'italic', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon-purple)' }}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" /><path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" /><path d="M12 8v8" /></svg>
                  "No improvises, sistematiza"
                </div>
                {/* Visual side-by-side comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '25px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.1)', padding: '15px', borderRadius: '16px', fontSize: '12px' }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>❌ IMPROVISAR</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Bloqueo creativo, inconsistencia, fatiga.</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16,185,129,0.1)', padding: '15px', borderRadius: '16px', fontSize: '12px' }}>
                    <div style={{ color: 'var(--neon-emerald)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>✅ SISTEMATIZAR</div>
                    <div style={{ color: 'var(--text-secondary)' }}>IA delegada, predictibilidad, 100% control.</div>
                  </div>
                </div>
              </div>
              
              <div style={{ background: 'rgba(5, 5, 10, 0.6)', border: '1px solid var(--glass-border)', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--neon-cyan)', marginBottom: '15px' }}>FÓRMULA DE ESCALA</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '900', color: '#fff', leading: '1.1', marginBottom: '20px' }}>
                  ESTRUCTURA<br />
                  <span style={{ color: 'var(--neon-emerald)' }}>+ VARIABLE</span><br />
                  <span style={{ color: 'var(--neon-purple)', fontSize: '24px' }}>= CONSISTENCIA</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <div>🛡️ ESTRUCTURA = Estrategia Humana</div>
                  <div>⚡ VARIABLE = Ejecución con IA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 6: CASO REAL - ORGANOS PIXAR (SANO Y PUNTO) */}
        <div className={`parches-slide ${currentSlide === 5 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '60px' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// CASO SANO Y PUNTO</span>
            
            <div className="parches-grid-2-layout" style={{ gap: '60px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <h2 className="parches-slide-title" style={{ fontSize: '48px', margin: 0 }}>Framework "Órganos Pixar"</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon-emerald)' }}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8.01" y2="16" /><line x1="16" y1="16" x2="16.01" y2="16" /></svg>
                    1. Estructura Pixar Fija
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--neon-emerald)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon-emerald)' }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    2. Variación de Comida / Órgano
                  </div>
                </div>
              </div>
              
              {/* Right Column: Embedded Instagram Reel */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <iframe 
                  src="https://www.instagram.com/reel/DbO57JGR2ft/embed/" 
                  width="328" 
                  height="480" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowtransparency="true" 
                  allow="encrypted-media"
                  style={{ borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', background: 'rgba(0,0,0,0.2)' }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 7: EL PROMPT MAESTRO */}
        <div className={`parches-slide ${currentSlide === 6 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '45px 50px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// INSTRUCCIÓN DEL AGENTE</span>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="parches-slide-title" style={{ fontSize: '42px', margin: 0 }}>El Prompt Maestro</h2>
              <span className="parches-footer-tip" style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>FÓRMULA DE REDACCIÓN EN ANTIGRAVITY</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', width: '100%', alignItems: 'center' }}>
              {/* Left Column: Code/Prompt box */}
              <div style={{ background: 'rgba(5, 5, 10, 0.8)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f8fafc', overflowX: 'auto', borderLeft: '4px solid var(--neon-purple)', maxHeight: '420px', overflowY: 'auto' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}># prompt_vesicula_biliar.txt</div>
                <div style={{ color: 'var(--neon-purple)' }}>CONCEPTO:</div>
                <div style={{ paddingLeft: '15px', marginBottom: '10px' }}>Ayúdame a generar un video en base al frame "alimentos_que_retan.md". Quiero un video de "4 alimentos que retan tu vesícula biliar".</div>
                
                <div style={{ color: 'var(--neon-purple)' }}>REGLAS DE NEGOCIO:</div>
                <div style={{ paddingLeft: '15px', marginBottom: '10px' }}>Que sean alimentos perjudiciales con respaldo científico y específicos (ej: pan tajado, no bollería industrial).</div>
                
                <div style={{ color: 'var(--neon-purple)' }}>ESTRUCTURA DE ESCENAS:</div>
                <div style={{ paddingLeft: '15px', marginBottom: '10px' }}>Solo 4 escenas + escena 0. El prompt solo se necesita en la escena 0. Sin locución ni texto en videos.</div>
                
                <div style={{ color: 'var(--neon-purple)' }}>EDICIÓN Y ASMR:</div>
                <div style={{ paddingLeft: '15px', marginBottom: '10px' }}>Enfocar mucho en el efecto ASMR y movimiento de cámara.</div>

                <div style={{ color: 'var(--neon-purple)' }}>CAPTION Y CTA:</div>
                <div style={{ paddingLeft: '15px' }}>CTA: "Empezar a seguir Sano y Punto". En el caption, dar una recomendación rápida de cuántas veces comer cada producto para disfrutar sin hacer daño (ej: comer 1 vez al mes con razón válida).</div>
              </div>

              {/* Right Column: Key takeaways */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '18px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '950', color: 'var(--neon-emerald)' }}>1. Creatividad Guiada</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>La creatividad no es libre ni caótica; tiene una ruta clara trazada para maximizar la efectividad.</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '18px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '950', color: 'var(--neon-cyan)' }}>2. Estructura Flexible</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Un molde parametrizado (Frame) que define con precisión qué incluir y qué evitar.</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '18px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '950', color: 'var(--neon-purple)' }}>3. Output Consistente</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Garantiza guiones estandarizados y copys optimizados listos para su distribución.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8: FLYWHEEL / PROCESO DE CREACIÓN DE CONTENIDO */}
        <div className={`parches-slide ${currentSlide === 7 ? 'active' : ''}`}>
          <div className="parches-glass-card animate-fade-in" style={{ padding: '40px 50px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// WORKFLOW DE CREACIÓN</span>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 className="parches-slide-title" style={{ fontSize: '42px', margin: 0 }}>Flywheel Creativo</h2>
            </div>

            {/* Cyclical Flywheel Timeline Grid - Winding loop pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', position: 'relative' }}>
              
              {/* Row 1: Steps 1 to 4 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', alignItems: 'center', gap: '15px' }}>
                {/* Step 1: Idea */}
                <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.02))', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '24px', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>PASO 1</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <img src="/youtube_logo.svg" style={{ width: '22px', height: '22px' }} alt="YouTube" />
                    <img src="/instagram_logo.png" style={{ width: '20px', height: '20px' }} alt="Instagram" />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>IDEA</div>
                </div>
                <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '26px', textShadow: '0 0 10px rgba(6,182,212,0.5)' }}>»</div>
                
                {/* Step 2: Antigravity */}
                <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02))', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '24px', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)', fontWeight: 'bold' }}>PASO 2</div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '8px' }}>
                    <img src="/antigravity_logo.png" style={{ height: '28px', objectFit: 'contain' }} alt="Antigravity" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>ANTIGRAVITY</div>
                </div>
                <div style={{ color: 'var(--neon-purple)', fontWeight: 'bold', fontSize: '26px', textShadow: '0 0 10px rgba(139,92,246,0.5)' }}>»</div>

                {/* Step 3: Nano Banana */}
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '24px', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-emerald)', fontWeight: 'bold' }}>PASO 3</div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🍌</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>NANO BANANA</div>
                </div>
                <div style={{ color: 'var(--neon-emerald)', fontWeight: 'bold', fontSize: '26px', textShadow: '0 0 10px rgba(16,185,129,0.5)' }}>»</div>

                {/* Step 4: Flow Video */}
                <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PASO 4</div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: '900', color: '#fff', fontSize: '22px', textShadow: '0 0 8px rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>Flow</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>FLOW (VIDEO)</div>
                </div>
              </div>

              {/* Row 2: Connecting label & Steps 5 to 7 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr auto 1fr auto 1fr auto 1fr', alignItems: 'center', gap: '15px' }}>
                {/* Visual Connector label for looping back */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--neon-purple)', fontSize: '16px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'rotate(90deg)', color: 'var(--neon-purple)', filter: 'drop-shadow(0 0 5px var(--neon-purple))' }}><path d="M17 18H7a4 4 0 0 1-4-4V5" /><polyline points="3 8 7 4 11 8" /></svg>
                  <span style={{ letterSpacing: '0.1em' }}>IA GENERATION</span>
                </div>
                <div style={{ color: 'var(--neon-purple)', fontWeight: 'bold', fontSize: '26px', textShadow: '0 0 10px rgba(139,92,246,0.5)' }}>»</div>

                {/* Step 5: Ensamble */}
                <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PASO 5</div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: '900', color: '#fff', fontSize: '22px', textShadow: '0 0 8px rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>Flow</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>ENSAMBLE</div>
                </div>
                <div style={{ color: 'var(--neon-purple)', fontWeight: 'bold', fontSize: '26px', textShadow: '0 0 10px rgba(139,92,246,0.5)' }}>»</div>

                {/* Step 6: CapCut */}
                <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02))', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '24px', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)', fontWeight: 'bold' }}>PASO 6</div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '8px' }}>
                    <img src="/capcut_logo.png" style={{ height: '26px', objectFit: 'contain' }} alt="CapCut" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>CAPCUT</div>
                </div>
                <div style={{ color: 'var(--neon-purple)', fontWeight: 'bold', fontSize: '26px', textShadow: '0 0 10px rgba(139,92,246,0.5)' }}>»</div>

                {/* Step 7: Publicar */}
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '24px', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 35px rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-emerald)', fontWeight: 'bold' }}>PASO 7</div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '8px' }}>
                    <img src="/instagram_logo.png" style={{ height: '24px', width: '24px', objectFit: 'contain' }} alt="Instagram" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--neon-emerald)', marginTop: '10px' }}>PUBLICAR</div>
                </div>
              </div>

              {/* Graphical Circular Tech Stack Section */}
              <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.15em' }}>🛠️ HERRAMIENTAS UTILIZADAS</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px' }}>
                  {/* YouTube/Instagram (Ideas) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(6,182,212,0.3)', gap: '4px' }}>
                      <img src="/youtube_logo.svg" style={{ width: '22px', height: '22px' }} alt="YouTube" />
                      <img src="/instagram_logo.png" style={{ width: '18px', height: '18px' }} alt="Instagram" />
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Ideas</span>
                  </div>

                  {/* Antigravity */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--neon-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(139,92,246,0.3)' }}>
                      <img src="/antigravity_logo.png" style={{ height: '34px', objectFit: 'contain' }} alt="Antigravity" />
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Antigravity</span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)', marginTop: '-8px' }}>// Copywriter</span>
                  </div>

                  {/* Nano Banana */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--neon-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}>
                      <span style={{ fontSize: '28px' }}>🍌</span>
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Nano Banana</span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--neon-emerald)', marginTop: '-8px' }}>// Illustrator</span>
                  </div>

                  {/* Google Flow */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(6,182,212,0.3)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: '900', color: '#fff', fontSize: '16px', textShadow: '0 0 6px rgba(255,255,255,0.8)' }}>Flow</span>
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Google Flow</span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', marginTop: '-8px' }}>// Video Editor</span>
                  </div>

                  {/* CapCut */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px solid var(--neon-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(139,92,246,0.3)' }}>
                      <img src="/capcut_logo.png" style={{ height: '28px', objectFit: 'contain' }} alt="CapCut" />
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>CapCut</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SLIDE 9: DINAMICA INTERACTIVA - EL CONSULTORIO */}
        <div className={`parches-slide ${currentSlide === 8 ? 'active' : ''}`}>
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <span className="parches-badge" style={{ color: 'var(--neon-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>// CLÍNICA DE MARCAS IA</span>
            <h2 className="parches-slide-title" style={{ textAlign: 'center', fontSize: '46px' }}>Hot Seat IA</h2>
            
            {/* Question Card Box */}
            <div className="parches-hotseat-card" style={{ maxWidth: '650px', minHeight: '320px', marginTop: '20px' }}>
              <div className="parches-hotseat-tag">RETOS & OPORTUNIDADES {hotSeatIndex + 1}</div>
              
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
              <span>{isSpinning ? 'Girando...' : 'Girar Pregunta'}</span>
            </button>
          </div>
        </div>

        {/* SLIDE 10: EL REGALO */}
        <div className={`parches-slide ${currentSlide === 9 ? 'active' : ''}`}>
          <div className="parches-grid-2-layout animate-fade-in" style={{ alignItems: 'center' }}>
            {/* Left Info Column */}
            <div style={{ textAlign: 'left' }}>
              <span className="parches-badge" style={{ color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>// CONCLUIR & REGALO</span>
              <h2 className="parches-slide-title" style={{ fontSize: '48px', marginBottom: '40px' }}>Llévate Mi Framework Viral</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '22px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--neon-emerald)' }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Primero manual, luego automatizado.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '22px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--neon-emerald)' }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Recursividad al poder.</span>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code */}
            <div className="parches-form-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <h3 className="parches-form-title" style={{ fontSize: '24px', marginBottom: '5px' }}>Escanea el QR</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 25px' }}>Descarga el framework gratis al instante</p>
              
              {/* QR Code via API */}
              <div style={{ 
                background: '#fff', 
                padding: '16px', 
                borderRadius: '20px', 
                display: 'inline-block',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)',
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://funnelintelligence.vercel.app/parches/descarga&color=0a0a0f&bgcolor=ffffff&margin=0"
                  alt="QR Code - Escanea para descargar"
                  width={220}
                  height={220}
                  style={{ display: 'block', borderRadius: '8px' }}
                />
              </div>

              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-emerald)', marginTop: '20px', letterSpacing: '0.05em' }}>
                funnelintelligence.vercel.app/parches/descarga
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>
                📥 Framework Estándar para Reels / TikTok con IA
              </p>
            </div>
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
