"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

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
    window.openUploadModal = () => {
      if (fileInputRef.current) fileInputRef.current.click();
    };

    // Inject legacy script
    const script = document.createElement('script');
    script.src = '/legacy/trd-logic.js';
    script.async = true;
    script.onload = () => {
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

  const navigateTo = (view, path) => {
    router.push(path);
  };

  const activePath = pathname || '/action-center';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo"><i className="ph-fill ph-funnel" style={{fontSize:'24px',color:'white'}}></i></div>
          <div><h1>Funnel Intelligence</h1><p>TRD Analytics</p></div>
        </div>
        <div className="nav">
          <button className={activePath === '/action-center' ? 'active' : ''} onClick={() => navigateTo('action', '/action-center')}><i className="ph ph-house"></i><i className="ph-fill ph-house"></i> Action Center</button>
          <button className={activePath === '/agency-health' ? 'active' : ''} onClick={() => navigateTo('agency', '/agency-health')}><i className="ph ph-stethoscope"></i><i className="ph-fill ph-stethoscope"></i> Agency Health</button>
          <button className={activePath === '/health-engine' ? 'active' : ''} onClick={() => navigateTo('engine', '/health-engine')}><i className="ph ph-gear"></i><i className="ph-fill ph-gear"></i> Health Engine</button>
          <button className={activePath === '/clients' || activePath === '/client-workspace' ? 'active' : ''} onClick={() => navigateTo('clients', '/clients')}><i className="ph ph-users"></i><i className="ph-fill ph-users"></i> Clients</button>
          <button className={activePath === '/ad-intelligence' ? 'active' : ''} onClick={() => navigateTo('ads', '/ad-intelligence')}><i className="ph ph-trend-up"></i><i className="ph-fill ph-trend-up"></i> Ad Intelligence</button>
          <button className={activePath === '/lead-explorer' ? 'active' : ''} onClick={() => navigateTo('leads', '/lead-explorer')}><i className="ph ph-target"></i><i className="ph-fill ph-target"></i> Lead Explorer</button>
          <button className={activePath === '/alert-engine' ? 'active' : ''} onClick={() => navigateTo('alerts', '/alert-engine')}><i className="ph ph-bell"></i><i className="ph-fill ph-bell"></i> Alert Engine</button>
        </div>
        <div id="sidebar-widget" style={{marginTop: 'auto', paddingTop: '20px'}}></div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="title"><h2 id="pageTitle">Action Center</h2><p id="pageSubtitle">Prioridades y decisiones del día.</p></div>
          <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
            <button className="learn-toggle" id="uploadBtn" onClick={() => window.openUploadModal()}><i className="ph ph-download-simple"></i> Cargar CSV/Excel</button>
            <button className="learn-toggle" id="clearBtn" onClick={clearData} style={{background:'#ef4444',borderColor:'#ef4444'}}><i className="ph ph-trash"></i> Eliminar Datos</button>

          </div>
        </div>
        
        {children}
        
        <section id="view-action" className="view hidden"></section>
        <section id="view-agency" className="view hidden"></section>
        <section id="view-engine" className="view hidden"></section>
        <section id="view-clients" className="view hidden"></section>
        <section id="view-client" className="view hidden"></section>
        <section id="view-ads" className="view hidden"></section>
        <section id="view-leads" className="view hidden"></section>
        <section id="view-alerts" className="view hidden"></section>
        
      </main>

      <input 
        type="file" 
        accept=".csv, .xlsx, .xls" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      {uploading && <div style={{position: 'fixed', bottom: 20, right: 20, background: '#3b82f6', color: 'white', padding: '15px 20px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>Procesando archivo...</div>}
      {toast && <div style={{position: 'fixed', bottom: 20, right: 20, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '15px 20px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>{toast.message}</div>}
    </div>
  );
}
