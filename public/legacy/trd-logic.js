let DATA = window.DATA || {};

let RAW_DATE_DATA = {
  client_configs: [],
  raw_leads: [],
  raw_ads: [],
  available_start: "2026-05-01",
  available_end: "2026-06-01"
};

window.updateData = function(newData) { 
  if (!newData) return;
  
  // Si no hay datos, limpiamos y mostramos el Empty State
  if (!newData.clients || newData.clients.length === 0) {
    DATA = { clients: [], leads: [], ads: [] };
    if (typeof showEmptyState === 'function') {
      showEmptyState(window.activeViewId || 'view-action');
    }
    return;
  }
  
  DATA = newData;
  
  if (newData.clients || newData.leads || newData.ads) {
    RAW_DATE_DATA = {
      client_configs: newData.clients || [],
      raw_leads: newData.leads || [],
      raw_ads: newData.ads || []
    };
    
    // Calculate dynamic dates from leads
    let dates = RAW_DATE_DATA.raw_leads.map(l => l.created_date).filter(Boolean).sort();
    if (dates.length > 0) {
      RAW_DATE_DATA.available_start = dates[0];
      RAW_DATE_DATA.available_end = dates[dates.length - 1];
    } else {
      RAW_DATE_DATA.available_start = "2026-05-01";
      RAW_DATE_DATA.available_end = "2026-05-31";
    }
  }

  PERIOD_META.available_start = RAW_DATE_DATA.available_start;
  PERIOD_META.available_end = RAW_DATE_DATA.available_end;
  
  dateRange.start = RAW_DATE_DATA.available_start;
  dateRange.end = RAW_DATE_DATA.available_end;
  saveDateRange();

  renderAll(); 
};

let selectedClient = "";
function safeJSONParse(val, def) { try { return JSON.parse(val) || def; } catch(e) { return def; } }
let selectedAdsClient = "Todos", selectedLeadsClient = "Todos", currentClientTab = "pipeline";
let adsClassFilter = "Todos";
let adsSortMode = "health";
let creativeTypeFilter = "Todos";
let creativeTypeOverrides = safeJSONParse(localStorage.getItem("trd_creative_types"), {});
let selectedCompareAds = safeJSONParse(localStorage.getItem("trd_compare_ads"), []);
let selectedAdDrilldown = null;
let learningMode = localStorage.getItem("trd_learning_mode")==="true";
let PERIOD_META = {available_start:RAW_DATE_DATA.available_start,available_end:RAW_DATE_DATA.available_end,source_note:"Los datos CRM se filtran por fecha real de creación. Meta Ads está prorrateado/modelado porque el export actual no trae breakdown diario."};
let dateRange = safeJSONParse(localStorage.getItem("trd_date_range"), null) || {
  preset: "may_2026",
  start: PERIOD_META.available_start,
  end: PERIOD_META.available_end,
  compare: true
};
let currencySettings = JSON.parse(localStorage.getItem("trd_currency_settings") || "null") || {
  base: "USD",
  rates: { USD: 1, COP: 4000, EUR: 1.08 }
};
let engineWeights = JSON.parse(localStorage.getItem('trd_engine_weights') || 'null') || {
  appointment: 35,
  movement: 25,
  activity: 15,
  attribution: 15,
  acquisition: 10
};
const engineLabels = {
  appointment: "Tasa de Agendamiento",
  movement: "Tasa de Avance del Embudo",
  activity: "Tasa de Leads Activos",
  attribution: "Calidad de Atribución",
  acquisition: "Tasa de Contactabilidad"
};
function saveEngineWeights(){ localStorage.setItem('trd_engine_weights', JSON.stringify(engineWeights)); }

function viewHTML(id, content){ const el=document.getElementById(id); if(el) el.innerHTML=content; }
function scoreCategory(score){ return score>=85?'Elite':score>=70?'Healthy':score>=50?'Emerging':'Broken'; }
function activeScore(c){ return c.engine_score ?? c.score; }
function activeCategory(c){ return c.engine_category ?? c.category; }
function activeAgencyScore(){ return DATA.benchmarks.engine_agency_health_score ?? DATA.benchmarks.agency_health_score; }
function activeAgencyCategory(){ return DATA.benchmarks.engine_agency_category ?? DATA.benchmarks.agency_category; }

function tip(key){
  const tips={
    agency:"Mide la salud promedio de todos los clientes de TRD. Ayuda a saber si la operación general está mejorando o empeorando.",
    funnelScore:"Puntaje de 0 a 100 que resume la salud del funnel usando agendamiento, avance de CRM, leads activos, atribución y contactabilidad.",
    appointment:"Porcentaje de leads CRM que llegaron a una cita (agendados / leads totales).",
    movement:"Porcentaje de leads que salieron de la etapa inicial 'Lead Nuevo' y registraron avance en el CRM.",
    activity:"Porcentaje de leads con interacción o gestión comercial reciente para prevenir el abandono.",
    attribution:"Porcentaje de leads vinculados a campañas o anuncios de Meta Ads.",
    acquisition:"Porcentaje de leads que cuentan con datos de contacto completos (teléfono y correo) para contactabilidad.",
    bottleneck:"La etapa o métrica que más limita el rendimiento del funnel.",
    leakage:"Cantidad o porcentaje de leads que no avanzan de una etapa a otra.",
    progression:"Muestra cuántos leads alcanzaron cada etapa comercial y qué porcentaje se perdió entre pasos.",
    crmLeads:"Leads capturados dentro de Leadtion/CRM. Es la base principal para medir conversión comercial.",
    metaResults:"Resultados reportados por Meta Ads. Pueden diferir de CRM Leads por duplicados, orgánico, formularios o problemas de atribución.",
    reachedStage:"Cantidad de leads que alcanzaron esta etapa. No necesariamente significa que estén actualmente en esa etapa.",
    previousStep:"Porcentaje que avanzó desde la etapa anterior hacia esta etapa.",
    crmAccumulated:"Porcentaje de todos los leads CRM que alcanzaron esta etapa.",
    metaAccumulated:"Porcentaje de todos los resultados Meta que alcanzaron esta etapa.",
    lostStep:"Leads que no avanzaron desde la etapa anterior.",
    healthEngine:"Motor configurable que permite cambiar el peso de cada métrica para recalcular el score de clientes y agencia.",
    weight:"Peso que define cuánta importancia tiene una métrica dentro del Funnel Health Score.",
    engineScore:"Score recalculado con los pesos actuales del Health Engine.",
    engineDelta:"Diferencia entre el score original y el score recalculado por el motor.",
    engineBottleneck:"Componente con peor desempeño dentro del score activo.",
    engineStrength:"Componente con mejor desempeño dentro del score activo.",
    eliteWinner:"Anuncio con buen volumen y buena generación de citas. Es candidato para escalar o usar como referencia.",
    funnelWinner:"Anuncio que genera citas o avance comercial, aunque no necesariamente sea el de mayor volumen.",
    volumeWinner:"Anuncio que genera muchos leads, pero pocas citas. Puede necesitar mejor filtro o seguimiento comercial.",
    needsReview:"Anuncio sin suficiente evidencia comercial o con bajo desempeño. Debe revisarse antes de escalar.",
    noCrm:"Meta registra resultados, pero no hay match claro dentro del CRM. Puede ser problema de naming, UTM o exportación.",
    alert:"Señal automática que indica riesgo, caída, atribución rota o fuga fuerte.",
    criticalAlert:"Alerta de alto impacto. Requiere revisión prioritaria porque puede afectar citas, seguimiento o retención del cliente.",
    warningAlert:"Alerta preventiva. No necesariamente es crítica, pero conviene revisarla antes de que escale.",
    agencyMatrix:"Matriz de salud base. Muestra métricas operativas de agencia, no necesariamente el score recalculado por pesos.",
    dataModeled:"Dato calculado o inferido con la información disponible. No debe interpretarse como dato 100% oficial del CRM.",
    dataMissing:"Dato que todavía no viene en los exports actuales y se debe pedir a Leadtion/API.",
    dataCrossed:"Dato obtenido al cruzar Meta Ads con Leadtion CRM.",
    appointmentRateAd:"Porcentaje de leads CRM de un anuncio que terminaron en cita.",
    costPerUnit:"Costo promedio por resultado dentro de una etapa. Sirve para entender eficiencia económica del funnel.",
    opportunitySimulator:"Simula cuántas citas adicionales podría generar un cliente si alcanzara el benchmark promedio de TRD.",
    leadRisk:"Clasificación simple del riesgo del lead según actividad, etapa o estado modelado.",
    academy:"Guía interna para que el equipo entienda conceptos, métricas y casos de interpretación del sistema.",
    dateRange:"Controla el periodo de análisis del dashboard. Para históricos reales se deben cargar exports por fecha o conectar APIs.",
    comparePeriod:"Compara el periodo actual contra el periodo anterior equivalente. En esta versión queda preparado como mecánica MVP.",
    currency:"Normaliza costos entre monedas. Los datos originales se conservan por cliente y se convierten solo para totales globales.",
    exchangeRate:"Tasa usada para convertir COP/EUR a la moneda base. En MVP es editable manualmente; luego debería venir de una API."
  };
  return `<span class="help-icon" data-tip="${tips[key]||'Concepto del sistema Funnel Health.'}">?</span>`;
}
function updateLearningButton(){
  document.querySelectorAll('.learn-toggle').forEach(btn=>{
    if(btn.id === 'uploadBtn' || btn.id === 'clearBtn') return;
    if(btn.textContent.includes('Learning') || btn.textContent.includes('graduation')){
      btn.innerHTML = learningMode ? '<i class="ph ph-graduation-cap"></i> Learning Mode: ON' : '<i class="ph ph-graduation-cap"></i> Learning Mode: OFF';
      btn.classList.toggle('active', learningMode);
    }
  });
}

function getLatestLeadDate() {
  if (!DATA.leads || DATA.leads.length === 0) return new Date().toISOString().split('T')[0];
  const dates = DATA.leads.map(l => {
    // Some entries might have created_date as string, let's extract it
    return l.created_date;
  }).filter(Boolean);
  if (dates.length === 0) return new Date().toISOString().split('T')[0];
  return dates.sort().pop();
}

function saveDateRange(){ localStorage.setItem("trd_date_range", JSON.stringify(dateRange)); }
function setDatePreset(preset){
  const latestDateStr = getLatestLeadDate();
  const latest = new Date(latestDateStr + "T12:00:00"); // Use noon to avoid timezone shifts
  
  if (preset === "last_7") {
    const start = new Date(latest);
    start.setDate(latest.getDate() - 6);
    dateRange = { ...dateRange, preset, start: start.toISOString().split('T')[0], end: latestDateStr };
  } else if (preset === "last_15") {
    const start = new Date(latest);
    start.setDate(latest.getDate() - 14);
    dateRange = { ...dateRange, preset, start: start.toISOString().split('T')[0], end: latestDateStr };
  } else if (preset === "last_30") {
    const start = new Date(latest);
    start.setDate(latest.getDate() - 29);
    dateRange = { ...dateRange, preset, start: start.toISOString().split('T')[0], end: latestDateStr };
  } else if (preset === "month") {
    dateRange = { ...dateRange, preset, selectedMonth: dateRange.selectedMonth || "Julio" };
  } else if (preset === "custom") {
    dateRange = { ...dateRange, preset };
  }
  saveDateRange();
  renderAll();
}
window.setSelectedMonth = function(month) {
  dateRange.selectedMonth = month;
  saveDateRange();
  renderAll();
};
function setDateStart(v){ dateRange.start=v; dateRange.preset="custom"; saveDateRange(); renderAll(); }
function setDateEnd(v){ dateRange.end=v; dateRange.preset="custom"; saveDateRange(); renderAll(); }
function toggleCompare(){ dateRange.compare=!dateRange.compare; saveDateRange(); renderAll(); }
function currentPeriodLabel(){ return `${dateRange.start} → ${dateRange.end}`; }
function isInvalidDateRange(){ return dateRange.start>dateRange.end; }
function isRangeFullyAvailable(){ return dateRange.start>=PERIOD_META.available_start && dateRange.end<=PERIOD_META.available_end; }
function rangeLeadCount(){ return typeof RAW_DATE_DATA==='undefined'?null:rawFilteredLeads().length; }

function renderDateController(){
  const isCustom = dateRange.preset === "custom";
  const isMonth = dateRange.preset === "month";
  return `<div class="date-controller" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:8px 12px; border-radius:12px; margin-bottom:16px;">
    <span style="font-size:13px; font-weight:500; color:#fff;"><i class="ph ph-calendar" style="vertical-align:middle; margin-right:4px;"></i> Periodo:</span>
    <select onchange="setDatePreset(this.value)" style="padding:6px 12px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; cursor:pointer;">
      <option value="last_7" ${dateRange.preset==="last_7"?"selected":""}>Últimos 7 días</option>
      <option value="last_15" ${dateRange.preset==="last_15"?"selected":""}>Últimos 15 días</option>
      <option value="last_30" ${dateRange.preset==="last_30"?"selected":""}>Últimos 30 días</option>
      <option value="month" ${dateRange.preset==="month"?"selected":""}>Por Mes</option>
      <option value="custom" ${dateRange.preset==="custom"?"selected":""}>Personalizado</option>
    </select>
    
    <div id="month-select-container" style="display:${isMonth ? 'block' : 'none'};">
      <select onchange="setSelectedMonth(this.value)" style="padding:6px 12px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; cursor:pointer;">
        <option value="Enero" ${dateRange.selectedMonth==="Enero"?"selected":""}>Enero</option>
        <option value="Febrero" ${dateRange.selectedMonth==="Febrero"?"selected":""}>Febrero</option>
        <option value="Marzo" ${dateRange.selectedMonth==="Marzo"?"selected":""}>Marzo</option>
        <option value="Abril" ${dateRange.selectedMonth==="Abril"?"selected":""}>Abril</option>
        <option value="Mayo" ${dateRange.selectedMonth==="Mayo"?"selected":""}>Mayo</option>
        <option value="Junio" ${dateRange.selectedMonth==="Junio"?"selected":""}>Junio</option>
        <option value="Julio" ${dateRange.selectedMonth==="Julio" || !dateRange.selectedMonth ?"selected":""}>Julio</option>
        <option value="Agosto" ${dateRange.selectedMonth==="Agosto"?"selected":""}>Agosto</option>
        <option value="Septiembre" ${dateRange.selectedMonth==="Septiembre"?"selected":""}>Septiembre</option>
        <option value="Octubre" ${dateRange.selectedMonth==="Octubre"?"selected":""}>Octubre</option>
        <option value="Noviembre" ${dateRange.selectedMonth==="Noviembre"?"selected":""}>Noviembre</option>
        <option value="Diciembre" ${dateRange.selectedMonth==="Diciembre"?"selected":""}>Diciembre</option>
      </select>
    </div>
    
    <div id="custom-date-range-inputs" style="display:${isCustom ? 'flex' : 'none'}; align-items:center; gap:8px;">
      <label style="font-size:12px; color:#94a3b8;">Desde</label>
      <input type="date" value="${dateRange.start}" onchange="setDateStart(this.value)" style="padding:6px 10px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff;">
      <label style="font-size:12px; color:#94a3b8;">Hasta</label>
      <input type="date" value="${dateRange.end}" onchange="setDateEnd(this.value)" style="padding:6px 10px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff;">
    </div>
    
    <span class="date-pill" style="margin-left:auto; font-size:12px;">Rango activo: ${isMonth ? (dateRange.selectedMonth || 'Julio') : (dateRange.start + ' a ' + dateRange.end)}</span>
  </div>
  ${!isMonth && isInvalidDateRange()?`<div class="historical-note"><strong>Rango inválido:</strong> La fecha inicial no puede ser mayor que la fecha final.</div>`:''}`;
}
function pseudoTrend(value, seed=1){
  const base=Number(value||0);
  const factor=((seed*17)%9 - 4) / 100;
  const previous=base/(1+factor || 1);
  const delta=base-previous;
  return {previous,delta,deltaPct:previous?delta/previous:0};
}
function trendHTML(value, seed=1){
  if(!dateRange.compare) return "";
  const t=pseudoTrend(value,seed);
  const cls=t.deltaPct>0?'compare-up':t.deltaPct<0?'compare-down':'compare-flat';
  return `<div class="${cls} small">${t.deltaPct>=0?'+':''}${fmtPct(t.deltaPct)} vs periodo anterior</div>`;
}

function toggleLearning(){
  learningMode=!learningMode;
  localStorage.setItem("trd_learning_mode", String(learningMode));
  document.body.classList.toggle("learning-on", learningMode);
  updateLearningButton();
  renderAll();
}



const fmtNum = v => new Intl.NumberFormat('es-CO').format(Math.round(v||0));
const fmtPct = v => ((v||0)*100).toFixed(1)+"%";
function money(v,c){
  if(v===null || v===undefined || Number.isNaN(Number(v))) return "";
  if(c==="COP") return "$"+fmtNum(Number(v))+" COP";
  if(c==="EUR") return "â‚¬"+Number(v).toFixed(2)+" EUR";
  return "$"+Number(v).toFixed(2)+" USD";
}
function convertCurrency(value, from, to){
  const v=Number(value||0);
  if(!from || !to || from===to) return v;
  const rates=currencySettings.rates || {USD:1,COP:4000,EUR:1.08};
  const usd = from==="USD" ? v : from==="COP" ? v/(rates.COP||4000) : from==="EUR" ? v*(rates.EUR||1.08) : v;
  if(to==="USD") return usd;
  if(to==="COP") return usd*(rates.COP||4000);
  if(to==="EUR") return usd/(rates.EUR||1.08);
  return usd;
}
function moneyBase(value){ return money(value,currencySettings.base); }
function moneyNormalized(value, from){
  const converted=convertCurrency(value,from,currencySettings.base);
  if(from && from!==currencySettings.base){
    return `${money(converted,currencySettings.base)}<span class="money-original">${money(value,from)} original</span>`;
  }
  return money(value,currencySettings.base);
}
function saveCurrencySettings(){ localStorage.setItem("trd_currency_settings", JSON.stringify(currencySettings)); }
function setBaseCurrency(v){ currencySettings.base=v; saveCurrencySettings(); renderAll(); }
function setRate(cur,v){ currencySettings.rates[cur]=Number(v)||currencySettings.rates[cur]; saveCurrencySettings(); renderAll(); }
function currenciesInUse(){
  return [...new Set((DATA.clients||[]).map(c=>c.currency).filter(Boolean))];
}
function hasMixedCurrencies(){ return currenciesInUse().length>1; }
function renderCurrencyController(){
  return "";
}
function spendByCurrency(items){
  const grouped={};
  (items||[]).forEach(x=>{const c=x.currency||"USD";grouped[c]=(grouped[c]||0)+Number(x.spend||0);});
  return grouped;
}
function currencySplitHTML(items){
  const grouped=spendByCurrency(items);
  const keys=Object.keys(grouped);
  if(keys.length<=1) return "";
  return `<div class="currency-split">${keys.map(k=>`<div class="currency-box"><strong>${money(grouped[k],k)}</strong><div class="label">Gasto original ${k}</div></div>`).join('')}</div>`;
}
const cBy = n => (DATA.clients||[]).find(c=>c.client===n) || (DATA.clients||[])[0] || {client:'',leads:0,appointments:0,moved:0,active:0,attributed:0,stagnant:0,workflow:0,used_button:0,waiting:0,discarded_inferred:0,custom_data:0,appointment_rate:0,movement_rate:0,crm_activity:0,attribution_quality:0,meta_results:0,spend:0,avg_cpl:0,ads_count:0,score:0,category:'Emerging',main_problem:'Sin datos',appointment_score:0,movement_score:0,activity_score:0,attribution_score:0,acquisition_score:0,currency:'USD',engine_score:0,engine_category:'Emerging',engine_bottleneck:'appointment',engine_strength:'appointment'};
const fiBy = n => DATA.funnel_intelligence.find(f=>f.client===n);
const pfBy = n => DATA.progression_funnels.find(f=>f.client===n);
const safePct = v => (v===null || v===undefined || Number.isNaN(v)) ? '-' : fmtPct(v);
const safeNum = v => (v===null || v===undefined || Number.isNaN(v)) ? '-' : fmtNum(v);
const adsBy = n => DATA.ads.filter(a=>a.client===n);
const leadsBy = n => DATA.leads.filter(l=>l.client===n);
const dotCat = cat => cat==="Broken"?"red":cat==="Emerging"?"yellow":cat==="Elite"?"green":"purple";
const hClass = h => h==="green"?"h-green":h==="yellow"?"h-yellow":h==="red"?"h-red":"h-neutral";
const hTxt = h => h==="green"?"Saludable":h==="yellow"?"En riesgo":h==="red"?"Crítico":"Pendiente";
window.openUploadModal = function() {
  let modal = document.getElementById('upload-modal-container');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'upload-modal-container';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(3, 7, 18, 0.85)';
  modal.style.backdropFilter = 'blur(12px)';
  modal.style.zIndex = '100000';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  
  modal.innerHTML = `
    <div style="background:#0b0f19; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:32px; width:450px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.7); font-family:'Inter', sans-serif; position:relative; color:#eef2ff;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="font-size:20px; font-weight:700; color:#fff; margin:0;">Cargar Reporte Leadtion</h3>
        <button onclick="document.getElementById('upload-modal-container').remove()" style="background:transparent; border:none; color:#94a3b8; font-size:24px; cursor:pointer; line-height:1;">&times;</button>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:18px; margin-bottom:24px;">
        <div>
          <label style="display:block; font-size:13px; color:#94a3b8; margin-bottom:8px; font-weight:600;">Nombre del Cliente</label>
          <input type="text" id="modal-client-name" placeholder="Ej: Andrea / Julio Proyectos" style="width:100%; padding:12px; border-radius:12px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none; box-sizing:border-box;">
        </div>
        
        <div>
          <label style="display:block; font-size:13px; color:#94a3b8; margin-bottom:8px; font-weight:600;">Mes del Reporte</label>
          <select id="modal-report-month" style="width:100%; padding:12px; border-radius:12px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none; box-sizing:border-box; cursor:pointer;">
            <option value="Enero">Enero</option>
            <option value="Febrero">Febrero</option>
            <option value="Marzo">Marzo</option>
            <option value="Abril">Abril</option>
            <option value="Mayo">Mayo</option>
            <option value="Junio">Junio</option>
            <option value="Julio" selected>Julio</option>
            <option value="Agosto">Agosto</option>
            <option value="Septiembre">Septiembre</option>
            <option value="Octubre">Octubre</option>
            <option value="Noviembre">Noviembre</option>
            <option value="Diciembre">Diciembre</option>
          </select>
        </div>
        
        <div id="modal-file-info" style="display:none; padding:14px; border-radius:12px; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2); color:#bae6fd; font-size:13px; line-height:1.4; word-break:break-all;">
          <strong>Archivo seleccionado:</strong> <span id="modal-file-name"></span>
        </div>
      </div>
      
      <input type="file" id="modal-file-input" accept=".csv, .xlsx, .xls" style="display:none;">
      
      <div style="display:flex; gap:12px;">
        <button id="modal-select-file-btn" style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:14px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s;">
          Seleccionar Archivo
        </button>
        <button id="modal-upload-btn" style="flex:1; background:#3b82f6; border:none; color:#fff; padding:14px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; opacity:0.5; transition:all 0.2s;" disabled>
          Subir y Cargar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const fileInput = document.getElementById('modal-file-input');
  const selectBtn = document.getElementById('modal-select-file-btn');
  const uploadBtn = document.getElementById('modal-upload-btn');
  const fileInfo = document.getElementById('modal-file-info');
  const fileNameSpan = document.getElementById('modal-file-name');
  const clientNameInput = document.getElementById('modal-client-name');
  const reportMonthSelect = document.getElementById('modal-report-month');
  
  selectBtn.onclick = () => fileInput.click();
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameSpan.textContent = file.name;
      fileInfo.style.display = 'block';
      uploadBtn.disabled = false;
      uploadBtn.style.opacity = '1';
      
      if (!clientNameInput.value.trim()) {
        const defaultName = file.name.replace(/\.[^/.]+$/, "").replace(/^Export_Contacts_/, "");
        clientNameInput.value = defaultName;
      }
    }
  };
  
  uploadBtn.onclick = async () => {
    const file = fileInput.files[0];
    const clientName = clientNameInput.value.trim();
    const month = reportMonthSelect.value;
    
    if (!file) return;
    if (!clientName) {
      alert("Por favor ingresa el nombre del cliente.");
      return;
    }
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Procesando...";
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'all');
    formData.append('clientName', clientName);
    formData.append('month', month);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
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
        modal.remove();
        
        if (window.updateData) {
          window.updateData(mergedData);
        }
      } else {
        alert("Hubo un error al procesar el archivo en el servidor.");
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Subir y Cargar";
      }
    } catch(e) {
      alert("Error de conexión: " + e.message);
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Subir y Cargar";
    }
  };
};

window.activeViewId = window.activeViewId || 'view-action';
function showView(v){
  window.activeViewId = 'view-' + v;
  document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
  const target = document.getElementById('view-'+v);
  if(target) target.classList.remove('hidden');
  document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
  const map={action:0,agency:1,engine:2,clients:3,client:4,ads:5,leads:6,risks:7,alerts:8,opportunities:9,ai:10,academy:11};
  if(document.querySelectorAll('.nav button')[map[v]]) {
    document.querySelectorAll('.nav button')[map[v]].classList.add('active');
  }
  const t={action:["Action Center","Prioridades y decisiones del día."],agency:["Agency Health","Promedio operativo de TRD según rendimiento de todos sus clientes."],engine:["Funnel Health Engine","Motor configurable de scoring, pesos, simulación e impacto."],clients:["Clients","Clientes como entidad principal del sistema."],client:["Client Workspace","Funnel Intelligence y pipeline comercial por cliente."],ads:["Ad Intelligence","Creativos conectados a citas y movimiento CRM."],leads:["Lead Explorer","Leads filtrados por cliente, estado y riesgo."],risks:["Risks","Cuentas y etapas que requieren atención."],alerts:["Alert Engine","Alertas automáticas sobre salud, atribución, actividad y progresión."],opportunities:["Opportunities","Aprendizajes replicables y mejoras potenciales."],ai:["AI Analyst","Preguntas sobre Meta + Leadtion."],academy:["Funnel Health Academy","Glosario, interpretación y guía rápida del sistema."]}[v];
  if(t) {
    document.getElementById('pageTitle').textContent=t[0];
    document.getElementById('pageSubtitle').textContent=t[1];
  }
  renderAll();
}
window.priorityCollapsed = window.priorityCollapsed !== undefined ? window.priorityCollapsed : false;
window.togglePriorityCollapse = function() {
  window.priorityCollapsed = !window.priorityCollapsed;
  const content = document.getElementById('priority-actions-content');
  const chevron = document.getElementById('priority-chevron-icon');
  if (content && chevron) {
    content.style.display = window.priorityCollapsed ? 'none' : 'block';
    chevron.className = window.priorityCollapsed ? 'ph ph-caret-down' : 'ph ph-caret-up';
  }
};

function badge(cat){ return `<span class="badge ${cat}">${cat}</span>` }
function clientCard(c){return `<div class="card client-card" onclick="openClient('${c.client}')"><div class="kpi"><div><h3>${c.client}</h3>${badge(activeCategory(c))}</div><div class="score-ring" style="--score:${activeScore(c)}"><span>${activeScore(c)}</span></div></div><div class="grid grid3" style="gap:10px;margin-top:16px"><div><strong>${fmtNum(c.leads)}</strong><div class="label">Leads</div></div><div><strong>${c.appointments}</strong><div class="label">Citas</div></div><div><strong>${fmtPct(c.appointment_rate)}</strong><div class="label">Appt.</div></div></div><p class="small" style="margin-top:12px">Problema: ${c.main_problem}</p></div>`}
function renderAction(){
  const filtered = rawFilteredLeads();
  const cs = [...DATA.clients].sort((a,b)=>activeScore(a)-activeScore(b));
  const best = [...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a))[0];
  
  // Deduplicación de clientes para evitar duplicados en prioridades cuando hay pocos clientes cargados
  const items = [];
  const seen = new Set();
  [cs[0], cs[1], best].filter(Boolean).forEach(c => {
    if (!seen.has(c.client)) {
      seen.add(c.client);
      items.push(c);
    }
  });
  
  // Calcular métricas consolidadas reales basadas en los leads filtrados
  const totalLeads = filtered.length;
  const totalAppointments = filtered.filter(l => l.status === 'agendado' || l.has_appointment).length;
  const globalApptRate = totalLeads ? totalAppointments / totalLeads : 0;
  
  // Métricas del nuevo dashboard "Fugas del Embudo"
  const stuckLeads = filtered.filter(l => l.status === 'dejo de responder-seguimiento' || l.status === 'dejo de responder').length;
  const globalLeakageRate = totalLeads ? stuckLeads / totalLeads : 0;

  document.getElementById('view-action').innerHTML=`${renderDateController()}${renderCurrencyController()}
    <!-- Panel Consolidado Global de Agencia -->
    <div class="grid grid3" style="margin-bottom:18px;">
      <div class="card" style="display:flex; flex-direction:column; justify-content:center; padding:20px;">
        <div class="metric" style="font-size:36px;">${fmtNum(totalLeads)}</div>
        <div class="label" style="font-weight:600; color:#94a3b8;">Leads Totales CRM</div>
      </div>
      <div class="card" style="display:flex; flex-direction:column; justify-content:center; padding:20px;">
        <div class="metric" style="font-size:36px;">${fmtNum(totalAppointments)}</div>
        <div class="label" style="font-weight:600; color:#94a3b8;">Citas Agendadas</div>
      </div>
      <div class="card" style="display:flex; flex-direction:column; justify-content:center; padding:20px;">
        <div class="metric" style="font-size:36px; background:linear-gradient(135deg,#38bdf8,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${fmtPct(globalApptRate)}</div>
        <div class="label" style="font-weight:600; color:#38bdf8;">Tasa de Agendamiento Global</div>
      </div>
    </div>

    <div class="grid grid3">
      <!-- 1. Acciones prioritarias (Colapsable/Acordeón) -->
      <div class="card" style="display:flex; flex-direction:column; justify-content:flex-start;">
        <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.togglePriorityCollapse()">
          <h3 style="margin:0; font-size:16px;"><i class="ph ph-warning" style="vertical-align:middle; margin-right:6px;"></i> Acciones prioritarias</h3>
          <i id="priority-chevron-icon" class="${window.priorityCollapsed ? 'ph ph-caret-down' : 'ph ph-caret-up'}" style="font-size:18px;"></i>
        </div>
        <div id="priority-actions-content" style="margin-top:16px; display:${window.priorityCollapsed ? 'none' : 'block'}; max-height:220px; overflow-y:auto; padding-right:4px;">
          ${items.map(c=>{
            const cat = activeCategory(c);
            const dotColor = cat==="Broken"?"red":cat==="Emerging"?"yellow":cat==="Elite"?"green":"purple";
            return `
              <div class="action" onclick="openClient('${c.client}')" style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px; cursor:pointer;">
                <span class="dot ${dotColor}" style="flex-shrink:0; width:12px; height:12px; border-radius:50%;"></span>
                <div style="display:flex; flex-direction:column; gap:2px;">
                  <strong style="color:#fff; font-size:14px;">${c.client}</strong>
                  <span style="font-size:12px; color:#cbd5e1; font-weight:500;">${c.main_problem}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <!-- 2. Agency Health Score (con tooltip) -->
      <div class="card">
        <div style="display:flex; align-items:center; gap:6px;">
          <h3 style="margin:0; font-size:16px;">Agency Health Score</h3>
          <div class="trd-tooltip-container">
            <i class="ph ph-info" style="font-size:15px; color:#94a3b8; cursor:pointer;"></i>
            <span class="trd-tooltip-text">Índice general ponderado de salud operativa (citas, movimiento CRM, actividad comercial, atribución y eficiencia).</span>
          </div>
        </div>
        <div class="kpi" style="margin-top:16px;">
          <div>
            <div class="metric" style="font-size:42px; font-weight:900;">${activeAgencyScore()}</div>
            <div class="label" style="font-size:11px;">Nivel de Salud General</div>
          </div>
          <div class="score-ring" style="--score:${activeAgencyScore()}"><span>${activeAgencyScore()}</span></div>
        </div>
      </div>

      <!-- 3. Fugas del Embudo (con tooltip) -->
      <div class="card">
        <div style="display:flex; align-items:center; gap:6px;">
          <h3 style="margin:0; font-size:16px;">Fugas del Embudo</h3>
          <div class="trd-tooltip-container">
            <i class="ph ph-info" style="font-size:15px; color:#94a3b8; cursor:pointer;"></i>
            <span class="trd-tooltip-text">Porcentaje de leads que entraron en abandono comercial ("Dejó de responder" o "Seguimiento") sobre el total del embudo.</span>
          </div>
        </div>
        <div class="kpi" style="margin-top:16px;">
          <div>
            <div class="metric" style="font-size:42px; font-weight:900; color:#ef4444;">${fmtPct(globalLeakageRate)}</div>
            <div class="label" style="font-size:11px;">Leads Estancados</div>
            <span style="margin-top:6px; display:inline-block; font-size:12px; font-weight:600; color:#cbd5e1;"><i class="ph ph-warning-circle" style="vertical-align:middle; color:#ef4444;"></i> ${fmtNum(stuckLeads)} leads inactivos</span>
          </div>
          <div class="score-ring" style="--score:${Math.round(globalLeakageRate*100)}; --color:#ef4444;"><span>${Math.round(globalLeakageRate*100)}%</span></div>
        </div>
      </div>
    </div>

    <div class="grid grid4" style="margin-top:18px">
      ${[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a)).slice(0, 4).map(clientCard).join('')}
    </div>
    ${DATA.clients.length > 4 ? `
      <div style="text-align:center; margin-top:24px; margin-bottom:12px;">
        <button onclick="showView('clients')" style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); color:#38bdf8; padding:12px 24px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif;">
          <i class="ph ph-users" style="vertical-align:middle; margin-right:6px;"></i> Ver todos los clientes (${DATA.clients.length})
        </button>
      </div>
    ` : ''}`;
}
function calculateDynamicTrends() {
  const filtered = rawFilteredLeads();
  const trends = {};
  
  if (dateRange.preset === "last_7") {
    // Group by Day
    filtered.forEach(l => {
      if (!l.created_date) return;
      const dateKey = l.created_date.slice(0, 10);
      if (!trends[dateKey]) {
        trends[dateKey] = { label: dateKey, leads: 0, appointments: 0 };
      }
      trends[dateKey].leads++;
      if (l.has_appointment || l.status === 'agendado') {
        trends[dateKey].appointments++;
      }
    });
    return Object.values(trends).sort((a, b) => a.label.localeCompare(b.label));
  } else {
    // Group by Week (standard)
    filtered.forEach(l => {
      if (!l.created_date) return;
      const parts = l.created_date.split('-');
      if (parts.length < 3) return;
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      if (isNaN(date.getTime())) return;
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!trends[weekKey]) {
        trends[weekKey] = { label: "Semana " + weekKey, leads: 0, appointments: 0 };
      }
      trends[weekKey].leads++;
      if (l.has_appointment || l.status === 'agendado') {
        trends[weekKey].appointments++;
      }
    });
    return Object.values(trends).sort((a, b) => a.label.localeCompare(b.label));
  }
}

function calculateGlobalCreativeStats() {
  const stats = {};
  (DATA.leads || []).forEach(l => {
    const type = inferCreativeType(l.ad);
    if (!stats[type]) {
      stats[type] = { type, leads: 0, appointments: 0 };
    }
    stats[type].leads++;
    if (l.has_appointment || l.status === 'agendado') {
      stats[type].appointments++;
    }
  });
  return Object.values(stats).sort((a,b) => b.leads - a.leads);
}

function renderAgency(){
  const dynamicTrends = calculateDynamicTrends();
  const creativeStats = calculateGlobalCreativeStats();
  const filtered = rawFilteredLeads();
  
  // Calcular distribución comercial del funnel
  const totalLeads = filtered.length;
  const stagesCount = {
    'lead nuevo': filtered.filter(l => l.status === 'lead nuevo').length,
    'atender dudas': filtered.filter(l => l.status === 'atender dudas').length,
    'dejo de responder-seguimiento': filtered.filter(l => l.status === 'dejo de responder-seguimiento').length,
    'agendado': filtered.filter(l => l.status === 'agendado').length,
    'lead futuro': filtered.filter(l => l.status === 'lead futuro').length,
    'custom': filtered.filter(l => l.status && !['lead nuevo', 'atender dudas', 'dejo de responder-seguimiento', 'agendado', 'lead futuro'].includes(l.status)).length
  };

  document.getElementById('view-agency').innerHTML=`${renderDateController()}${renderCurrencyController()}
    <div class="grid grid2">
      <!-- 1. Agency Health Score -->
      <div class="card">
        <div class="kpi">
          <div>
            <h3>Agency Health Score ${tip('agency')}</h3>
            <div class="metric" style="font-size:54px; font-weight:900;">${activeAgencyScore()}</div>
            <p style="margin-top:10px; color:#cbd5e1;">Promedio de salud operativa global de la agencia basado en citas, actividad CRM, atribución de anuncios y rendimiento de conversión comercial.</p>
          </div>
          <div class="score-ring" style="--score:${activeAgencyScore()}"><span>${activeAgencyScore()}</span></div>
        </div>
      </div>

      <!-- 2. Tendencias -->
      <div class="card">
        <h3>Tendencias</h3>
        ${dynamicTrends.length === 0 ? '<p class="small" style="margin-top:16px">No hay datos de tendencias para el rango seleccionado.</p>' : `
          <div class="trends-list" style="margin-top:16px; display:flex; flex-direction:column; gap:12px; max-height: 250px; overflow-y: auto; padding-right: 4px;">
            ${dynamicTrends.map(t => {
              const rate = t.leads ? t.appointments / t.leads : 0;
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                  <div>
                    <strong style="color:#fff; font-size:14px;">${t.label}</strong>
                    <div style="font-size:12px; color:#94a3b8; margin-top:2px;">${t.leads} Leads CRM · ${t.appointments} Citas</div>
                  </div>
                  <div style="text-align:right;">
                    <span class="badge ${rate >= 0.20 ? 'Elite' : 'Broken'}" style="font-size:11px;">${fmtPct(rate)} Citas</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>

    <!-- 3. Distribución Comercial del Funnel y Estrategias Creativas -->
    <div class="grid grid2" style="margin-top:18px;">
      <!-- Distribución Comercial -->
      <div class="card">
        <h3>Distribución Comercial del Funnel</h3>
        <p class="small" style="margin-bottom:16px;">Volumen y porcentaje de contactos de la agencia por etapa del embudo comercial.</p>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${Object.entries(stagesCount).map(([stage, count]) => {
            const pct = totalLeads ? count / totalLeads : 0;
            const barW = Math.max(4, Math.round(pct * 100));
            const labelMap = {
              'lead nuevo': 'Lead Nuevo',
              'atender dudas': 'Atender Dudas',
              'dejo de responder-seguimiento': 'Dejó de Responder',
              'agendado': 'Agendado',
              'lead futuro': 'Lead Futuro',
              'custom': 'Etapa Personalizada de Cliente'
            };
            return `
              <div>
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; color:#cbd5e1;">
                  <strong>${labelMap[stage] || stage}</strong>
                  <span>${fmtNum(count)} leads (${fmtPct(pct)})</span>
                </div>
                <div class="progress" style="--w:${barW}%"><i></i></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Estrategias Creativas Globales -->
      <div class="card">
        <h3>Estrategia Creativa Ganadora (Global)</h3>
        <p class="small" style="margin-bottom:16px;">Rendimiento consolidado del portafolio por tipo de anuncio creativo.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo de Creativo</th>
                <th>Leads CRM</th>
                <th>Citas Agendadas</th>
                <th>Tasa de Citas</th>
              </tr>
            </thead>
            <tbody>
              ${creativeStats.slice(0, 5).map(c => {
                const rate = c.leads ? c.appointments / c.leads : 0;
                return `
                  <tr>
                    <td><strong style="color:#fff;">${c.type}</strong></td>
                    <td>${fmtNum(c.leads)}</td>
                    <td>${fmtNum(c.appointments)}</td>
                    <td><span class="badge ${rate >= 0.15 ? 'Elite' : 'Broken'}">${fmtPct(rate)}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 4. Ranking de Clientes (Operativo) -->
    <div class="card" style="margin-top:18px">
      <h3>Ranking Comparativo de Operaciones (Clientes)</h3>
      <p class="small" style="margin-bottom:16px;">Métricas comparativas internas para identificar cuellos de botella y oportunidades en cada cuenta.</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Leads CRM</th>
              <th>Citas</th>
              <th>Appointment Rate</th>
              <th>Actividad CRM</th>
              <th>Calidad Atribución</th>
            </tr>
          </thead>
          <tbody>
            ${[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a)).map(c => `
              <tr>
                <td><strong style="color:#38bdf8; cursor:pointer;" onclick="openClient('${c.client}')">${c.client}</strong></td>
                <td>${fmtNum(c.leads)}</td>
                <td>${fmtNum(c.appointments)}</td>
                <td><span class="badge ${c.appointment_rate >= 0.20 ? 'Elite' : 'Broken'}">${fmtPct(c.appointment_rate)}</span></td>
                <td>${fmtPct(c.crm_activity)}</td>
                <td>${fmtPct(c.attribution_quality)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
function renderClients(){document.getElementById('view-clients').innerHTML=`<div class="client-grid">${[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a)).map(clientCard).join('')}</div>`}
function resetAdsFilter(){ adsClassFilter='Todos'; }
function openClient(n){selectedClient=n;currentClientTab='pipeline';resetAdsFilter();showView('client')}
function renderClient(){if(!selectedClient&&DATA.clients&&DATA.clients.length)selectedClient=DATA.clients[0].client;const c=cBy(selectedClient),tabs={overview:'Overview',intelligence:'Funnel Intelligence',pipeline:'Pipeline Analytics',ads:'Ads',leads:'Leads',insights:'Insights'};let body='';if(currentClientTab==='overview')body=overview(c);if(currentClientTab==='intelligence')body=funnelIntel(c);if(currentClientTab==='pipeline')body=pipelineAnalytics(c);if(currentClientTab==='ads')body=adCards(selectedClient);if(currentClientTab==='leads')body=leadTable(leadsBy(selectedClient).slice(0,100));if(currentClientTab==='insights')body=insights(c);document.getElementById('view-client').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="filters"><select onchange="selectedClient=this.value;renderClient()">${DATA.clients.map(x=>`<option ${x.client===selectedClient?'selected':''}>${x.client}</option>`).join('')}</select></div><div class="card"><div class="kpi"><div><h3 style="font-size:24px">${c.client}</h3>${badge(c.engine_category||c.category)}<p>Principal oportunidad: <strong>${engineLabels[c.engine_bottleneck] || c.main_problem}</strong> · Motor: <strong>${activeScore(c)}/100</strong></p></div><div class="score-ring" style="--score:${activeScore(c)}"><span>${activeScore(c)}</span></div></div><div class="tabs">${Object.entries(tabs).map(([k,v])=>`<button class="${currentClientTab===k?'active':''}" onclick="currentClientTab='${k}';renderClient()">${v}</button>`).join('')}</div></div><div style="margin-top:18px">${body}</div>`}
function comp(n,v){return `<div class="component"><span>${n}</span><div class="progress" style="--w:${Math.round(v)}%"><i></i></div><strong>${Math.round(v)}</strong></div>`}
function overview(c){return `<div class="grid grid2"><div class="card"><h3>Diagnóstico</h3><div class="insight"><strong>Lectura ejecutiva</strong><p>${diagnosisLong(c)}</p></div><div style="margin-top:16px">${comp('Tasa de Agendamiento',c.appointment_score)}${comp('Tasa de Avance del Embudo',c.movement_score)}${comp('Tasa de Leads Activos',c.activity_score)}${comp('Calidad de Atribución',c.attribution_score)}${comp('Tasa de Contactabilidad',c.acquisition_score)}</div></div><div class="card"><h3>KPIs</h3><div class="grid grid2"><div><div class="metric">${fmtNum(c.leads)}</div><div class="label">Leads</div>${c.leads===0?'<div class="small">Sin leads en este rango</div>':''}</div><div><div class="metric">${c.appointments}</div><div class="label">Citas</div></div><div><div class="metric">${fmtPct(c.appointment_rate)}</div><div class="label">Appointment Rate</div></div><div><div class="metric">${fmtPct(c.crm_activity)}</div><div class="label">CRM Activity</div></div></div></div></div>`}
function renderTagAnalytics(clientName) {
  const leads = rawFilteredLeads().filter(l => l.client === clientName);
  const tagStats = {};
  leads.forEach(l => {
    if (!l.tags) return;
    const list = l.tags.split(',').map(t => t.trim()).filter(Boolean);
    list.forEach(t => {
      if (!tagStats[t]) {
        tagStats[t] = { tag: t, count: 0, appointments: 0 };
      }
      tagStats[t].count++;
      if (l.has_appointment) {
        tagStats[t].appointments++;
      }
    });
  });

  const sortedTags = Object.values(tagStats).sort((a,b) => b.count - a.count).slice(0, 8);
  if (!sortedTags.length) {
    return `<div class="card" style="margin-top:18px"><h3>Analítica de Etiquetas</h3><p class="small">No hay etiquetas registradas para este cliente.</p></div>`;
  }

  return `<div class="card" style="margin-top:18px">
    <h3>Analítica de Etiquetas</h3>
    <p class="small">Rendimiento de etiquetas comerciales y su relación con agendamientos.</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Etiqueta (Tag)</th>
            <th>Leads Totales</th>
            <th>Citas Agendadas</th>
            <th>Tasa de Agendamiento</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTags.map(item => `
            <tr>
              <td><span class="tag-pill" style="display:inline-block; background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:4px;">${item.tag}</span></td>
              <td><strong>${fmtNum(item.count)}</strong></td>
              <td><strong>${fmtNum(item.appointments)}</strong></td>
              <td><span class="badge ${item.appointments > 0 ? 'Elite' : 'Broken'}">${fmtPct(item.count ? item.appointments / item.count : 0)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function pipelineAnalytics(c){
  const p=DATA.progression_funnels.find(x=>x.client===c.client); if(!p){return `<div class="card"><h3>Sequential Pipeline Progression</h3><p>No hay datos de progresión para este cliente.</p></div>`;}
  const leadNuevo = p.stages.find(s=>s.key==='lead_nuevo') || {value:c.leads};
  const atenderDudas = p.stages.find(s=>s.key==='atender_dudas') || {value:0};
  const dejoResponder = p.stages.find(s=>s.key==='dejo_responder') || {value:0};
  const agendadoObj = p.stages.find(s=>s.key==='agendado') || {value:0};
  const leadFuturo = p.stages.find(s=>s.key==='lead_futuro') || {value:0};

  const tasaInteres = leadNuevo.value ? atenderDudas.value / leadNuevo.value : 0;
  const tasaAbandono = leadNuevo.value ? dejoResponder.value / leadNuevo.value : 0;
  const tasaAgendamiento = leadNuevo.value ? agendadoObj.value / leadNuevo.value : 0;
  const tasaFuturo = leadNuevo.value ? leadFuturo.value / leadNuevo.value : 0;

  const stagesHTML = p.stages.map((s,i)=>{
    const cls = s.pending ? 'pending neutral' : s.health;
    const valueTxt = s.pending ? '-' : fmtNum(s.value);
    const convTxt = s.pending ? 'Pendiente' : (i===0 ? 'Base' : `${fmtPct(s.from_previous)} del paso anterior`);
    const crmTxt = s.pending ? '-' : (s.key==='meta' ? 'Base Meta' : fmtPct(s.cumulative_from_crm));
    const lossTxt = s.lost_from_previous ? `-${fmtNum(s.lost_from_previous)} no avanzaron` : 'Sin pérdida';
    const barW = s.pending ? 4 : Math.min(100, Math.max(4, Math.round((s.cumulative_from_crm||0)*100)));
    return `<div class="progress-stage ${cls}">
      <div class="stage-top">
        <h4><span class="health-dot ${hClass(s.health)}"></span>${s.label}</h4>
        <div class="small">${s.description}</div>
      </div>
      <div class="stage-body">
        <div class="big-number">${valueTxt}</div>
        <div class="label">leads que alcanzaron esta etapa</div>
        <span class="conversion-pill">${convTxt}</span>
        <div class="stage-progress" style="--w:${barW}%"><i></i></div>
        <div class="grid grid2" style="gap:10px;margin-top:12px">
          <div><strong>${crmTxt}</strong><div class="label">desde CRM</div></div>
        </div>
        <div class="stage-loss">
          <strong>${lossTxt}</strong>
          <div class="label">${s.leak_rate===null?'':fmtPct(s.leak_rate)+' de fuga del paso'}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="card">
    <h3>Sequential Pipeline Progression</h3>
    <p class="small">Flujo secuencial de conversión basado en las etapas del embudo.</p>
    <div class="progression-summary">
      <div class="summary-tile"><div class="summary-label">Tasa de Interés (Dudas)</div><div class="summary-value">${fmtPct(tasaInteres)}</div><div class="label">${fmtNum(atenderDudas.value)} leads</div></div>
      <div class="summary-tile"><div class="summary-label">Tasa de Abandono</div><div class="summary-value">${fmtPct(tasaAbandono)}</div><div class="label">${fmtNum(dejoResponder.value)} leads</div></div>
      <div class="summary-tile"><div class="summary-label">Tasa de Agendamiento</div><div class="summary-value">${fmtPct(tasaAgendamiento)}</div><div class="label">${fmtNum(agendadoObj.value)} leads</div></div>
      <div class="summary-tile"><div class="summary-label">Tasa de Leads a Futuro</div><div class="summary-value">${fmtPct(tasaFuturo)}</div><div class="label">${fmtNum(leadFuturo.value)} leads</div></div>
    </div>
    <div class="flow-legend">
      <span><span class="health-dot h-green"></span> Buen avance</span>
      <span><span class="health-dot h-yellow"></span> Avance medio</span>
      <span><span class="health-dot h-red"></span> Caída fuerte</span>
      <span><span class="health-dot h-neutral"></span> Base / pendiente</span>
    </div>
    <div class="progression-board">${stagesHTML}</div>
  </div>
  <div class="pipeline-analysis-grid">
    <div class="card">
      <h3>Lectura rápida</h3>
      <div class="insight"><strong>Conversión principal</strong><p>${fmtNum(agendadoObj.value)} leads llegaron a cita, lo que equivale al ${fmtPct(tasaAgendamiento)} del embudo.</p></div>
    </div>
  </div>
  ${renderTagAnalytics(c.client)}`;
}

function funnelIntel(c){const fi=fiBy(c.client),bot=fi.bottleneck,leak=fi.biggest_leak;return `<div class="grid grid2"><div class="card"><h3>Funnel Flow Ejecutivo</h3><div class="flow-grid" style="margin-top:16px">${fi.stages.map((s,i)=>`<div class="flow-stage ${s.pending?'pending':''}"><h4><span class="health-dot ${hClass(s.health)}"></span>${s.label}</h4><div class="metric">${s.pending?'-':fmtNum(s.value)}</div><div class="label">${s.pending?'Integración pendiente':i===0?'Base Meta':`Conversión: ${fmtPct(s.rate)}`}</div><p class="small">${s.benchmark==null?'':`Benchmark: ${fmtPct(s.benchmark)}`}</p></div>`).join('')}</div></div><div class="card"><h3>Bottleneck Detector ${tip('bottleneck')}</h3><div class="insight"><strong>${bot.stage}</strong><p>Etapa más débil frente al benchmark interno.</p></div><div class="grid grid2"><div><div class="metric">${fmtPct(bot.value)}</div><div class="label">Actual</div></div><div><div class="metric">${fmtPct(bot.benchmark)}</div><div class="label">Benchmark</div></div></div></div></div><div class="grid grid2" style="margin-top:18px"><div class="card"><h3>Leakage Analysis ${tip('leakage')}</h3>${fi.leakages.map(l=>`<div class="leak-card" style="margin-top:10px"><strong>${l.from} → ${l.to}</strong><div class="kpi"><span class="small">Perdidos</span><strong>${fmtNum(l.lost)}</strong></div><div class="leak-bar" style="--w:${Math.round(l.leak_rate*100)}%"><i></i></div><p class="small">Leakage: ${fmtPct(l.leak_rate)}</p></div>`).join('')}<div class="insight"><strong>Mayor fuga</strong><p>${leak.from} → ${leak.to} con ${fmtNum(leak.lost)} registros perdidos.</p></div></div><div class="card"><h3>Opportunity Simulator ${tip('opportunitySimulator')}</h3><div class="grid grid3"><div><div class="metric">${c.appointments}</div><div class="label">Citas actuales</div></div><div><div class="metric">${fi.benchmark_appointments}</div><div class="label">Si alcanza benchmark</div></div><div><div class="metric">+${fi.opportunity_appointments}</div><div class="label">Citas potenciales</div></div></div></div></div>`}
function adKey(a){ return `${a.client}__${a.adset_norm||''}__${a.ad_name_norm||''}`; }
function adSafeId(a){ return encodeURIComponent(adKey(a)); }
function adKeyFromSafeId(id){
  try { return decodeURIComponent(id); } catch(e){ return ''; }
}
function getAdById(id){ return getAdByKey(adKeyFromSafeId(id)); }
function inferCreativeType(name){
  const n=(name||'').toLowerCase();
  if(n.includes('testimonio')||n.includes('testimonial')||n.includes('caso')) return 'TESTIMONIAL';
  if(n.includes('financ')||n.includes('invers')||n.includes('roi')||n.includes('dolar')) return 'FINANCIAL';
  if(n.includes('autoridad')||n.includes('authority')||n.includes('expert')||n.includes('asesor')) return 'AUTHORITY';
  if(n.includes('lifestyle')||n.includes('vida')||n.includes('familia')) return 'LIFESTYLE';
  if(n.includes('objec')||n.includes('mito')||n.includes('error')) return 'OBJECTION';
  if(n.includes('compar')||n.includes('vs')) return 'COMPARISON';
  if(n.includes('educ')||n.includes('guia')||n.includes('tips')) return 'EDUCATIONAL';
  return 'GENERAL';
}
function getCreativeType(a){ return creativeTypeOverrides[adKey(a)] || inferCreativeType(a.ad_name_norm); }
function setCreativeType(key,value){ creativeTypeOverrides[key]=value; localStorage.setItem("trd_creative_types",JSON.stringify(creativeTypeOverrides)); renderAll(); }
function setCreativeTypeById(id,value){ const key=adKeyFromSafeId(id); if(key) setCreativeType(key,value); }
function adClassKey(a){
  if(a.classification.includes('Elite')) return 'elite';
  if(a.classification.includes('Funnel')) return 'funnel';
  if(a.classification.includes('Volume')) return 'volume';
  if(a.classification.includes('No CRM')) return 'nomatch';
  return 'review';
}
function adClassLabel(key){
  return key==='elite'?'Elite Winner':key==='funnel'?'Funnel Winner':key==='volume'?'Volume Winner':key==='nomatch'?'No CRM Match':'Needs Review';
}
function costPerAppointment(a){ return a.appointments ? convertCurrency(a.spend,a.currency,currencySettings.base)/a.appointments : null; }
function adHealthScore(a){
  const apptScore=Math.min(100,(Number(a.appointment_rate||0)/(DATA.benchmarks.avg_appointment_rate || 0.01))*70);
  const moveScore=Math.min(100,Number(a.movement_rate||0)*100);
  const activityScore=Math.min(100,(Number(a.active||0)/Math.max(1,Number(a.leads_crm||0)))*100);
  const attrScore=a.leads_crm>0?85:(a.meta_results>0?35:50);
  const cpaScore=adCostEfficiencyScore(a);
  return Math.round(apptScore*.40 + moveScore*.25 + activityScore*.15 + attrScore*.10 + cpaScore*.10);
}
function adCostEfficiencyScore(a){
  const cpa=costPerAppointment(a);
  if(cpa===null) return 45;
  const cpas=(DATA.ads||[]).map(costPerAppointment).filter(v=>v!==null && isFinite(v));
  if(!cpas.length) return 50;
  const best=Math.min(...cpas), worst=Math.max(...cpas);
  if(best===worst) return 75;
  return Math.max(35,Math.min(100,100-((cpa-best)/(worst-best))*65));
}
function adHealthCategory(score){
  if(score>=85) return 'Elite Ad';
  if(score>=70) return 'Healthy Ad';
  if(score>=50) return 'Emerging Ad';
  return 'Broken Ad';
}
function adHealthBadgeClass(score){
  if(score>=85) return 'Elite';
  if(score>=70) return 'Healthy';
  if(score>=50) return 'Emerging';
  return 'Broken';
}
function adRecommendation(score,a){
  if(score>=85) return ['Escalar presupuesto','Crear 3 variaciones del hook','Replicar estructura en otros clientes'];
  if(score>=70) return ['Mantener activo','Testear nuevas versiones','Revisar si puede recibir más presupuesto'];
  if(score>=50) return ['Optimizar audiencia o promesa','Revisar seguimiento comercial','Crear variante más filtrada'];
  if(a.classification.includes('No CRM')) return ['Revisar UTMs/naming','Validar integración Meta → Leadtion','No tomar decisión hasta corregir atribución'];
  return ['Pausar o replantear','Revisar mensaje y oferta','No escalar hasta generar citas'];
}
function adInsight(a){
  const score=adHealthScore(a);
  if(score>=85) return 'Anuncio con alto impacto comercial. Prioridad para escalar.';
  if(a.classification.includes('Volume')) return 'Genera volumen, pero no citas. El problema puede estar en calidad o seguimiento.';
  if(a.classification.includes('No CRM')) return 'Meta registra actividad, pero no hay match en CRM. Revisar atribución o naming.';
  if(score>=70) return 'Buen rendimiento comercial. Puede convertirse en benchmark si mantiene consistencia.';
  if(score>=50) return 'Tiene señales útiles, pero requiere optimización antes de escalar.';
  return 'Bajo rendimiento comercial. Revisar o pausar.';
}
function sortAds(arr){
  const sorted=[...arr];
  if(adsSortMode==='health') return sorted.sort((a,b)=>adHealthScore(b)-adHealthScore(a)||b.appointments-a.appointments);
  if(adsSortMode==='appointments') return sorted.sort((a,b)=>b.appointments-a.appointments||b.leads_crm-a.leads_crm||b.meta_results-a.meta_results);
  if(adsSortMode==='appt_rate') return sorted.sort((a,b)=>(b.appointment_rate||0)-(a.appointment_rate||0)||b.appointments-a.appointments);
  if(adsSortMode==='leads') return sorted.sort((a,b)=>b.leads_crm-a.leads_crm||b.appointments-a.appointments);
  if(adsSortMode==='spend') return sorted.sort((a,b)=>convertCurrency(b.spend,b.currency,currencySettings.base)-convertCurrency(a.spend,a.currency,currencySettings.base));
  return sorted;
}
function creativePerformance(base){
  const groups={};
  base.forEach(a=>{
    const t=getCreativeType(a);
    if(!groups[t]) groups[t]={type:t,ads:0,leads:0,appointments:0,spend:0,scoreSum:0};
    groups[t].ads++;
    groups[t].leads+=Number(a.leads_crm||0);
    groups[t].appointments+=Number(a.appointments||0);
    groups[t].spend+=convertCurrency(Number(a.spend||0),a.currency,currencySettings.base);
    groups[t].scoreSum+=adHealthScore(a);
  });
  return Object.values(groups).map(g=>({...g,appointment_rate:g.leads?g.appointments/g.leads:0,avg_score:g.ads?Math.round(g.scoreSum/g.ads):0,cpa:g.appointments?g.spend/g.appointments:null})).sort((a,b)=>b.avg_score-a.avg_score);
}
function aiAdAnalysis(base){
  const perf=creativePerformance(base);
  const top=perf[0];
  const weak=[...perf].reverse()[0];
  const topAds=sortAds(base).slice(0,3);
  if(!base.length) return 'No hay anuncios para analizar en este contexto.';
  let txt=`El mejor tipo creativo es ${top?.type || 'N/A'} con score promedio ${top?.avg_score || 0} y Appointment Rate ${fmtPct(top?.appointment_rate || 0)}.`;
  if(weak && top && weak.type!==top.type) txt+=` La mayor oportunidad está en ${weak.type}, con score promedio ${weak.avg_score}.`;
  if(topAds.length) txt+=` Prioridad: revisar o escalar ${topAds[0].ad_name_norm || 'el anuncio líder'}.`;
  return txt;
}
function benchmarkCenter(base){
  const topAds=sortAds(base).slice(0,5);
  const perf=creativePerformance(base).slice(0,5);
  const topClients=[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a)).slice(0,5);
  return `<div class="benchmark-section">
    <div class="card"><h3>Creative Performance</h3><div class="creative-grid">${perf.map(p=>`<div class="creative-card"><span class="creative-badge">${p.type}</span><div class="metric">${p.avg_score}</div><div class="label">Avg Ad Health</div><p class="small">${p.ads} ads · ${fmtPct(p.appointment_rate)} Appt. Rate · CPA ${p.cpa===null?'-':moneyBase(p.cpa)}</p></div>`).join('')}</div></div>
    <div class="card"><h3>Benchmark Center</h3><div class="matrix-grid">${topAds.map((a,i)=>`<div class="matrix-card"><h4>#${i+1} ${a.ad_name_norm||'Sin nombre'}</h4><div class="metric" style="font-size:26px">${adHealthScore(a)}</div><div class="label">${a.client} · ${fmtPct(a.appointment_rate||0)} Appt.</div></div>`).join('')}</div><div class="insight"><strong>Top clientes</strong><p>${topClients.map(c=>`${c.client}: ${activeScore(c)}`).join(' · ')}</p></div></div>
  </div>`;
}

function getAdByKey(key){
  return (DATA.ads||[]).find(a=>adKey(a)===key);
}
function toggleCompareAd(a){
  const key=adKey(a);
  if(selectedCompareAds.includes(key)){
    selectedCompareAds=selectedCompareAds.filter(x=>x!==key);
  } else {
    if(selectedCompareAds.length>=4) selectedCompareAds.shift();
    selectedCompareAds.push(key);
  }
  localStorage.setItem("trd_compare_ads",JSON.stringify(selectedCompareAds));
  renderAll();
}
function clearCompareAds(){
  selectedCompareAds=[];
  localStorage.setItem("trd_compare_ads",JSON.stringify(selectedCompareAds));
  renderAll();
}
function pruneCompareAds(){
  const valid=new Set((DATA.ads||[]).map(adKey));
  selectedCompareAds=selectedCompareAds.filter(k=>valid.has(k));
  localStorage.setItem("trd_compare_ads",JSON.stringify(selectedCompareAds));
}
function renderCompareDock(){
  pruneCompareAds();
  const ads=selectedCompareAds.map(getAdByKey).filter(Boolean);
  if(!ads.length) return `<div class="compare-dock"><strong>Ad Comparator</strong><p class="small">Selecciona hasta 4 anuncios para compararlos lado a lado. Si cambias de rango, los anuncios no disponibles se eliminan automáticamente.</p></div>`;
  return `<div class="compare-dock">
    <div class="kpi"><div><strong>Ad Comparator</strong><p class="small">Comparación lado a lado de anuncios seleccionados.</p></div><button class="ads-filter-btn" onclick="clearCompareAds()">Limpiar</button></div>
    <div class="compare-list">${ads.map(a=>`<span class="compare-chip">${a.ad_name_norm||'Sin nombre'} <button onclick="toggleCompareAd(getAdById('${adSafeId(a)}'))">×</button></span>`).join('')}</div>
    <div class="compare-table"><table><thead><tr><th>Anuncio</th><th>Cliente</th><th>Creative</th><th>Health</th><th>Leads</th><th>Citas</th><th>Appt.</th><th>CPA</th><th>Recomendación</th></tr></thead><tbody>
      ${ads.map(a=>`<tr><td><strong>${a.ad_name_norm||'Sin nombre'}</strong></td><td>${a.client}</td><td>${getCreativeType(a)}</td><td>${adHealthScore(a)}</td><td>${fmtNum(a.leads_crm)}</td><td>${fmtNum(a.appointments)}</td><td>${fmtPct(a.appointment_rate||0)}</td><td>${costPerAppointment(a)===null?'-':moneyBase(costPerAppointment(a))}</td><td>${adRecommendation(adHealthScore(a),a)[0]}</td></tr>`).join('')}
    </tbody></table></div>
  </div>`;
}
function drilldownLeadsForAd(a){
  if(typeof RAW_DATE_DATA==='undefined') return [];
  return rawFilteredLeads().filter(l=>l.client===a.client && l.ad_name_norm===a.ad_name_norm && l.adset_norm===a.adset_norm);
}
function openAdDrilldown(id){
  selectedAdDrilldown=adKeyFromSafeId(id) || id;
  renderAll();
}
function closeAdDrilldown(){
  selectedAdDrilldown=null;
  renderAll();
}
function renderAdDrilldown(){
  if(!selectedAdDrilldown) return '';
  const a=getAdByKey(selectedAdDrilldown);
  if(!a) return '';
  const leads=drilldownLeadsForAd(a);
  return `<div class="drilldown-panel">
    <div class="kpi"><div><h3>Leads asociados al anuncio</h3><p class="small">${a.ad_name_norm||'Sin nombre'} · ${a.client}</p></div><button class="ads-filter-btn" onclick="closeAdDrilldown()">Cerrar</button></div>
    <div class="grid grid4" style="margin-top:12px">
      <div class="matrix-card"><strong>${fmtNum(leads.length)}</strong><div class="label">Leads</div></div>
      <div class="matrix-card"><strong>${fmtNum(leads.filter(l=>l.has_appointment).length)}</strong><div class="label">Citas</div></div>
      <div class="matrix-card"><strong>${fmtNum(leads.filter(l=>l.crm_movement).length)}</strong><div class="label">CRM Movement</div></div>
      <div class="matrix-card"><strong>${fmtPct(leads.length?leads.filter(l=>l.has_appointment).length/leads.length:0)}</strong><div class="label">Appt. Rate</div></div>
    </div>
    <div class="lead-mini-list">
      ${leads.length?leads.slice(0,120).map(l=>`<div class="lead-mini-row"><div><strong>${l.name}</strong><div class="small">${l.created_date||''}</div></div><div>${l.status}</div><div>${l.risk}</div><div>${l.last_activity||'-'}</div></div>`).join(''):'<div class="empty-range-state">No hay leads asociados en este rango.</div>'}
    </div>
  </div>`;
}
function weeklyTrendForAd(a){
  const leads=drilldownLeadsForAd(a);
  const weeks={};
  leads.forEach(l=>{
    const d=(l.created_date||'').slice(0,10);
    let bucket='Sin fecha';
    if(d>='2026-05-01'&&d<='2026-05-07') bucket='May 1-7';
    else if(d>='2026-05-08'&&d<='2026-05-14') bucket='May 8-14';
    else if(d>='2026-05-15'&&d<='2026-05-21') bucket='May 15-21';
    else if(d>='2026-05-22'&&d<='2026-05-31') bucket='May 22-31';
    if(!weeks[bucket]) weeks[bucket]={leads:0,appointments:0};
    weeks[bucket].leads++;
    if(l.has_appointment) weeks[bucket].appointments++;
  });
  const arr=Object.entries(weeks).map(([week,v])=>({week,...v,rate:v.leads?v.appointments/v.leads:0}));
  return arr.length?arr:[{week:'Sin datos',leads:0,appointments:0,rate:0}];
}
function renderTrendMini(a){
  const arr=weeklyTrendForAd(a);
  const max=Math.max(...arr.map(x=>x.leads),1);
  return `<div class="trend-bars">${arr.map(x=>`<div class="trend-row"><span>${x.week}</span><div class="trend-bar"><i style="width:${Math.max(4,Math.round((x.leads/max)*100))}%"></i></div><strong>${x.leads}</strong></div>`).join('')}</div>`;
}
function benchmarkLibrary(base){
  const perf=creativePerformance(base);
  const bestType=perf[0];
  const bestCPA=[...perf].filter(p=>p.cpa!==null).sort((a,b)=>a.cpa-b.cpa)[0];
  const bestVolume=[...perf].sort((a,b)=>b.leads-a.leads)[0];
  const worst=[...perf].reverse()[0];
  return `<div class="card"><h3>Creative Benchmark Library</h3><p class="small">Aprendizajes acumulados del periodo seleccionado.</p>
    <div class="benchmark-library">
      <div class="library-card"><span class="term-tag">Top Health</span><h3>${bestType?.type||'-'}</h3><p>${bestType?.ads||0} ads · Score ${bestType?.avg_score||0} · ${fmtPct(bestType?.appointment_rate||0)} Appt.</p></div>
      <div class="library-card"><span class="term-tag">Best CPA</span><h3>${bestCPA?.type||'-'}</h3><p>${bestCPA?.cpa===null?'-':moneyBase(bestCPA?.cpa||0)} por cita.</p></div>
      <div class="library-card"><span class="term-tag">Most Volume</span><h3>${bestVolume?.type||'-'}</h3><p>${fmtNum(bestVolume?.leads||0)} leads CRM generados.</p></div>
      <div class="library-card"><span class="term-tag">Opportunity</span><h3>${worst?.type||'-'}</h3><p>Score ${worst?.avg_score||0}. Requiere revisión creativa/comercial.</p></div>
    </div>
  </div>`;
}

function adCards(client=null){
  const baseRaw=(client?adsBy(client):DATA.ads);
  let base=sortAds(baseRaw);
  if(!base.length)return '<div class="card">Sin anuncios.</div>';
  if(creativeTypeFilter!=='Todos') base=base.filter(a=>getCreativeType(a)===creativeTypeFilter);
  const filtered=adsClassFilter==='Todos'?base:base.filter(a=>adClassLabel(adClassKey(a))===adsClassFilter);
  const totalAds=base.length;
  const totalLeads=base.reduce((s,a)=>s+Number(a.leads_crm||0),0);
  const totalAppts=base.reduce((s,a)=>s+Number(a.appointments||0),0);
  const totalSpend=base.reduce((s,a)=>s+convertCurrency(Number(a.spend||0),a.currency,currencySettings.base),0);
  const avgAppt=totalLeads?totalAppts/totalLeads:0;
  const filters=['Todos','Elite Winner','Funnel Winner','Volume Winner','Needs Review','No CRM Match'];
  const creativeTypes=['Todos','TESTIMONIAL','FINANCIAL','AUTHORITY','LIFESTYLE','OBJECTION','COMPARISON','EDUCATIONAL','GENERAL'];
  const contextLabel=client?client:'Todos los clientes';
  const validCPAAds=base.filter(a=>a.appointments>0);
  const avgCPA=validCPAAds.length?validCPAAds.reduce((s,a)=>s+(costPerAppointment(a)||0),0)/validCPAAds.length:null;
  const eliteCount=base.filter(a=>adHealthScore(a)>=85).length;
  const healthyCount=base.filter(a=>adHealthScore(a)>=70 && adHealthScore(a)<85).length;
  const emergingCount=base.filter(a=>adHealthScore(a)>=50 && adHealthScore(a)<70).length;
  const brokenCount=base.filter(a=>adHealthScore(a)<50).length;
  return `${renderCompareDock()}${renderAdDrilldown()}<div class="ai-ad-card"><h3>AI Ad Analyst</h3><p>${aiAdAnalysis(base)}</p><ul class="recommendation-list"><li>Escalar anuncios con Health Score superior a 85.</li><li>Crear variantes del mejor Creative Type.</li><li>Revisar anuncios con volumen alto y cero citas.</li></ul></div>
  <div class="card">
    <div class="ads-section-title">
      <div>
        <h3>Ad Intelligence 2.0 ${tip('funnelWinner')}</h3>
        <p class="small">Ranking de anuncios por impacto comercial, no solo por leads generados. Contexto: <strong>${contextLabel}</strong>.</p>
      </div>
      <span class="data-mode modeled">Meta + CRM cruzado ${tip("dataCrossed")}</span>
    </div>
    <div class="ads-summary">
      <div class="summary-tile"><div class="summary-label">Ads</div><div class="summary-value">${fmtNum(totalAds)}</div></div>
      <div class="summary-tile"><div class="summary-label">Elite Ads</div><div class="summary-value">${fmtNum(eliteCount)}</div></div>
      <div class="summary-tile"><div class="summary-label">Healthy</div><div class="summary-value">${fmtNum(healthyCount)}</div></div>
      <div class="summary-tile"><div class="summary-label">Emerging/Broken</div><div class="summary-value">${fmtNum(emergingCount+brokenCount)}</div></div>
      <div class="summary-tile"><div class="summary-label">Appt. Rate ${tip("appointmentRateAd")}</div><div class="summary-value">${fmtPct(avgAppt)}</div>${trendHTML(avgAppt,4)}</div>
    </div>
    <div class="ads-summary">
      <div class="summary-tile"><div class="summary-label">Leads CRM ${tip("crmLeads")}</div><div class="summary-value">${fmtNum(totalLeads)}</div>${trendHTML(totalLeads,2)}</div>
      <div class="summary-tile"><div class="summary-label">Citas ${tip("appointment")}</div><div class="summary-value">${fmtNum(totalAppts)}</div>${trendHTML(totalAppts,3)}</div>
      <div class="summary-tile"><div class="summary-label">Gasto normalizado ${tip("currency")}</div><div class="summary-value">${moneyBase(totalSpend)}</div></div>
      <div class="summary-tile"><div class="summary-label">CPA promedio</div><div class="summary-value">${avgCPA===null?'-':moneyBase(avgCPA)}</div></div>
      <div class="summary-tile"><div class="summary-label">Top Creative</div><div class="summary-value" style="font-size:20px">${creativePerformance(base)[0]?.type || '-'}</div></div>
    </div>
    ${benchmarkCenter(base)}${benchmarkLibrary(base)}
    ${currencySplitHTML(base)}
    <div class="ads-toolbar ads-toolbar-sticky">
      <div class="ads-filter-group">
        ${filters.map(f=>`<button class="ads-filter-btn ${adsClassFilter===f?'active':''}" onclick="adsClassFilter='${f}'; ${client?`currentClientTab='ads';renderClient()`:`renderAds()`}">${f}</button>`).join('')}
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="small">Creative</span>
        <select class="ads-sort-select" onchange="creativeTypeFilter=this.value; ${client?`currentClientTab='ads';renderClient()`:`renderAds()`}">
          ${creativeTypes.map(t=>`<option value="${t}" ${creativeTypeFilter===t?'selected':''}>${t}</option>`).join('')}
        </select>
        <span class="small">Ordenar</span>
        <select class="ads-sort-select" onchange="adsSortMode=this.value; ${client?`currentClientTab='ads';renderClient()`:`renderAds()`}">
          <option value="health" ${adsSortMode==='health'?'selected':''}>Health Score</option>
          <option value="appointments" ${adsSortMode==='appointments'?'selected':''}>Citas</option>
          <option value="appt_rate" ${adsSortMode==='appt_rate'?'selected':''}>Appointment Rate</option>
          <option value="leads" ${adsSortMode==='leads'?'selected':''}>Leads CRM</option>
          <option value="spend" ${adsSortMode==='spend'?'selected':''}>Gasto</option>
        </select>
        <div class="small">Mostrando ${fmtNum(filtered.length)} de ${fmtNum(totalAds)}</div>
      </div>
    </div>
    ${filtered.length?`<div class="ads-card-grid">
      ${filtered.map((a,i)=>{
        const key=adClassKey(a);
        const score=adHealthScore(a);
        const apptRate=Number(a.appointment_rate||0);
        const progress=Math.max(4,Math.min(100,Math.round(apptRate*100)));
        const cpa=costPerAppointment(a);
        const recs=adRecommendation(score,a);
        const creativeKey=adKey(a);
        return `<div class="ads-card ${key}">
          <div class="ads-rank">#${i+1}</div>
          ${!client?`<span class="ads-client-chip">${a.client}</span>`:''}
          <span class="badge ${adHealthBadgeClass(score)}">${adHealthCategory(score)}</span>
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-top:10px">
            <div><h3 class="ads-name">${a.ad_name_norm||'Sin nombre'}</h3><div class="ads-adset">${a.adset_norm||'Sin conjunto'}</div></div>
            <div><div class="ad-health-ring" style="--score:${score}"><span>${score}</span></div><div class="ad-health-label">Health</div></div>
          </div>
          <span class="creative-badge">${getCreativeType(a)}</span>
          <select class="creative-select" onchange="setCreativeTypeById('${adSafeId(a)}',this.value)">
            ${creativeTypes.filter(t=>t!=='Todos').map(t=>`<option value="${t}" ${getCreativeType(a)===t?'selected':''}>${t}</option>`).join('')}
          </select>
          <div class="ads-metrics">
            <div class="ads-metric"><strong>${fmtNum(a.leads_crm)}</strong><span>Leads CRM ${tip("crmLeads")}</span></div>
            <div class="ads-metric"><strong>${fmtNum(a.appointments)}</strong><span>Citas ${tip("appointment")}</span></div>
            <div class="ads-metric"><strong>${fmtPct(apptRate)}</strong><span>Appt. Rate ${tip("appointmentRateAd")}</span></div>
          </div>
          <div class="ads-progress" style="--w:${progress}%"><i></i></div>
          <div class="ads-cpa"><div><strong>${cpa===null?'-':moneyBase(cpa)}</strong><span>Cost per Appointment</span></div><span>${a.appointments?`${fmtNum(a.appointments)} citas`:''}</span></div>
          <div class="small" style="margin-top:10px">Meta: ${fmtNum(a.meta_results)} resultados · ${money(a.spend,a.currency)}${a.currency!==currencySettings.base?` · ${moneyNormalized(a.spend,a.currency)}`:""}</div>
          <div class="ads-diagnosis">${adInsight(a)}<ul class="recommendation-list">${recs.map(r=>`<li>${r}</li>`).join('')}</ul></div>
          <div class="card-actions">
            <button onclick="toggleCompareAd(getAdById('${adSafeId(a)}'))">${selectedCompareAds.includes(adKey(a))?'Quitar comparación':'Comparar'}</button>
            <button onclick="openAdDrilldown('${adSafeId(a)}')">Ver leads</button>
          </div>
          <div class="learning-note"><strong>Tendencia semanal</strong>${renderTrendMini(a)}</div>
        </div>`;
      }).join('')}
    </div>`:`<div class="ads-empty-state">No hay anuncios en esta categoría.</div>`}
  </div>`;
}

function renderAds(){document.getElementById('view-ads').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="filters"><select onchange="selectedAdsClient=this.value;renderAds()">${['Todos',...DATA.clients.map(c=>c.client)].map(x=>`<option ${x===selectedAdsClient?'selected':''}>${x}</option>`).join('')}</select></div>${adCards(selectedAdsClient==='Todos'?null:selectedAdsClient)}`}
function leadTable(arr){if(!arr.length)return '<div class="card">Sin leads.</div>';return `<div class="table-wrap"><table><thead><tr><th>Lead</th><th>Cliente</th><th>Ad</th><th>Última actividad</th><th>Etapa</th><th>Etiquetas (Tags)</th><th>Riesgo</th></tr></thead><tbody>${arr.map(l=>`<tr><td>${l.name}</td><td>${l.client}</td><td>${l.ad}</td><td>${l.last_activity}</td><td>${l.status}</td><td><span class="tags-list">${(l.tags || '').split(',').map(t=>t.trim()).filter(Boolean).map(t=>`<span class="tag-pill" style="display:inline-block; background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:4px; margin-bottom:4px;">${t}</span>`).join('')}</span></td><td>${l.risk}</td></tr>`).join('')}</tbody></table></div>`}

let selectedLeadTag = "Todas";
function renderLeads(){
  const baseLeads = selectedLeadsClient==='Todos'?DATA.leads:leadsBy(selectedLeadsClient);
  
  // Extraer etiquetas únicas para el dropdown
  const allTagsSet = new Set();
  baseLeads.forEach(l => {
    if (l.tags) {
      l.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => allTagsSet.add(t));
    }
  });
  const uniqueTags = ['Todas', ...Array.from(allTagsSet).sort()];

  // Filtrar leads según tag seleccionado
  let arr = baseLeads;
  if (selectedLeadTag !== "Todas") {
    arr = arr.filter(l => l.tags && l.tags.split(',').map(t => t.trim()).includes(selectedLeadTag));
  }

  document.getElementById('view-leads').innerHTML=`${renderDateController()}${renderCurrencyController()}
    <div class="filters" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
      <select onchange="selectedLeadsClient=this.value; selectedLeadTag='Todas'; renderLeads()">
        ${['Todos',...DATA.clients.map(c=>c.client)].map(x=>`<option ${x===selectedLeadsClient?'selected':''}>${x}</option>`).join('')}
      </select>
      <select onchange="selectedLeadTag=this.value; renderLeads()">
        ${uniqueTags.map(t=>`<option ${t===selectedLeadTag?'selected':''}>${t}</option>`).join('')}
      </select>
      <input id="leadSearch" placeholder="Buscar etapa, ad o cliente..." oninput="filterLeads()" style="flex:1">
    </div>
    <div id="leadTable">${leadTable(arr.slice(0,180))}</div>`;
}

function filterLeads(){
  const q=document.getElementById('leadSearch').value.toLowerCase();
  const base=selectedLeadsClient==='Todos'?DATA.leads:leadsBy(selectedLeadsClient);
  let arr = base;
  if (selectedLeadTag !== "Todas") {
    arr = arr.filter(l => l.tags && l.tags.split(',').map(t => t.trim()).includes(selectedLeadTag));
  }
  document.getElementById('leadTable').innerHTML=leadTable(arr.filter(l=>(l.name+l.client+l.ad+l.status+l.risk).toLowerCase().includes(q)).slice(0,180))
}
function renderRisks(){if(!DATA.clients||!DATA.clients.length)return;document.getElementById('view-risks').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="grid">${[...DATA.clients].sort((a,b)=>activeScore(a)-activeScore(b)).map(c=>`<div class="card action" onclick="openClient('${c.client}')"><span class="dot ${dotCat(c.category)}"></span><div><strong>${c.client}</strong><div class="small">${activeCategory(c)} · Score ${activeScore(c)}</div><p>${diagnosisShort(c)}</p></div></div>`).join('')}</div>`}
function renderOps(){if(!DATA.clients||!DATA.clients.length)return;const best=[...DATA.clients].sort((a,b)=>b.appointment_rate-a.appointment_rate)[0];const top=DATA.ads.filter(a=>a.appointments>0).sort((a,b)=>b.appointment_rate-a.appointment_rate).slice(0,5);document.getElementById('view-opportunities').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="grid grid2"><div class="card"><h3>Benchmark</h3><div class="insight"><strong>${best.client}</strong><p>Mejor Appointment Rate. Revisar patrón para replicarlo.</p></div></div><div class="card"><h3>Top Ads replicables</h3>${top.map(a=>`<div class="ad-card" style="margin-top:10px"><strong>${a.ad_name_norm}</strong><p class="small">${a.client} · ${a.appointments} citas · ${fmtPct(a.appointment_rate)}</p></div>`).join('')}</div></div>`}
function renderAI(){document.getElementById('view-ai').innerHTML=`<div class="card"><h3>AI Analyst</h3><div id="chat" class="chatbox"><div class="msg"><strong>TRD AI:</strong> Pregúntame por pipeline, fugas, avance a cita, clientes en riesgo o campos faltantes.</div></div><div class="ask"><input id="askInput" placeholder="Ej: Â¿dónde se pierden los leads de Andrea?"><button onclick="askAI()">Preguntar</button></div></div>`}
async function askAI() {
  const inputEl = document.getElementById('askInput');
  const q = inputEl.value.trim();
  if (!q) return;
  
  const chatEl = document.getElementById('chat');
  chatEl.innerHTML += `<div class="msg user">${q}</div><div class="msg" id="loading-ai"><strong>TRD AI:</strong> <em>Pensando...</em></div>`;
  inputEl.value = '';
  
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: q, context: DATA })
    });
    const data = await res.json();
    document.getElementById('loading-ai').remove();
    chatEl.innerHTML += `<div class="msg"><strong>TRD AI:</strong> ${data.reply || data.error || 'Error en la respuesta.'}</div>`;
  } catch(e) {
    document.getElementById('loading-ai').remove();
    chatEl.innerHTML += `<div class="msg"><strong>TRD AI:</strong> <em>Error de conexión con Gemini.</em></div>`;
  }
}
function answerAI(q){
  const s=q.toLowerCase();
  const worst=[...DATA.clients].sort((a,b)=>activeScore(a)-activeScore(b))[0];
  const best=[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a))[0];
  const m=DATA.clients.find(c=>s.includes(c.client.toLowerCase().split(' ')[0]) || s.includes(c.client.toLowerCase()));
  if(s.includes('agencia')||s.includes('agency')) return `Agency Health está en ${activeAgencyScore()} (${activeAgencyCategory()}).`;
  if(s.includes('alert')) { const a=buildAlerts(); return `Hay ${a.length} alertas activas: ${a.filter(x=>x.severity==='critical').length} críticas y ${a.filter(x=>x.severity==='warning').length} warnings.`; }
  if(s.includes('exportar')||s.includes('falt')) return `Falta exportar Pipeline Stage actual, Stage History, fechas de llamadas, cita asistida y ventas/cierres.`;
  if((s.includes('pierden')||s.includes('perdida')||s.includes('fuga')||s.includes('acumul')||s.includes('etapa')||s.includes('pipeline')||s.includes('cita')||s.includes('agend'))&&m){
    const p=pfBy(m.client);
    if(!p) return `No encontré datos de progresión para ${m.client}.`;
    const biggest=p.biggest_drop || {label:'Sin fuga crítica', lost_from_previous:0};
    const appointment=p.stages.find(x=>x.key==='appointment') || {value:0,cumulative_from_crm:0};
    if(s.includes('cita')||s.includes('agend')){
      return `${m.client}: ${fmtNum(appointment.value)} leads llegaron a Agendados, equivalente al ${fmtPct(appointment.cumulative_from_crm)} del CRM.`;
    }
    return `${m.client} tiene su mayor fuga antes de ${biggest.label}: ${fmtNum(biggest.lost_from_previous)} leads no avanzaron desde el paso anterior.`;
  }
  if(s.includes('riesgo')||s.includes('revisar')) return `${worst.client} debe revisarse primero: score ${activeScore(worst)} y problema principal ${worst.main_problem}.`;
  if(m) return `${m.client} tiene score ${activeScore(m)} (${activeCategory(m)}) y principal oportunidad en ${engineLabels[m.engine_bottleneck] || m.main_problem}.`;
  return `${best.client} es el benchmark actual con score ${activeScore(best)}.`;
}
function insights(c){
  const f=fiBy(c.client);
  const p=pfBy(c.client);
  const biggest=(p && p.biggest_drop) ? p.biggest_drop : {label:'Sin fuga crítica', lost_from_previous:0};
  const appointment=(p && p.stages.find(x=>x.key==='appointment')) || {value:0,cumulative_from_crm:0};
  return `<div class="grid grid2">
    <div class="card">
      <h3>Insight ejecutivo</h3>
      <div class="insight"><p>${diagnosisLong(c)}</p></div>
      <div class="insight"><p>${funnelDiagnosis(c,f)}</p></div>
      <div class="insight"><p>En la progresión comercial, la mayor fuga ocurre antes de <strong>${biggest.label}</strong>: ${fmtNum(biggest.lost_from_previous)} leads no avanzaron.</p></div>
      <div class="insight"><p>Hasta cita avanzan <strong>${fmtNum(appointment.value)}</strong> leads, equivalente al <strong>${fmtPct(appointment.cumulative_from_crm)}</strong> del CRM.</p></div>
    </div>
    <div class="card">
      <h3>Acciones</h3>
      <div class="action"><span class="dot ${dotCat(c.category)}"></span><div><strong>Revisar ${c.main_problem}</strong><p class="small">Componente que más baja el score.</p></div></div>
      <div class="action"><span class="dot red"></span><div><strong>Intervenir ${biggest.label}</strong><p class="small">Es el mayor punto de fuga de la progresión modelada.</p></div></div>
    </div>
  </div>`;
}
function diagnosisShort(c){return c.category==='Broken'?`Funnel crítico. Intervenir ${c.main_problem} antes de escalar pauta.`:c.category==='Emerging'?`Funnel inmaduro. Optimizar ${c.main_problem}.`:c.category==='Elite'?`Funnel líder. Usarlo como benchmark.`:`Funnel saludable. Oportunidad en ${c.main_problem}.`}
function diagnosisLong(c){return `${c.client} está clasificado como ${c.category}. Su Appointment Rate es ${fmtPct(c.appointment_rate)} frente a un promedio TRD de ${fmtPct(DATA.benchmarks.avg_appointment_rate)}. El componente más débil según el motor activo es ${engineLabels[c.engine_bottleneck] || c.main_problem}.`}
function funnelDiagnosis(c,f){return `${c.client} presenta su mayor cuello de botella en ${f.bottleneck.stage}. La mayor fuga secuencial ocurre entre ${f.biggest_leak.from} y ${f.biggest_leak.to}. Potencial estimado: +${f.opportunity_appointments} citas.`}

function normalizeWeights(){
  const total=Object.values(engineWeights).reduce((a,b)=>a+Number(b),0);
  if(!total){
    const keys=Object.keys(engineWeights);
    return Object.fromEntries(keys.map(k=>[k,1/keys.length]));
  }
  return Object.fromEntries(Object.entries(engineWeights).map(([k,v])=>[k,Number(v)/total]));
}
function recalculateEngineScores(){
  const w=normalizeWeights();
  DATA.clients.forEach(c=>{
    c.engine_components={
      appointment: Number(c.appointment_score||0),
      movement: Number(c.movement_score||0),
      activity: Number(c.activity_score||0),
      attribution: Number(c.attribution_score||0),
      acquisition: Number(c.acquisition_score||0)
    };
    const score =
      c.engine_components.appointment*w.appointment+
      c.engine_components.movement*w.movement+
      c.engine_components.activity*w.activity+
      c.engine_components.attribution*w.attribution+
      c.engine_components.acquisition*w.acquisition;
    c.engine_score=Math.round(score);
    c.engine_delta=c.engine_score-Number(c.score||0);
    c.engine_category=c.engine_score>=85?'Elite':c.engine_score>=70?'Healthy':c.engine_score>=50?'Emerging':'Broken';
    const entries=Object.entries(c.engine_components).sort((a,b)=>a[1]-b[1]);
    c.engine_bottleneck=entries[0][0];
    c.engine_strength=entries[entries.length-1][0];
  });
  const agency=Math.round(DATA.clients.reduce((a,c)=>a+c.engine_score,0)/Math.max(DATA.clients.length,1));
  DATA.benchmarks.engine_agency_health_score=agency;
  DATA.benchmarks.engine_agency_category=agency>=85?'Elite':agency>=70?'Healthy':agency>=50?'Emerging':'Broken';
}
function setWeight(key,value){
  engineWeights[key]=Number(value);
  saveEngineWeights();
  renderAll();
}
function resetWeights(){
  engineWeights={appointment:35,movement:25,activity:15,attribution:15,acquisition:10};
  saveEngineWeights();
  renderAll();
}
function balanceWeights(){
  engineWeights={appointment:20,movement:20,activity:20,attribution:20,acquisition:20};
  saveEngineWeights();
  renderAll();
}
function commercialWeights(){
  engineWeights={appointment:45,movement:25,activity:15,attribution:10,acquisition:5};
  saveEngineWeights();
  renderAll();
}
function acquisitionWeights(){
  engineWeights={appointment:20,movement:15,activity:10,attribution:15,acquisition:40};
  saveEngineWeights();
  renderAll();
}
function deltaClass(v){return v>0?'delta-up':v<0?'delta-down':'delta-flat'}
function fmtDelta(v){return v>0?'+'+v:v}

function tipText(key) {
  const rawTips = {
    appointment: "Porcentaje de leads CRM que llegaron a una cita (agendados / leads totales).",
    movement: "Porcentaje de leads que salieron de la etapa inicial 'Lead Nuevo' y registraron avance en el CRM.",
    activity: "Porcentaje de leads con interacción o gestión comercial reciente para prevenir el abandono.",
    attribution: "Porcentaje de leads vinculados a campañas o anuncios de Meta Ads.",
    acquisition: "Porcentaje de leads que cuentan con datos de contacto completos (teléfono y correo) para contactabilidad.",
    funnelScore: "Puntaje de 0 a 100 que resume la salud del funnel usando agendamiento, avance de CRM, leads activos, atribución y contactabilidad."
  };
  return rawTips[key] || "Concepto del sistema Funnel Health.";
}

function renderEngine(){
  recalculateEngineScores();
  const total=Object.values(engineWeights).reduce((a,b)=>a+Number(b),0);
  const sorted=[...DATA.clients].sort((a,b)=>b.engine_score-a.engine_score);
  const agency=DATA.benchmarks.engine_agency_health_score;
  const agencyCat=DATA.benchmarks.engine_agency_category;
  const top=sorted[0], bottom=sorted[sorted.length-1];
  viewHTML('view-engine', `${renderDateController()}
    <div class="engine-layout" style="display:block;">
      <div class="card" style="width:100%; box-sizing:border-box;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <h3 style="margin:0; font-size:18px;">Funnel Health Engine</h3>
          <div class="trd-tooltip-container">
            <i class="ph ph-info" style="font-size:16px; color:#94a3b8; cursor:pointer;"></i>
            <span class="trd-tooltip-text">${tipText('funnelScore')}</span>
          </div>
        </div>
        <p class="small">Ajusta los pesos del score y mira cómo cambia la salud de cada cliente y de la agencia.</p>
        <div class="learning-note">Este motor permite al equipo cambiar la importancia de cada métrica. Por ejemplo, si TRD quiere priorizar la calidad de datos de contacto, puede darle más peso a Tasa de Contactabilidad.</div>
        <div class="grid grid3" style="margin:16px 0">
          <div class="scenario-card"><div class="label">Agency Health recalculado</div><div class="metric">${agency}</div></div>
          <div class="scenario-card"><div class="label">Top client</div><div class="metric" style="font-size:24px">${top.client}</div><p class="small">${top.engine_score}/100 · ${top.engine_category}</p></div>
          <div class="scenario-card"><div class="label">Mayor riesgo</div><div class="metric" style="font-size:24px">${bottom.client}</div><p class="small">${bottom.engine_score}/100 · ${bottom.engine_category}</p></div>
        </div>
        <div class="${total===100?'engine-pill engine-good':'engine-pill engine-warning'}" style="margin-bottom:20px;">Total pesos: ${total}% ${total===100?'<i class="ph ph-check"></i>':'· se normaliza automáticamente'}</div>
        ${Object.keys(engineWeights).map(k=>`
          <div class="weight-row" style="margin-bottom:15px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <strong style="font-size:14px; color:#fff;">${engineLabels[k]}</strong>
              <div class="trd-tooltip-container">
                <i class="ph ph-info" style="font-size:14px; color:#94a3b8; cursor:pointer;"></i>
                <span class="trd-tooltip-text">${tipText(k)}</span>
              </div>
            </div>
            <input type="range" min="0" max="60" value="${engineWeights[k]}" onchange="setWeight('${k}',this.value)" oninput="this.nextElementSibling.textContent=this.value+'%'">
            <strong>${engineWeights[k]}%</strong>
          </div>`).join('')}
        <div class="tabs" style="margin-top:20px;">
          <button onclick="resetWeights()">Default TRD</button>
          <button onclick="commercialWeights()">Prioridad comercial</button>
          <button onclick="acquisitionWeights()">Prioridad adquisición</button>
          <button onclick="balanceWeights()">Balanceado</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:18px">
      <h3>Component Breakdown</h3>
      <div class="matrix-grid">
        ${sorted.map(c=>`
          <div class="matrix-card">
            <h4>${c.client}</h4>
            <div class="metric" style="font-size:28px">${c.engine_score}</div>
            <div class="label">Funnel Health Engine Score</div>
            ${Object.entries(c.engine_components).map(([k,v])=>`
              <div class="component" style="grid-template-columns:160px 1fr 36px;margin:10px 0; gap:8px;">
                <span style="font-size:12px; color:#cbd5e1; font-weight:500;">${engineLabels[k] || k}</span><div class="progress" style="--w:${Math.round(v)}%"><i></i></div><strong>${Math.round(v)}</strong>
              </div>`).join('')}
          </div>`).join('')}
      </div>
    </div>`);
}


function buildAlerts(){
  const alerts=[];
  DATA.clients.forEach(c=>{
    const p=pfBy(c.client);
    const appointment=p?.stages?.find(s=>s.key==='appointment') || {value:c.appointments,cumulative_from_crm:c.appointment_rate};
    const biggest=p?.biggest_drop || null;
    if(activeScore(c)<50){
      alerts.push({severity:'critical',client:c.client,type:'Funnel crítico',message:`Score ${activeScore(c)}/100. Requiere intervención antes de escalar pauta.`,action:`Revisar ${engineLabels[c.engine_bottleneck] || c.main_problem}.`});
    } else if(activeScore(c)<70){
      alerts.push({severity:'warning',client:c.client,type:'Funnel en observación',message:`Score ${activeScore(c)}/100. Tiene señales de riesgo operativo.`,action:`Priorizar seguimiento y revisar bottleneck.`});
    }
    if(c.attribution_quality<0.70){
      alerts.push({severity:'warning',client:c.client,type:'Attribution baja',message:`Solo ${fmtPct(c.attribution_quality)} de leads tienen atribución.`,action:'Validar UTMs, Campaign Name, Ad Set y Ad Name.'});
    }
    if(c.crm_activity<0.45){
      alerts.push({severity:'critical',client:c.client,type:'CRM inactivo',message:`Actividad CRM baja: ${fmtPct(c.crm_activity)}.`,action:'Revisar leads sin actividad y SLA comercial.'});
    }
    if(appointment.cumulative_from_crm<DATA.benchmarks.avg_appointment_rate*0.7){
      alerts.push({severity:'warning',client:c.client,type:'Baja progresión a cita',message:`Solo ${fmtPct(appointment.cumulative_from_crm)} del CRM llega a cita.`,action:'Revisar paso previo a Agendados.'});
    }
    if(biggest && biggest.leak_rate>0.45){
      alerts.push({severity:'critical',client:c.client,type:'Fuga fuerte',message:`Antes de ${biggest.label}, ${fmtNum(biggest.lost_from_previous)} leads no avanzaron.`,action:'Auditar mensajes, llamada y seguimiento de esa etapa.'});
    }
  });
  return alerts.sort((a,b)=>{
    const rank={critical:0,warning:1,info:2};
    return rank[a.severity]-rank[b.severity];
  });
}
function renderAlerts(){if(!DATA.clients||!DATA.clients.length)return;
  const alerts=buildAlerts();
  const critical=alerts.filter(a=>a.severity==='critical').length;
  const warning=alerts.filter(a=>a.severity==='warning').length;
  viewHTML('view-alerts',`${renderDateController()}
    <div class="grid grid3" style="margin-bottom:18px">
      <div class="card"><div class="metric">${alerts.length}</div><div class="label">Alertas totales</div></div>
      <div class="card"><div class="metric">${critical}</div><div class="label">Críticas</div></div>
      <div class="card"><div class="metric">${warning}</div><div class="label">Warnings</div></div>
    </div>
    <div class="card">
      <h3>Alert Engine ${tip('alert')}</h3>
      <p class="small">Alertas automáticas calculadas con los datos actuales. En la siguiente fase se pueden comparar contra semanas/meses anteriores.</p>
      <div class="alert-grid" style="margin-top:16px">
        ${alerts.map(a=>`
          <div class="alert-card ${a.severity}">
            <span class="alert-type">${a.type} ${tip(a.severity==="critical"?"criticalAlert":"warningAlert")}</span>
            <h4>${a.client}</h4>
            <p>${a.message}</p>
            <div class="small"><strong>Acción:</strong> ${a.action}</div>
          </div>`).join('')}
      </div>
    </div>
  `);
}


function renderAcademy(){
  viewHTML('view-academy',`
    <div class="academy-grid">
      <div class="academy-card">
        <span class="term-tag">Concepto principal</span>
        <h3>Â¿Qué es Funnel Health? ${tip("funnelScore")}</h3>
        <p>Es una forma de medir si el funnel de un cliente está funcionando más allá de generar leads. Combina adquisición, CRM, seguimiento, atribución y citas.</p>
      </div>
      <div class="academy-card">
        <span class="term-tag">KPI clave</span>
        <h3>Appointment Rate</h3>
        <p>Porcentaje de leads CRM que llegan a cita.</p>
        <ul><li>Fórmula: citas / leads CRM.</li><li>Ayuda a saber si los leads están convirtiendo comercialmente.</li></ul>
      </div>
      <div class="academy-card">
        <span class="term-tag">Operación CRM</span>
        <h3>CRM Activity</h3>
        <p>Mide si los leads tienen actividad reciente. Si es bajo, puede indicar abandono, poca gestión o problema de seguimiento.</p>
      </div>
      <div class="academy-card">
        <span class="term-tag">Atribución</span>
        <h3>Attribution Quality</h3>
        <p>Mide qué tanto podemos conectar cada lead con campaña, conjunto y anuncio. Si falla, no sabemos qué creativo realmente genera citas.</p>
      </div>
      <div class="academy-card">
        <span class="term-tag">Ads</span>
        <h3>Tipos de anuncios</h3>
        <ul>
          <li><strong>Elite Winner:</strong> buen volumen y buenas citas.</li>
          <li><strong>Funnel Winner:</strong> buen avance comercial.</li>
          <li><strong>Volume Winner:</strong> muchos leads, pocas citas.</li>
          <li><strong>No CRM Match:</strong> no se pudo conectar Meta con CRM.</li>
        </ul>
      </div>
      <div class="academy-card">
        <span class="term-tag">Diagnóstico</span>
        <h3>Bottleneck y Leakage</h3>
        <p><strong>Bottleneck</strong> es el cuello de botella principal. <strong>Leakage</strong> es la fuga entre etapas: leads que no avanzan de un paso al siguiente.</p>
      </div>
      <div class="academy-card">
        <span class="term-tag">Caso práctico</span>
        <h3>Muchos leads, pocas citas</h3>
        <div class="case-card">Interpretación: el problema probablemente no está en pauta, sino en calidad, velocidad comercial, seguimiento o expectativa del anuncio.</div>
      </div>
      <div class="academy-card">
        <span class="term-tag">Caso práctico</span>
        <h3>Pocos leads, alta cita</h3>
        <div class="case-card">Interpretación: el funnel comercial funciona, pero puede haber problema de volumen, presupuesto, segmentación o creatividad.</div>
      </div>
      <div class="academy-card">
        <span class="term-tag">Monedas</span><h3>Currency Normalization</h3><p>Cuando hay clientes en USD, COP u otras monedas, los totales se normalizan a una moneda base. El valor original se conserva por cliente/anuncio.</p></div><div class="academy-card"><span class="term-tag">Históricos</span><h3>Rango de fechas</h3><p>El Date Range Controller permite preparar el sistema para comparar periodos. Para que sea 100% real se necesitan exports históricos o conexión API con fechas.</p></div><div class="academy-card"><span class="term-tag">Datos necesarios</span>
        <h3>Para pasar de modelado a real</h3>
        <ul>
          <li>Pipeline Stage actual.</li>
          <li>Stage History.</li>
          <li>Fecha de llamadas.</li>
          <li>Cita asistida.</li>
          <li>Venta o cierre.</li>
        </ul>
      </div>
    </div>
  `);
}


function daysBetweenInclusive(start,end){
  const s=new Date(start+"T00:00:00"), e=new Date(end+"T00:00:00");
  return Math.max(0, Math.round((e-s)/(1000*60*60*24))+1);
}
function rangeFraction(){
  if(typeof isInvalidDateRange==='function' && isInvalidDateRange()) return 0;
  const s=dateRange.start>PERIOD_META.available_start?dateRange.start:PERIOD_META.available_start;
  const e=dateRange.end<PERIOD_META.available_end?dateRange.end:PERIOD_META.available_end;
  const overlap=daysBetweenInclusive(s,e);
  const total=daysBetweenInclusive(PERIOD_META.available_start,PERIOD_META.available_end);
  return total?Math.max(0,Math.min(1,overlap/total)):1;
}
function rawFilteredLeads(){
  if(dateRange.preset === "month") {
    const selMonth = dateRange.selectedMonth || "Julio";
    return RAW_DATE_DATA.raw_leads.filter(l => l.month === selMonth);
  }
  if(isInvalidDateRange()) return [];
  return RAW_DATE_DATA.raw_leads.filter(l=>l.created_date && l.created_date>=dateRange.start && l.created_date<=dateRange.end);
}
function pct2(n,d){return d?Number(n||0)/Number(d||0):0}
function classifyScore(score){return score>=85?'Elite':score>=70?'Healthy':score>=50?'Emerging':'Broken'}
function buildClientMetrics(filtered){
  const frac=rangeFraction();
  let clients=RAW_DATE_DATA.client_configs.map(cfg=>{
    const leads=filtered.filter(l=>l.client===cfg.client);
    const ads=RAW_DATE_DATA.raw_ads.filter(a=>a.client===cfg.client);
    const meta=ads.reduce((s,a)=>s+Number(a.meta_results||0),0)*frac;
    const spend=ads.reduce((s,a)=>s+Number(a.spend||0),0)*frac;
    const count=leads.length;
    const appointments=leads.filter(l=>l.has_appointment).length;
    const moved=leads.filter(l=>l.crm_movement).length;
    const active=leads.filter(l=>l.active_recent).length;
    const attributed=leads.filter(l=>l.has_attribution).length;
    const workflow=leads.filter(l=>l.workflow_detected).length;
    const used_button=leads.filter(l=>l.used_button).length;
    const waiting=leads.filter(l=>l.waiting).length;
    const discarded=leads.filter(l=>l.discarded_inferred).length;
    const custom_data=leads.filter(l=>l.custom_data_detected).length;
    return {client:cfg.client,currency:cfg.currency,leads:count,appointments,moved,active,attributed,stagnant:Math.max(0,count-active),workflow,used_button,waiting,discarded_inferred:discarded,custom_data,appointment_rate:pct2(appointments,count),movement_rate:pct2(moved,count),crm_activity:pct2(active,count),attribution_quality:pct2(attributed,count),meta_results:Math.round(meta),spend,avg_cpl:pct2(spend,meta),ads_count:ads.length};
  });
  const topApp=Math.max(...clients.map(c=>c.appointment_rate),0.001);
  const avgApp=clients.reduce((s,c)=>s+c.appointment_rate,0)/Math.max(clients.length,1);
  const avgMovement=clients.reduce((s,c)=>s+c.movement_rate,0)/Math.max(clients.length,1);
  const avgActivity=clients.reduce((s,c)=>s+c.crm_activity,0)/Math.max(clients.length,1);
  const avgAttr=clients.reduce((s,c)=>s+c.attribution_quality,0)/Math.max(clients.length,1);
  ["USD","COP"].forEach(cur=>{
    const group=clients.filter(c=>c.currency===cur);
    const cpls=group.map(c=>c.avg_cpl).filter(v=>isFinite(v)&&v>0);
    if(!cpls.length){group.forEach(c=>c.acquisition_score=75);return;}
    const best=Math.min(...cpls), worst=Math.max(...cpls);
    group.forEach(c=>{c.acquisition_score=(best===worst)?75:Math.max(35,Math.min(100,100-((c.avg_cpl-best)/(worst-best))*65));});
  });
  clients.forEach(c=>{
    c.appointment_score=Math.max(0,Math.min(100,(c.appointment_rate/topApp)*100));
    c.movement_score=Math.max(0,Math.min(100,c.movement_rate*100));
    c.activity_score=Math.max(0,Math.min(100,c.crm_activity*100));
    c.attribution_score=Math.max(0,Math.min(100,c.attribution_quality*100));
    c.score=Math.round(c.appointment_score*.35+c.movement_score*.25+c.activity_score*.15+c.attribution_score*.15+(c.acquisition_score||75)*.10);
    c.category=classifyScore(c.score);
    const comps={appointment:c.appointment_score,movement:c.movement_score,activity:c.activity_score,attribution:c.attribution_score,acquisition:c.acquisition_score||75};
    const minKey=Object.entries(comps).sort((a,b)=>a[1]-b[1])[0][0];
    c.main_problem=(typeof engineLabels!=="undefined" && engineLabels[minKey])?engineLabels[minKey]:minKey;
  });
  DATA.benchmarks.total_clients=clients.length;
  DATA.benchmarks.total_leads=clients.reduce((s,c)=>s+c.leads,0);
  DATA.benchmarks.total_appointments=clients.reduce((s,c)=>s+c.appointments,0);
  DATA.benchmarks.avg_appointment_rate=avgApp;
  DATA.benchmarks.top_appointment_rate=topApp;
  DATA.benchmarks.avg_movement_rate=avgMovement;
  DATA.benchmarks.avg_activity_rate=avgActivity;
  DATA.benchmarks.avg_attribution_quality=avgAttr;
  DATA.benchmarks.healthy_clients=clients.filter(c=>["Elite","Healthy"].includes(c.category)).length;
  DATA.benchmarks.risk_clients=clients.filter(c=>["Emerging","Broken"].includes(c.category)).length;
  DATA.benchmarks.critical_clients=clients.filter(c=>c.category==="Broken").length;
  return clients;
}
function buildAds(filtered){
  const frac=rangeFraction();
  const avgApp=DATA.benchmarks.avg_appointment_rate||0;
  return RAW_DATE_DATA.raw_ads.map(a=>{
    const leads=filtered.filter(l=>l.client===a.client && l.ad_name_norm===a.ad_name_norm && l.adset_norm===a.adset_norm);
    const appointments=leads.filter(l=>l.has_appointment).length;
    const moved=leads.filter(l=>l.crm_movement).length;
    const leads_crm=leads.length;
    const appointment_rate=pct2(appointments,leads_crm);
    let classification="Needs Review";
    if(appointments>=3 && appointment_rate>=avgApp) classification="Elite Winner";
    else if(appointments>=2) classification="Funnel Winner";
    else if(leads_crm>=8 && appointments===0) classification="Volume Winner";
    else if(leads_crm===0) classification="No CRM Match";
    return {...a,spend:Number(a.spend||0)*frac,meta_results:Math.round(Number(a.meta_results||0)*frac),leads_crm,appointments,moved,active:leads.filter(l=>l.active_recent).length,appointment_rate,movement_rate:pct2(moved,leads_crm),classification};
  });
}
function buildFunnelIntelligence(clients){
  const totalMoved=clients.reduce((s,c)=>s+c.moved,0), totalAppts=clients.reduce((s,c)=>s+c.appointments,0);
  return clients.map(c=>{
    const stages=[
      {key:"meta",label:"Meta Results",value:c.meta_results,prev:null,rate:null,benchmark:null,health:"neutral"},
      {key:"crm",label:"CRM Leads",value:c.leads,prev:c.meta_results,rate:pct2(c.leads,c.meta_results),benchmark:1,health:"neutral"},
      {key:"movement",label:"CRM Movement",value:c.moved,prev:c.leads,rate:pct2(c.moved,c.leads),benchmark:DATA.benchmarks.avg_movement_rate,health:"neutral"},
      {key:"appointments",label:"Appointments",value:c.appointments,prev:c.moved,rate:pct2(c.appointments,c.moved),benchmark:pct2(totalAppts,totalMoved),health:"neutral"},
      {key:"sales",label:"Sales",value:null,prev:c.appointments,rate:null,benchmark:null,health:"neutral",pending:true}
    ];
    const leakages=[];
    for(let i=1;i<4;i++){const prev=stages[i].prev||0,val=stages[i].value||0,lost=Math.max(0,prev-val);leakages.push({from:stages[i-1].label,to:stages[i].label,lost,leak_rate:pct2(lost,prev)});}
    const health_matrix=[
      {stage:"Attribution",value:c.attribution_quality,benchmark:DATA.benchmarks.avg_attribution_quality,score:Math.round(pct2(c.attribution_quality,DATA.benchmarks.avg_attribution_quality)*100),health:"neutral"},
      {stage:"CRM Movement",value:c.movement_rate,benchmark:DATA.benchmarks.avg_movement_rate,score:Math.round(pct2(c.movement_rate,DATA.benchmarks.avg_movement_rate)*100),health:"neutral"},
      {stage:"CRM Activity",value:c.crm_activity,benchmark:DATA.benchmarks.avg_activity_rate,score:Math.round(pct2(c.crm_activity,DATA.benchmarks.avg_activity_rate)*100),health:"neutral"},
      {stage:"Appointment Rate",value:c.appointment_rate,benchmark:DATA.benchmarks.avg_appointment_rate,score:Math.round(pct2(c.appointment_rate,DATA.benchmarks.avg_appointment_rate)*100),health:"neutral"}
    ];
    const bottleneck=health_matrix.slice().sort((a,b)=>a.score-b.score)[0];
    return {client:c.client,stages,health_matrix,leakages,biggest_leak:leakages.slice().sort((a,b)=>b.lost-a.lost)[0]||{from:'N/A',to:'N/A',lost:0,leak_rate:0},bottleneck,benchmark_appointments:Math.round(c.leads*(DATA.benchmarks.avg_appointment_rate||0)),opportunity_appointments:Math.max(0,Math.round(c.leads*(DATA.benchmarks.avg_appointment_rate||0))-c.appointments),economics:[{stage:"Meta Results",value:c.meta_results,cost_per:pct2(c.spend,c.meta_results)},{stage:"CRM Leads",value:c.leads,cost_per:pct2(c.spend,c.leads)},{stage:"CRM Movement",value:c.moved,cost_per:pct2(c.spend,c.moved)},{stage:"Appointments",value:c.appointments,cost_per:pct2(c.spend,c.appointments)}],note_crm_exceeds_meta:c.leads>c.meta_results&&c.meta_results>0};
  });
}
function buildProgression(filtered,clients){
  return clients.map(c=>{
    const leads=filtered.filter(l=>l.client===c.client);
    
    // Core automated stages that should always exist:
    const coreKeys = ['lead nuevo', 'atender dudas', 'dejo de responder-seguimiento', 'agendado', 'lead futuro'];
    
    // Find custom stages in client's leads
    const customStagesSet = new Set();
    leads.forEach(l => {
      if (l.status && !coreKeys.includes(l.status)) {
        customStagesSet.add(l.status);
      }
    });
    const customStages = Array.from(customStagesSet).sort();

    const allStagesDefs = [];
    allStagesDefs.push(["lead_nuevo", "Lead Nuevo", "Leads ingresados al sistema.", false]);
    
    customStages.forEach(cs => {
      const key = "custom_" + cs.toLowerCase().replace(/[^a-z0-9]/g, "_");
      allStagesDefs.push([key, cs, "Etapa personalizada del cliente (manual).", true, cs]);
    });
    
    allStagesDefs.push(["atender_dudas", "Atender Dudas", "Leads que interactúan o tienen consultas.", false]);
    allStagesDefs.push(["dejo_responder", "Dejó de Responder - Seguimiento", "Leads en seguimiento o inactivos.", false]);
    allStagesDefs.push(["agendado", "Agendado", "Citas agendadas confirmadas.", false]);
    allStagesDefs.push(["lead_futuro", "Lead Futuro", "Leads calificados para re-contacto a futuro.", false]);

    const reached = { meta: c.meta_results };
    allStagesDefs.forEach(([key, label, desc, isCustom, rawStatus]) => {
      if (isCustom) {
        reached[key] = leads.filter(l => l.status === rawStatus).length;
      } else {
        const statusMap = {
          lead_nuevo: 'lead nuevo',
          atender_dudas: 'atender dudas',
          dejo_responder: 'dejo de responder-seguimiento',
          agendado: 'agendado',
          lead_futuro: 'lead futuro'
        };
        reached[key] = leads.filter(l => l.status === statusMap[key]).length;
      }
    });

    let prev=null;
    const stages=allStagesDefs.map(([key,label,description,isCustom,rawStatus])=>{
      const value=reached[key];
      const from_previous=prev===null?1:pct2(value,prev);
      const lost=prev===null?0:Math.max(0,prev-value);
      const obj={
        key,
        label,
        description,
        value,
        from_previous,
        cumulative_from_crm:pct2(value,leads.length),
        cumulative_from_meta:pct2(value,c.meta_results),
        lost_from_previous:lost,
        leak_rate:pct2(lost,prev),
        health:isCustom ? "blue" : (from_previous>=.75?"green":from_previous>=.45?"yellow":"red"),
        pending:false,
        isCustom
      };
      if(key==="lead_nuevo")obj.health="neutral";
      prev=value;
      return obj;
    });

    const leaks=stages.filter(s=>s.lost_from_previous);
    return {client:c.client,mode:"date_filtered_model",stages,biggest_drop:leaks.slice().sort((a,b)=>b.lost_from_previous-a.lost_from_previous)[0]||null,note:"",missing_fields:[]};
  });
}
function applyDateRange(){
  const filtered=rawFilteredLeads();
  if(!DATA.benchmarks) DATA.benchmarks={total_clients:0,total_leads:0,total_appointments:0,avg_appointment_rate:0,top_appointment_rate:0,avg_movement_rate:0,avg_activity_rate:0,avg_attribution_quality:0,healthy_clients:0,risk_clients:0,critical_clients:0,agency_health_score:0,agency_category:"Emerging",engine_agency_health_score:0,engine_agency_category:"Emerging",agency_stage_matrix:[]};
  DATA.clients=buildClientMetrics(filtered);
  DATA.ads=buildAds(filtered);
  DATA.leads=filtered.map(l=>({client:l.client,name:l.name,last_activity:l.last_activity,ad:l.ad,status:l.status,tags:l.tags,risk:l.risk}));
  DATA.funnel_intelligence=buildFunnelIntelligence(DATA.clients);
  DATA.progression_funnels=buildProgression(filtered,DATA.clients);
}

function showEmptyState(activeViewId) {
  const targetId = activeViewId || window.activeViewId || 'view-action';
  document.querySelectorAll('.view').forEach(e => e.classList.add('hidden'));
  const targetView = document.getElementById(targetId);
  if(!targetView) return;
  targetView.classList.remove('hidden');
  targetView.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; text-align:center;">
    <div style="width:80px; height:80px; border-radius:50%; background:rgba(59,130,246,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:24px; color:#3b82f6; margin-left:auto; margin-right:auto;">
      <i class="ph ph-upload-simple" style="font-size: 38px;"></i>
    </div>
    <h2 style="font-size: 26px; font-weight:600; color:#fff; margin-bottom: 12px; font-family:'Inter',sans-serif;">Carga tus datos de Funnel</h2>
    <p style="color: #94a3b8; max-width: 420px; margin: 0 auto 28px; font-size:15px; line-height:1.6; font-family:'Inter',sans-serif;">Para visualizar las métricas y analíticas de esta sección, por favor sube tu archivo Excel o CSV exportado de Leadtion.</p>
    <button onclick="window.openUploadModal()" style="background:#3b82f6;color:white;border:none;padding:16px 32px;border-radius:12px;font-size:16px;cursor:pointer;display:flex;align-items:center;gap:10px;font-weight:600;box-shadow:0 10px 15px -3px rgba(59,130,246,0.3); margin-left:auto; margin-right:auto; transition:all 0.2s;">
      <i class="ph ph-file-arrow-up" style="font-size:20px;"></i> Subir Archivo Excel / CSV
    </button></div>`;
}

function renderAll(){
  if (!DATA || !DATA.clients || DATA.clients.length === 0) {
    showEmptyState(window.activeViewId || 'view-action');
    return;
  }
  applyDateRange();recalculateEngineScores();renderAction();renderAgency();renderEngine();renderClients();renderClient();renderAds();renderLeads();renderRisks();renderAlerts();renderOps();renderAI();renderAcademy();
}
document.body.classList.toggle('learning-on',learningMode);
renderAll();
updateLearningButton();
