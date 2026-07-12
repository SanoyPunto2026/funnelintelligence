"use client";

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearData = () => {
    if (confirm('¿Estás seguro de eliminar todos los datos locales? Esto borrará el dashboard actual.')) {
      localStorage.removeItem('trd_uploaded_data');
      if (window.updateData) window.updateData({ clients: [], leads: [], ads: [] });
      showToast('Datos eliminados correctamente.');
    }
  };

  useEffect(() => {
    window.clearApp = clearData;
    // Inject the legacy logic after the component mounts
    const script = document.createElement('script');
    script.src = '/legacy/trd-logic.js';
    script.async = true;
    script.onload = () => {
      // Load initial data from localStorage
      loadLocalData();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadLocalData = () => {
    try {
      const local = localStorage.getItem('trd_uploaded_data');
      if (local) {
        const json = JSON.parse(local);
        if (window.updateData) {
          window.updateData(json);
        } else {
          window.DATA = json;
          if (window.renderAll) window.renderAll();
        }
      } else {
        if (window.updateData) window.updateData({ clients: [] });
      }
      setDataLoaded(true);
    } catch (e) {
      console.error('Error loading local data:', e);
      if (window.updateData) window.updateData({ clients: [] });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const defaultClientName = file.name.replace(/\.[^/.]+$/, "").replace(/^Export_Contacts_/, "");
    const clientName = prompt("Ingresa el nombre de este cliente para asociar sus métricas:", defaultClientName);
    if (clientName === null) {
      e.target.value = ''; // Cancelled
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'all');
    formData.append('clientName', clientName.trim());

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const result = await res.json();
        
        // Merge logic
        const newData = result.data;
        const existingRaw = localStorage.getItem('trd_uploaded_data');
        let mergedData = newData;

        if (existingRaw) {
          try {
            const existing = JSON.parse(existingRaw);
            const clients = [...(existing.clients || [])];
            (newData.clients || []).forEach(c => {
               if (!clients.find(ec => ec.client === c.client)) clients.push(c);
            });
            const leads = [...(existing.leads || []), ...(newData.leads || [])];
            const ads = [...(existing.ads || []), ...(newData.ads || [])];
            mergedData = { clients, leads, ads };
          } catch(e) {}
        }

        localStorage.setItem('trd_uploaded_data', JSON.stringify(mergedData));
        showToast("Archivo '" + (result.fileName || "Cargado") + "' procesado con " + (newData.leads ? newData.leads.length : 0) + " leads nuevos.");
        if (window.updateData) {
          window.updateData(mergedData);
        }
      } else {
        showToast('Error al subir archivo', 'error');
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
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
          <button class="learn-toggle" id="uploadBtn" onclick="window.openUploadModal()"><i class="ph ph-download-simple"></i> Cargar CSV/Excel</button>
          <button class="learn-toggle" id="clearBtn" onclick="window.clearApp()" style="background:#ef4444;border-color:#ef4444"><i class="ph ph-trash"></i> Eliminar Datos</button>
          <div class="pill" onclick="showView('ai')" style="cursor:pointer;"><i class="ph-fill ph-brain"></i> Ask TRD AI</div>
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
      {uploading && <div style={{position: 'fixed', bottom: 20, right: 20, background: '#3b82f6', color: 'white', padding: '15px 20px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>Procesando archivo...</div>}
      {toast && <div style={{position: 'fixed', bottom: 20, right: 20, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '15px 20px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>{toast.message}</div>}
    </>
  );
}
