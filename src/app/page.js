"use client";

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const containerRef = useRef(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Inject the legacy logic after the component mounts
    const script = document.createElement('script');
    script.src = '/legacy/trd-logic.js';
    script.async = true;
    script.onload = () => {
      // Fetch initial data
      fetchData();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (window.updateData) {
          window.updateData(json);
        } else {
          window.DATA = json;
          if (window.renderAll) window.renderAll();
        }
      } else {
        if (window.updateData) {
          window.updateData({ clients: [] });
        } else {
          window.DATA = { clients: [] };
          if (window.renderAll) window.renderAll();
        }
      }
      setDataLoaded(true);
    } catch (e) {
      console.error('Error fetching data:', e);
      if (window.updateData) window.updateData({ clients: [] });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'all');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('Archivo subido exitosamente. Refrescando datos...');
        await fetchData();
      } else {
        alert('Error al subir archivo');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const htmlString = `
    <div class="app">
    <aside class="sidebar">
      <div class="brand"><div class="logo"><i class="ph-fill ph-funnel" style="font-size:24px;color:white;"></i></div><div><h1>Funnel Intelligence</h1><p>TRD Analytics</p></div></div>
      <div class="nav">
        <button class="active" onclick="showView('action')"><i class="ph ph-house"></i><i class="ph-fill ph-house"></i> Action Center</button>
        <button onclick="showView('agency')"><i class="ph ph-stethoscope"></i><i class="ph-fill ph-stethoscope"></i> Agency Health</button>
        <button onclick="showView('engine')"><i class="ph ph-gear"></i><i class="ph-fill ph-gear"></i> Health Engine</button>
        <button onclick="showView('clients')"><i class="ph ph-users"></i><i class="ph-fill ph-users"></i> Clients</button>
        <button onclick="showView('client')"><i class="ph ph-clipboard-text"></i><i class="ph-fill ph-clipboard-text"></i> Client Workspace</button>
        <button onclick="showView('ads')"><i class="ph ph-trend-up"></i><i class="ph-fill ph-trend-up"></i> Ad Intelligence</button>
        <button onclick="showView('leads')"><i class="ph ph-target"></i><i class="ph-fill ph-target"></i> Lead Explorer</button>
        <button onclick="showView('risks')"><i class="ph ph-warning"></i><i class="ph-fill ph-warning"></i> Risks</button>
        <button onclick="showView('alerts')"><i class="ph ph-bell"></i><i class="ph-fill ph-bell"></i> Alert Engine</button>
        <button onclick="showView('opportunities')"><i class="ph ph-lightbulb"></i><i class="ph-fill ph-lightbulb"></i> Opportunities</button>
        <button onclick="showView('ai')"><i class="ph ph-brain"></i><i class="ph-fill ph-brain"></i> AI Analyst</button>
        <button onclick="showView('academy')"><i class="ph ph-book"></i><i class="ph-fill ph-book"></i> Academy</button>
      </div>
    </aside>
    <main class="main">
      <div class="topbar">
        <div class="title"><h2 id="pageTitle">Action Center</h2><p id="pageSubtitle">Prioridades y decisiones del día.</p></div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button class="learn-toggle" id="uploadBtn" onclick="document.querySelector('input[type=\\'file\\']').click()"><i class="ph ph-download-simple"></i> Cargar CSV/Excel</button>
          <button class="learn-toggle" onclick="toggleLearning()"><i class="ph ph-graduation-cap"></i> Learning Mode</button>
          <div class="pill"><i class="ph-fill ph-brain"></i> Ask TRD AI</div>
        </div>
      </div>
      <section id="view-action" class="view"></section>
      <section id="view-academy" class="view hidden"></section>
      <section id="view-agency" class="view hidden"></section>
      <section id="view-engine" class="view hidden"></section>
      <section id="view-clients" class="view hidden"></section>
      <section id="view-client" class="view hidden"></section>
      <section id="view-ads" class="view hidden"></section>
      <section id="view-leads" class="view hidden"></section>
      <section id="view-risks" class="view hidden"></section>
      <section id="view-alerts" class="view hidden"></section>
      <section id="view-opportunities" class="view hidden"></section>
      <section id="view-ai" class="view hidden"></section>
    </main>
    </div>
  `;

  useEffect(() => {
    // Attach event listener to our custom upload button dynamically injected
    const btn = document.getElementById('uploadBtn');
    if (btn) {
      btn.onclick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
      };
    }
  }, []); // This runs after component mounts

  return (
    <>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: htmlString }} suppressHydrationWarning />
      <input 
        type="file" 
        accept=".csv, .xlsx, .xls" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      {uploading && <div style={{position: 'fixed', bottom: 20, right: 20, background: '#10b981', color: 'white', padding: '10px', borderRadius: '8px', zIndex: 9999}}>Subiendo archivo...</div>}
    </>
  );
}
