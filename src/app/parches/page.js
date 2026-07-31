"use client";

import { useState, useEffect } from 'react';

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
    <main className="min-h-screen bg-[#07070b] text-zinc-100 flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Sci-Fi Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Cyberpunk Neon Glow Circles */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none animate-pulse" style={{ animationDelay: '3.5s' }}></div>
      <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="px-8 py-5 flex justify-between items-center z-10 border-b border-zinc-900/60 bg-zinc-950/60 backdrop-blur-xl relative">
        {/* Glow Line beneath header */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-purple-500/30"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-purple-600 flex items-center justify-center font-black text-xl text-black shadow-lg shadow-emerald-500/20">
            S
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-widest bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">SANO Y PUNTO</h3>
            <p className="text-[9px] text-emerald-400 font-mono tracking-widest">PARCHE DE IA #5 // MEDELLÍN</p>
          </div>
        </div>
        <div className="text-zinc-400 text-xs font-mono bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800/80 flex items-center gap-2 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>STATUS: IN LIVE</span>
          <span className="text-zinc-600">//</span>
          <span className="text-emerald-400">SLIDE {currentSlide + 1}/{SLIDES_COUNT}</span>
        </div>
      </header>

      {/* Main Slide Area */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-8 z-10 relative">
        
        {/* SLIDE 1: PORTADA */}
        {currentSlide === 0 && (
          <div className="max-w-4xl text-center flex flex-col items-center animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 rounded-full mb-8 shadow-lg shadow-emerald-900/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>CASO DE ESTUDIO REAL</span>
            </div>
            
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-none mb-6">
              Crecer una Marca <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-500 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                con IA y Consistencia
              </span>
            </h1>
            
            <h3 className="text-zinc-400 text-lg md:text-2xl font-light tracking-wide max-w-2xl mt-4 leading-relaxed">
              De la manualidad artesanal a la escala viral en redes sociales.
            </h3>

            <div className="h-[2px] w-24 bg-gradient-to-r from-emerald-500 to-purple-500 my-10"></div>
            
            <div className="flex items-center gap-4 border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-2xl">
                👨‍💻
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-zinc-100 tracking-wide">Alejandro Ruiz</p>
                <p className="text-xs text-zinc-500 font-mono">Fundador, Sano y Punto</p>
              </div>
            </div>
            
            <div className="mt-12 text-zinc-600 text-xs flex items-center gap-2 animate-bounce font-mono tracking-widest">
              <span>Presiona <strong>ESPACIO</strong> o <strong>→</strong> para avanzar</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: CASO DE ESTUDIO (SANO Y PUNTO METRICS) */}
        {currentSlide === 1 && (
          <div className="max-w-5xl w-full flex flex-col animate-fade-in">
            <span className="text-emerald-400 text-xs font-mono tracking-widest uppercase mb-2">// 01. EL IMPACTO REAL</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-10">
              Caso de Estudio: Sano y Punto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                <div className="text-xs text-zinc-500 font-mono mb-6 uppercase tracking-wider">// COMUNIDAD</div>
                <div className="text-6xl font-black text-emerald-400 tracking-tighter mb-4 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.15)]">+18K</div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Seguidores calificados y altamente activos ganados en redes sociales en los últimos 3 meses.
                </p>
              </div>

              {/* Card 2 */}
              <div className="backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full"></div>
                <div className="text-xs text-zinc-500 font-mono mb-6 uppercase tracking-wider">// ALCANCE ORGÁNICO</div>
                <div className="text-6xl font-black text-purple-400 tracking-tighter mb-4 filter drop-shadow-[0_0_10px_rgba(192,132,252,0.15)]">1.5M+</div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Reproducciones en Reels/Shorts creados con IA sin invertir ni un centavo en pauta de anuncios.
                </p>
              </div>

              {/* Card 3 */}
              <div className="backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
                <div className="text-xs text-zinc-500 font-mono mb-6 uppercase tracking-wider">// CONVERSIÓN EN APP</div>
                <div className="text-6xl font-black text-cyan-400 tracking-tighter mb-4 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]">+2.5K</div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Descargas e inscritos reales que pasaron del video a registrarse en nuestra aplicación de nutrición.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 text-center text-zinc-400 text-sm font-light italic">
              "El éxito del tráfico orgánico radica en entender que la IA no hace magia; multiplica un buen mensaje y un buen formato."
            </div>
          </div>
        )}

        {/* SLIDE 3: EL CIMIENTO INVISIBLE */}
        {currentSlide === 2 && (
          <div className="max-w-5xl w-full flex flex-col md:flex-row gap-12 items-center animate-fade-in">
            <div className="flex-1">
              <span className="text-purple-400 text-xs font-mono tracking-widest uppercase mb-2">// 02. LA ESTRATEGIA INVISIBLE</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
                El Cimiento Invisible:<br />Oferta, Pasión y Competencia
              </h2>
              <p className="text-zinc-400 text-sm md:text-base mb-6 leading-relaxed">
                Antes de presionar el botón de grabar, debes construir una base sólida. La viralidad sin estructura es tráfico desperdiciado y aburrimiento asegurado.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mt-1 font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-zinc-200 text-sm">Nicho + Producto + Pasión</h4>
                    <p className="text-xs text-zinc-500">Debes elegir algo que te guste genuinamente. La consistencia es clave (puedes publicar 50 posts sin ver tracción). Si el nicho no te apasiona, vas a abandonar.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mt-1 font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-zinc-200 text-sm">El Target es tu Brújula (Ej. Mujeres 35-45)</h4>
                    <p className="text-xs text-zinc-500">Los frameworks de tus videos deben hablarle a sus dolores específicos (falta de tiempo, recetas rápidas). Audita que las métricas le estén llegando a ellos.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mt-1 font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-zinc-200 text-sm">Estudio de Competencia (Con y Sin IA)</h4>
                    <p className="text-xs text-zinc-500">Investiga a quienes ya tienen tracción en tu nicho. Compara sus mejores videos y extrae ganchos o estructuras para testear, en lugar de inventar al azar.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[420px] backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl flex flex-col shadow-2xl relative">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-purple-500 text-black font-extrabold text-[9px] px-3.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                CHECKLIST
              </div>
              <h3 className="font-bold text-lg text-zinc-200 mb-6 border-b border-zinc-900 pb-3 flex items-center gap-2">
                <span>📋 El Diagnóstico Inicial</span>
              </h3>
              
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                  <span className="text-zinc-500">¿Qué ofreces?</span>
                  <span className="text-emerald-400 font-bold text-right">App Sano y Punto</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                  <span className="text-zinc-500">¿Te apasiona?</span>
                  <span className="text-zinc-200 text-right">Sí, Nutrición Práctica</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                  <span className="text-zinc-500">¿Quién es el Target?</span>
                  <span className="text-zinc-200 text-right">Mujeres 35-45 años</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                  <span className="text-zinc-500">¿Competidores?</span>
                  <span className="text-purple-400 font-bold text-right">Mapeados y validados</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Regla de oro:</span>
                  <span className="text-red-400 font-bold text-right">Prueba antes de publicar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: QUÉ ES UN FRAMEWORK / LOS 3 DE INDUSTRIAS */}
        {currentSlide === 3 && (
          <div className="max-w-6xl w-full flex flex-col animate-fade-in">
            <span className="text-emerald-400 text-xs font-mono tracking-widest uppercase mb-2">// 03. EL MOTOR DE LA CONSTANCIA</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              ¿Qué es un Framework?
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-10 max-w-3xl leading-relaxed">
              No improvises ideas nuevas cada día. Apaláncate en **2 o 3 frameworks testeados y probados** donde solo varías el contenido temático dentro de esa estructura fija.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Industry 1 */}
              <div className="backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl flex flex-col relative group hover:border-emerald-500/40 transition-all duration-300 shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm mb-6 border border-emerald-500/20">
                  01
                </div>
                <h3 className="font-extrabold text-lg text-zinc-100 mb-3 tracking-wide">Belleza y Estética</h3>
                <p className="text-xs text-zinc-400 mb-6 uppercase font-mono tracking-wider">"El Ingrediente Héroe"</p>
                <div className="mt-auto space-y-2 border-t border-zinc-900 pt-4 font-mono text-[10px] text-zinc-500">
                  <div><strong className="text-zinc-400">Hook:</strong> "Si tienes [problema], deja de usar..."</div>
                  <div><strong className="text-zinc-400">Cuerpo:</strong> Mostrar textura/antes-después y activo.</div>
                  <div><strong className="text-zinc-400">CTA:</strong> "Comenta [PIEL] para enviarte la rutina."</div>
                </div>
              </div>

              {/* Industry 2 */}
              <div className="backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl flex flex-col relative group hover:border-purple-500/40 transition-all duration-300 shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm mb-6 border border-purple-500/20">
                  02
                </div>
                <h3 className="font-extrabold text-lg text-zinc-100 mb-3 tracking-wide">Moda y Ropa</h3>
                <p className="text-xs text-zinc-400 mb-6 uppercase font-mono tracking-wider">"Duelo de Outfits / Corrección"</p>
                <div className="mt-auto space-y-2 border-t border-zinc-900 pt-4 font-mono text-[10px] text-zinc-500">
                  <div><strong className="text-zinc-400">Hook:</strong> "No combines [prenda] así para..."</div>
                  <div><strong className="text-zinc-400">Cuerpo:</strong> Visualización rápido Incorrecto vs Correcto.</div>
                  <div><strong className="text-zinc-400">CTA:</strong> "Comenta [ESTILO] y te paso los links."</div>
                </div>
              </div>

              {/* Industry 3 */}
              <div className="backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl flex flex-col relative group hover:border-cyan-500/40 transition-all duration-300 shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm mb-6 border border-cyan-500/20">
                  03
                </div>
                <h3 className="font-extrabold text-lg text-zinc-100 mb-3 tracking-wide">Servicios y Consultores</h3>
                <p className="text-xs text-zinc-400 mb-6 uppercase font-mono tracking-wider">"El Rompe-Mitos / Solución"</p>
                <div className="mt-auto space-y-2 border-t border-zinc-900 pt-4 font-mono text-[10px] text-zinc-500">
                  <div><strong className="text-zinc-400">Hook:</strong> "La gran mentira que te dijeron sobre..."</div>
                  <div><strong className="text-zinc-400">Cuerpo:</strong> Hablar directo a cámara y dar 3 pasos reales.</div>
                  <div><strong className="text-zinc-400">CTA:</strong> "Comenta [GUIA] y te envío mi PDF."</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: DINAMICA INTERACTIVA - EL CONSULTORIO */}
        {currentSlide === 4 && (
          <div className="max-w-4xl w-full flex flex-col items-center animate-fade-in">
            <span className="text-purple-400 text-xs font-mono tracking-widest uppercase mb-2">// 04. INTERACCIÓN Y DEBATE</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 text-center">
              El Consultorio en Vivo
            </h2>
            <p className="text-zinc-400 text-sm md:text-base text-center mb-8 max-w-xl">
              ¡Hablemos de tus proyectos! Gira la ruleta para proponer un tema de debate en grupo.
            </p>

            {/* Question Card Box */}
            <div className="w-full max-w-xl backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-10 rounded-3xl flex flex-col items-center text-center shadow-2xl relative min-h-[300px] justify-center transition-all duration-500">
              <div className="absolute top-4 left-4 bg-zinc-900 text-zinc-400 font-mono text-[10px] px-3.5 py-1.5 rounded-full border border-zinc-800/80">
                TARJETA DE DEBATE {hotSeatIndex + 1}
              </div>
              
              <div className={`transition-all duration-300 ${isSpinning ? 'opacity-20 scale-95 blur-xs' : 'opacity-100 scale-100'}`}>
                <h3 className="text-lg font-black text-emerald-400 mb-4 uppercase tracking-widest font-mono filter drop-shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                  {hotSeatQuestions[hotSeatIndex].title}
                </h3>
                <p className="text-xl md:text-3xl font-extrabold text-zinc-100 mb-6 leading-normal px-4">
                  "{hotSeatQuestions[hotSeatIndex].question}"
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-zinc-950/60 text-xs text-zinc-500 italic max-w-md mx-auto border border-zinc-900/40">
                  <strong className="text-purple-400 not-italic font-bold">RECOMENDACIÓN: </strong> 
                  {hotSeatQuestions[hotSeatIndex].tip}
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <button 
              onClick={spinHotSeat}
              disabled={isSpinning}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-black font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-150 uppercase tracking-widest text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSpinning ? 'Girando...' : 'Girar Pregunta 🎰'}</span>
            </button>
          </div>
        )}

        {/* SLIDE 6: EL REGALO */}
        {currentSlide === 5 && (
          <div className="max-w-5xl w-full flex flex-col md:flex-row gap-12 items-center justify-center animate-fade-in">
            {/* Left Info Column */}
            <div className="flex-1 text-left">
              <span className="text-emerald-400 text-xs font-mono tracking-widest uppercase mb-2">// 05. REGALO EXCLUSIVO</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
                Obtén Mi Framework de Contenido
              </h2>
              <p className="text-zinc-400 text-sm md:text-base mb-6 leading-relaxed">
                Regístrate para probar **Sano y Punto** hoy y te enviaré directamente a tu correo el framework de ChatGPT que utilizo para generar guiones y videos virales personalizados a tu nicho.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-300 text-sm">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Estructuras de guiones probadas (Pixar Concept)</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-sm">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Prompts listos y estructurados para ChatGPT</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-sm">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Acceso anticipado a la App Sano y Punto</span>
                </div>
              </div>
              
              {/* Recursion note inside slide */}
              <div className="mt-8 p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs text-zinc-500 font-mono flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Nota: Primero manual para luego automatizar. Recursividad al poder.</span>
              </div>
            </div>

            {/* Right Form / QR Column */}
            <div className="w-full md:w-[450px] backdrop-blur-xl bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-3xl shadow-2xl relative">
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <h3 className="font-extrabold text-xl text-zinc-100 mb-2 tracking-wide">Regístrate y Descarga</h3>
                  <p className="text-zinc-500 text-xs mb-6">Completa tus datos para guardarte en la lista y enviarte la plantilla.</p>
                  
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-mono text-zinc-400 mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Tu nombre" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-950/90 border border-zinc-900 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/40 transition-all text-zinc-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-mono text-zinc-400 mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required
                      placeholder="tu@correo.com" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-950/90 border border-zinc-900 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/40 transition-all text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-mono text-zinc-400 mb-1">Usuario Instagram (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="@usuario" 
                      value={formData.instagram}
                      onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full bg-zinc-950/90 border border-zinc-900 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/40 transition-all text-zinc-200"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-500/10 active:scale-98 transition-all duration-150 uppercase tracking-widest text-xs cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Guardando en Servidor...' : 'Registrar y Recibir Regalo'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 animate-fade-in flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl mb-6">
                    🎉
                  </div>
                  <h3 className="font-extrabold text-2xl text-zinc-100 mb-2">¡Inscripción Exitosa!</h3>
                  <p className="text-zinc-400 text-sm px-4 leading-relaxed mb-6 font-light">
                    ¡Gracias, {formData.name}! Tus datos han sido guardados localmente en el servidor. Te hemos enviado el Framework a **{formData.email}**.
                  </p>
                  
                  {/* Visual QR Code */}
                  <div className="p-4 bg-white rounded-2xl w-44 h-44 flex items-center justify-center shadow-2xl relative border border-zinc-100">
                    <div className="w-full h-full border-[10px] border-zinc-900/10 flex flex-col justify-between p-2 relative">
                      <div className="flex justify-between">
                        <div className="w-9 h-9 border-4 border-black"></div>
                        <div className="w-9 h-9 border-4 border-black"></div>
                      </div>
                      <div className="absolute inset-0 m-auto w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white text-[9px] font-black tracking-widest">
                        SANO
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-9 h-9 border-4 border-black"></div>
                        <div className="border border-zinc-900/15 flex flex-wrap gap-1 p-0.5 w-9 h-9">
                          <div className="w-1 h-1 bg-black"></div>
                          <div className="w-2.5 h-1 bg-black"></div>
                          <div className="w-1.5 h-2.5 bg-black"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-mono mt-4 uppercase tracking-widest">Escanea para ir a la Web App</p>
                  <p className="text-[9px] text-emerald-400 font-mono mt-2">Leads totales en base de datos: {leadsCount}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </section>

      {/* Navigation Controls Bar */}
      <footer className="px-8 py-5 flex justify-between items-center z-10 border-t border-zinc-900/60 bg-zinc-950/60 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-purple-500/20"></div>
        
        <div className="flex gap-4">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="w-11 h-11 rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800/80 transition-all cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentSlide === SLIDES_COUNT - 1}
            className="w-11 h-11 rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800/80 transition-all cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md mx-8 h-1.5 bg-zinc-900/85 rounded-full overflow-hidden border border-zinc-900 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / SLIDES_COUNT) * 100}%` }}
          ></div>
        </div>

        <div className="text-[10px] font-mono text-zinc-500 hidden md:block uppercase tracking-wider">
          Flechas de teclado <strong>←</strong> / <strong>→</strong> o <strong>Espacio</strong> para navegar
        </div>
      </footer>

      {/* Styles Injection for Fade Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </main>
  );
}
