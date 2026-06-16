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
  
  // Si no hay datos, inyectamos un cliente "Sin Datos" con valores en 0
  if (!newData.clients || newData.clients.length === 0) {
    newData = {
      clients: [{ client: "Sin Datos", currency: "USD" }],
      leads: [],
      ads: [{ client: "Sin Datos", currency: "USD", ad_name_norm: "-", adset_norm: "-", spend: 0, meta_results: 0 }]
    };
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
  appointment: "Appointment Rate",
  movement: "CRM Movement",
  activity: "CRM Activity",
  attribution: "Attribution Quality",
  acquisition: "Acquisition Efficiency"
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
    funnelScore:"Puntaje de 0 a 100 que resume la salud del funnel usando citas, movimiento CRM, actividad, atribución y eficiencia de adquisición.",
    appointment:"Porcentaje de leads CRM que llegaron a una cita. Fórmula: citas / leads CRM.",
    movement:"Mide si los leads tuvieron avance o señales de gestión dentro del CRM.",
    activity:"Evalúa qué porcentaje de leads tuvo actividad reciente. Sirve para detectar abandono comercial.",
    attribution:"Mide qué porcentaje de leads puede conectarse con campaña, conjunto y anuncio.",
    acquisition:"Evalúa eficiencia de adquisición según volumen y costo relativo.",
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

function saveDateRange(){ localStorage.setItem("trd_date_range", JSON.stringify(dateRange)); }
function setDatePreset(preset){
  if(preset==="may_2026"){
    dateRange={...dateRange,preset,start:PERIOD_META.available_start,end:PERIOD_META.available_end};
  } else if(preset==="last_7"){
    dateRange={...dateRange,preset,start:"2026-05-25",end:"2026-05-31"};
  } else if(preset==="last_14"){
    dateRange={...dateRange,preset,start:"2026-05-18",end:"2026-05-31"};
  } else if(preset==="custom"){
    dateRange={...dateRange,preset};
  }
  saveDateRange();
  renderAll();
}
function setDateStart(v){ dateRange.start=v; dateRange.preset="custom"; saveDateRange(); renderAll(); }
function setDateEnd(v){ dateRange.end=v; dateRange.preset="custom"; saveDateRange(); renderAll(); }
function toggleCompare(){ dateRange.compare=!dateRange.compare; saveDateRange(); renderAll(); }
function currentPeriodLabel(){ return `${dateRange.start} → ${dateRange.end}`; }
function isInvalidDateRange(){ return dateRange.start>dateRange.end; }
function isRangeFullyAvailable(){ return dateRange.start>=PERIOD_META.available_start && dateRange.end<=PERIOD_META.available_end; }
function rangeLeadCount(){ return typeof RAW_DATE_DATA==='undefined'?null:rawFilteredLeads().length; }
function renderDateController(){
  return `<div class="date-controller">
    <span class="date-pill"><i class="ph ph-calendar"></i> Periodo: ${currentPeriodLabel()} ${tip("dateRange")}</span>
    <label>Preset</label>
    <select onchange="setDatePreset(this.value)">
      <option value="may_2026" ${dateRange.preset==="may_2026"?"selected":""}>Mayo 2026</option>
      <option value="last_7" ${dateRange.preset==="last_7"?"selected":""}>Últimos 7 días del export</option>
      <option value="last_14" ${dateRange.preset==="last_14"?"selected":""}>Últimos 14 días del export</option>
      <option value="custom" ${dateRange.preset==="custom"?"selected":""}>Personalizado</option>
    </select>
    <label>Desde</label><input type="date" value="${dateRange.start}" onchange="setDateStart(this.value)">
    <label>Hasta</label><input type="date" value="${dateRange.end}" onchange="setDateEnd(this.value)">
    <button class="ads-filter-btn ${dateRange.compare?'active':''}" onclick="toggleCompare()">Comparar periodo anterior ${tip("comparePeriod")}</button>
    ${isRangeFullyAvailable()?'<span class="date-pill">CRM filtrado real · Meta modelado</span>':'<span class="date-pill date-warning">Rango fuera del export actual</span>'}<span class="date-pill date-warning">Meta sin breakdown diario</span>
  </div>
  ${isInvalidDateRange()?`<div class="historical-note"><strong>Rango inválido:</strong> La fecha inicial no puede ser mayor que la fecha final.</div>`:''}${!isRangeFullyAvailable()?`<div class="historical-note"><strong>Nota:</strong> ${PERIOD_META.source_note}</div>`:''}${rangeLeadCount()===0?`<div class="historical-note"><strong>Sin leads:</strong> No hay registros CRM dentro del rango seleccionado.</div>`:''}`;
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
  const list=currenciesInUse();
  return `<div class="currency-controller">
    <span class="date-pill"><i class="ph ph-currency-circle-dollar"></i> Moneda base: ${currencySettings.base} ${tip("currency")}</span>
    <label>Base</label>
    <select onchange="setBaseCurrency(this.value)">
      <option value="USD" ${currencySettings.base==="USD"?"selected":""}>USD</option>
      <option value="COP" ${currencySettings.base==="COP"?"selected":""}>COP</option>
      <option value="EUR" ${currencySettings.base==="EUR"?"selected":""}>EUR</option>
    </select>
    <label>COP/USD ${tip("exchangeRate")}</label><input type="number" value="${currencySettings.rates.COP}" onchange="setRate('COP',this.value)" style="width:110px">
    <label>EUR/USD ${tip("exchangeRate")}</label><input type="number" step="0.01" value="${currencySettings.rates.EUR}" onchange="setRate('EUR',this.value)" style="width:90px">
    ${hasMixedCurrencies()?`<span class="currency-note">Monedas detectadas: ${list.join(", ")} · totales normalizados</span>`:''}
  </div>`;
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
function showView(v){document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));document.getElementById('view-'+v).classList.remove('hidden');document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));const map={action:0,agency:1,engine:2,clients:3,client:4,ads:5,leads:6,risks:7,alerts:8,opportunities:9,ai:10,academy:11};document.querySelectorAll('.nav button')[map[v]].classList.add('active');const t={action:["Action Center","Prioridades y decisiones del día."],agency:["Agency Health","Promedio operativo de TRD según rendimiento de todos sus clientes."],engine:["Funnel Health Engine","Motor configurable de scoring, pesos, simulación e impacto."],clients:["Clients","Clientes como entidad principal del sistema."],client:["Client Workspace","Funnel Intelligence y pipeline comercial por cliente."],ads:["Ad Intelligence","Creativos conectados a citas y movimiento CRM."],leads:["Lead Explorer","Leads filtrados por cliente, estado y riesgo."],risks:["Risks","Cuentas y etapas que requieren atención."],alerts:["Alert Engine","Alertas automáticas sobre salud, atribución, actividad y progresión."],opportunities:["Opportunities","Aprendizajes replicables y mejoras potenciales."],ai:["AI Analyst","Preguntas sobre Meta + Leadtion."],academy:["Funnel Health Academy","Glosario, interpretación y guía rápida del sistema."]}[v];document.getElementById('pageTitle').textContent=t[0];document.getElementById('pageSubtitle').textContent=t[1];renderAll();}
function badge(cat){ return `<span class="badge ${cat}">${cat}</span>` }
function clientCard(c){return `<div class="card client-card" onclick="openClient('${c.client}')"><div class="kpi"><div><h3>${c.client}</h3>${badge(activeCategory(c))}</div><div class="score-ring" style="--score:${activeScore(c)}"><span>${activeScore(c)}</span></div></div><div class="grid grid3" style="gap:10px;margin-top:16px"><div><strong>${fmtNum(c.leads)}</strong><div class="label">Leads</div></div><div><strong>${c.appointments}</strong><div class="label">Citas</div></div><div><strong>${fmtPct(c.appointment_rate)}</strong><div class="label">Appt.</div></div></div><p class="small" style="margin-top:12px">Problema: ${c.main_problem}</p></div>`}
function renderAction(){const cs=[...DATA.clients].sort((a,b)=>activeScore(a)-activeScore(b)),best=[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a))[0],items=[cs[0],cs[1],best].filter(Boolean);document.getElementById('view-action').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="grid grid2"><div class="card"><h3>Acciones prioritarias</h3>${items.map((c,i)=>`<div class="action" onclick="openClient('${c.client}')"><span class="dot ${i==0?'red':i==1?'yellow':'green'}"></span><div><strong>${i==0?'<i class="ph ph-warning"></i>':i==1?'<i class="ph ph-warning-circle"></i>':'<i class="ph ph-trophy"></i>'} ${c.client}</strong><div class="small">${activeCategory(c)} · Score ${activeScore(c)} · ${c.main_problem}</div><p>${diagnosisShort(c)}</p></div></div>`).join('')}</div><div class="card"><h3>Agency Health ${tip('agency')}</h3><div class="kpi"><div><div class="metric">${activeAgencyScore()}</div><div class="label">Agency Health Score</div>${badge(activeAgencyCategory())}</div><div class="score-ring" style="--score:${activeAgencyScore()}"><span>${activeAgencyScore()}</span></div></div><div class="insight"><strong>Lectura</strong><p>TRD se evalúa como el promedio ponderado del rendimiento de sus clientes y la salud de sus etapas críticas.</p></div></div></div><div class="grid grid4" style="margin-top:18px">${[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a)).map(clientCard).join('')}</div>`}
function renderAgency(){const b=DATA.benchmarks;document.getElementById('view-agency').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="grid grid2"><div class="card"><div class="kpi"><div><h3>Agency Health Score ${tip('agency')}</h3><div class="metric">${activeAgencyScore()}</div>${badge(activeAgencyCategory())}<p>Promedio de salud de TRD basado en clientes, citas, actividad CRM, atribución y rendimiento comercial. Si cambias pesos en Health Engine, este score se recalcula.</p></div><div class="score-ring" style="--score:${activeAgencyScore()}"><span>${activeAgencyScore()}</span></div></div></div><div class="card"><h3>Agency Snapshot</h3><span class="data-mode missing">Tendencias semanales/mensuales pendientes ${tip("dataMissing")}</span><div class="grid grid2"><div><div class="metric">${b.total_clients}</div><div class="label">Clientes</div></div><div><div class="metric">${fmtNum(b.total_leads)}</div><div class="label">Leads CRM</div></div><div><div class="metric">${b.total_appointments}</div><div class="label">Citas</div></div><div><div class="metric">${fmtPct(b.avg_appointment_rate)}</div><div class="label">Avg Appointment Rate</div></div></div></div></div><div class="card" style="margin-top:18px"><h3>Agency Health Matrix</h3><p class="small">Esta matriz muestra métricas base de agencia; el score superior sí responde a los pesos del Health Engine.</p><div class="matrix-grid">${(b.agency_stage_matrix||[]).map(m=>`<div class="matrix-card"><h4><span class="health-dot ${hClass(m.health)}"></span>${m.stage}</h4><div class="metric" style="font-size:27px">${fmtPct(m.value)}</div><div class="label">Target: ${fmtPct(m.benchmark)}</div><div class="progress" style="--w:${m.score}%;margin-top:12px"><i></i></div><p class="small">${hTxt(m.health)} · ${m.score}/100</p></div>`).join('')}</div></div>`}
function renderClients(){document.getElementById('view-clients').innerHTML=`<div class="client-grid">${[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a)).map(clientCard).join('')}</div>`}
function resetAdsFilter(){ adsClassFilter='Todos'; }
function openClient(n){selectedClient=n;currentClientTab='pipeline';resetAdsFilter();showView('client')}
function renderClient(){if(!selectedClient&&DATA.clients&&DATA.clients.length)selectedClient=DATA.clients[0].client;const c=cBy(selectedClient),tabs={overview:'Overview',intelligence:'Funnel Intelligence',pipeline:'Pipeline Analytics',ads:'Ads',leads:'Leads',insights:'Insights'};let body='';if(currentClientTab==='overview')body=overview(c);if(currentClientTab==='intelligence')body=funnelIntel(c);if(currentClientTab==='pipeline')body=pipelineAnalytics(c);if(currentClientTab==='ads')body=adCards(selectedClient);if(currentClientTab==='leads')body=leadTable(leadsBy(selectedClient).slice(0,100));if(currentClientTab==='insights')body=insights(c);document.getElementById('view-client').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="filters"><select onchange="selectedClient=this.value;renderClient()">${DATA.clients.map(x=>`<option ${x.client===selectedClient?'selected':''}>${x.client}</option>`).join('')}</select></div><div class="card"><div class="kpi"><div><h3 style="font-size:24px">${c.client}</h3>${badge(c.engine_category||c.category)}<p>Principal oportunidad: <strong>${engineLabels[c.engine_bottleneck] || c.main_problem}</strong> · Motor: <strong>${activeScore(c)}/100</strong></p></div><div class="score-ring" style="--score:${activeScore(c)}"><span>${activeScore(c)}</span></div></div><div class="tabs">${Object.entries(tabs).map(([k,v])=>`<button class="${currentClientTab===k?'active':''}" onclick="currentClientTab='${k}';renderClient()">${v}</button>`).join('')}</div></div><div style="margin-top:18px">${body}</div>`}
function comp(n,v){return `<div class="component"><span>${n}</span><div class="progress" style="--w:${Math.round(v)}%"><i></i></div><strong>${Math.round(v)}</strong></div>`}
function overview(c){return `<div class="grid grid2"><div class="card"><h3>Diagnóstico</h3><div class="insight"><strong>Lectura ejecutiva</strong><p>${diagnosisLong(c)}</p></div><div style="margin-top:16px">${comp('Appointment',c.appointment_score)}${comp('CRM Movement',c.movement_score)}${comp('CRM Activity',c.activity_score)}${comp('Attribution',c.attribution_score)}${comp('Acquisition',c.acquisition_score)}</div></div><div class="card"><h3>KPIs</h3><div class="grid grid2"><div><div class="metric">${fmtNum(c.leads)}</div><div class="label">Leads</div>${c.leads===0?'<div class="small">Sin leads en este rango</div>':''}</div><div><div class="metric">${c.appointments}</div><div class="label">Citas</div></div><div><div class="metric">${fmtPct(c.appointment_rate)}</div><div class="label">Appointment Rate</div></div><div><div class="metric">${fmtPct(c.crm_activity)}</div><div class="label">CRM Activity</div></div></div></div></div>`}
function pipelineAnalytics(c){
  const p=DATA.progression_funnels.find(x=>x.client===c.client); if(!p){return `<div class="card"><h3>Sequential Pipeline Progression ${tip('progression')}</h3><p>No hay datos de progresión para este cliente.</p></div>`;}
  const appointment = p.stages.find(s=>s.key==='appointment') || {value:0,cumulative_from_crm:0,from_previous:0};
  const crm = p.stages.find(s=>s.key==='crm') || {value:c.leads};
  const meta = p.stages.find(s=>s.key==='meta') || {value:c.meta_results};
  const biggest = p.biggest_drop || {label:'Sin fuga crítica', lost_from_previous:0};
  const stagesHTML = p.stages.map((s,i)=>{
    const cls = s.pending ? 'pending neutral' : s.health;
    const valueTxt = s.pending ? '-' : fmtNum(s.value);
    const convTxt = s.pending ? 'Pendiente' : (i===0 ? 'Base Meta' : `${fmtPct(s.from_previous)} del paso anterior`);
    const crmTxt = s.pending ? '-' : (s.key==='meta' ? 'Base Meta' : fmtPct(s.cumulative_from_crm));
    const metaTxt = s.pending ? '-' : (s.key==='meta' ? '100.0%' : fmtPct(s.cumulative_from_meta));
    const lossTxt = s.lost_from_previous ? `-${fmtNum(s.lost_from_previous)} no avanzaron` : 'Sin pérdida calculada';
    const barW = s.pending ? 4 : Math.min(100, Math.max(4, Math.round((s.cumulative_from_crm||0)*100)));
    return `<div class="progress-stage ${cls}">
      <div class="stage-top">
        <h4><span class="health-dot ${hClass(s.health)}"></span>${s.label}</h4>
        <div class="small">${s.description}</div>
      </div>
      <div class="stage-body">
        <div class="big-number">${valueTxt}</div>
        <div class="label">leads que alcanzaron esta etapa ${tip("reachedStage")}</div>
        <span class="conversion-pill">${convTxt} ${tip("previousStep")}</span>
        <div class="stage-progress" style="--w:${barW}%"><i></i></div>
        <div class="grid grid2" style="gap:10px;margin-top:12px">
          <div><strong>${crmTxt}</strong><div class="label">${s.key==='meta'?'origen':'desde CRM'} ${tip("crmAccumulated")}</div></div>
          <div><strong>${metaTxt}</strong><div class="label">desde Meta ${tip("metaAccumulated")}</div></div>
        </div>
        <div class="stage-loss">
          <strong>${lossTxt}</strong>
          <div class="label">${s.leak_rate===null?'':fmtPct(s.leak_rate)+' de fuga del paso'} ${tip("lostStep")}</div>
        </div>
      </div>
    </div>`;
  }).join('');
  return `<div class="card">
    <h3>Sequential Pipeline Progression ${tip('progression')}</h3>
    <p class="small">Esta vista responde la pregunta clave: de todos los leads que entraron, cuántos avanzaron a cada etapa y qué porcentaje se perdió en cada salto.</p><div class="learning-note">Esta vista no muestra dónde están hoy los leads, sino hasta dónde alcanzaron a avanzar. Para ver ubicación exacta actual necesitamos exportar el Stage actual de Leadtion.</div><span class="data-mode modeled">Datos modelados ${tip("dataModeled")} · requiere Stage History real</span>
    <div class="progression-summary">
      <div class="summary-tile"><div class="summary-label">Base Meta</div><div class="summary-value">${fmtNum(meta.value)}</div><div class="label">resultados reportados</div></div>
      <div class="summary-tile"><div class="summary-label">Base CRM</div><div class="summary-value">${fmtNum(crm.value)}</div><div class="label">leads capturados</div></div>
      <div class="summary-tile"><div class="summary-label">Llegan a cita</div><div class="summary-value">${fmtNum(appointment.value)}</div><div class="label">${fmtPct(appointment.cumulative_from_crm)} del CRM</div></div>
      <div class="summary-tile"><div class="summary-label">Mayor fuga</div><div class="summary-value">${biggest ? biggest.label : '-'}</div><div class="label">${biggest ? '-' + fmtNum(biggest.lost_from_previous) + ' leads' : 'sin fuga'}</div></div>
    </div>
    ${crm.value > meta.value && meta.value > 0 ? '<div class="insight"><strong>Nota de lectura</strong><p>CRM Leads supera Meta Results. Esto puede pasar por fuentes no Meta, duplicados, orgánico o diferencias entre exportaciones. Por eso el avance principal se interpreta desde CRM.</p></div>' : ''}
    <div class="flow-legend">
      <span><span class="health-dot h-green"></span> Buen avance</span>
      <span><span class="health-dot h-yellow"></span> Avance medio</span>
      <span><span class="health-dot h-red"></span> Caída fuerte</span>
      <span><span class="health-dot h-neutral"></span> Base / pendiente</span>
    </div>
    <div class="progression-board">${stagesHTML}</div>
    <div class="insight"><strong>Cómo leerlo</strong><p>Cada columna muestra leads que <strong>alcanzaron</strong> esa etapa. No representa necesariamente los leads que están actualmente ahí. Para eso necesitamos exportar el Stage actual desde Leadtion.</p></div>
    <div class="insight"><strong>Nota técnica</strong><p>${p.note}</p></div>
  </div>
  <div class="pipeline-analysis-grid">
    <div class="card">
      <h3>Lectura rápida</h3>
      <div class="insight"><strong>Mayor fuga</strong><p>${biggest ? `La caída más fuerte ocurre antes de <strong>${biggest.label}</strong>: ${fmtNum(biggest.lost_from_previous)} leads no avanzaron desde el paso anterior.` : 'No hay suficiente fuga calculada.'}</p></div>
      <div class="insight"><strong>Progresión a cita</strong><p>${fmtNum(appointment.value)} leads llegaron a cita, equivalente al ${fmtPct(appointment.cumulative_from_crm)} del CRM.</p></div>
    </div>
    <div class="card">
      <h3>Para precisión total</h3>
      <div class="insight"><strong>Campos requeridos</strong><p>${p.missing_fields.join(', ')}.</p></div>
      <p class="small">Con esos campos, este módulo dejaría de ser modelado y se convertiría en un pipeline real por historial de etapa.</p>
    </div>
  </div>`;
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
function leadTable(arr){if(!arr.length)return '<div class="card">Sin leads.</div>';return `<div class="table-wrap"><table><thead><tr><th>Lead</th><th>Cliente</th><th>Ad</th><th>Última actividad</th><th>Etapa</th><th>Riesgo</th></tr></thead><tbody>${arr.map(l=>`<tr><td>${l.name}</td><td>${l.client}</td><td>${l.ad}</td><td>${l.last_activity}</td><td>${l.status}</td><td>${l.risk}</td></tr>`).join('')}</tbody></table></div>`}
function renderLeads(){const arr=selectedLeadsClient==='Todos'?DATA.leads:leadsBy(selectedLeadsClient);document.getElementById('view-leads').innerHTML=`${renderDateController()}${renderCurrencyController()}<div class="filters"><select onchange="selectedLeadsClient=this.value;renderLeads()">${['Todos',...DATA.clients.map(c=>c.client)].map(x=>`<option ${x===selectedLeadsClient?'selected':''}>${x}</option>`).join('')}</select><input id="leadSearch" placeholder="Buscar etapa, ad o cliente..." oninput="filterLeads()"></div><div id="leadTable">${leadTable(arr.slice(0,180))}</div>`}
function filterLeads(){const q=document.getElementById('leadSearch').value.toLowerCase();const base=selectedLeadsClient==='Todos'?DATA.leads:leadsBy(selectedLeadsClient);document.getElementById('leadTable').innerHTML=leadTable(base.filter(l=>(l.name+l.client+l.ad+l.status+l.risk).toLowerCase().includes(q)).slice(0,180))}
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
function renderEngine(){
  recalculateEngineScores();
  const total=Object.values(engineWeights).reduce((a,b)=>a+Number(b),0);
  const sorted=[...DATA.clients].sort((a,b)=>b.engine_score-a.engine_score);
  const agency=DATA.benchmarks.engine_agency_health_score;
  const agencyCat=DATA.benchmarks.engine_agency_category;
  const top=sorted[0], bottom=sorted[sorted.length-1];
  viewHTML('view-engine', `${renderDateController()}
    <div class="engine-layout">
      <div class="card">
        <h3>Funnel Health Engine ${tip('funnelScore')}</h3>
        <p class="small">Ajusta los pesos del score y mira cómo cambia la salud de cada cliente y de la agencia.</p><div class="learning-note">Este motor permite al equipo cambiar la importancia de cada métrica. Por ejemplo, si TRD quiere priorizar calidad comercial, puede darle más peso a Appointment Rate.</div>
        <div class="grid grid3" style="margin:16px 0">
          <div class="scenario-card"><div class="label">Agency Health recalculado</div><div class="metric">${agency}</div>${badge(agencyCat)}</div>
          <div class="scenario-card"><div class="label">Top client</div><div class="metric" style="font-size:24px">${top.client}</div><p class="small">${top.engine_score}/100 · ${top.engine_category}</p></div>
          <div class="scenario-card"><div class="label">Mayor riesgo</div><div class="metric" style="font-size:24px">${bottom.client}</div><p class="small">${bottom.engine_score}/100 · ${bottom.engine_category}</p></div>
        </div>
        <div class="${total===100?'engine-pill engine-good':'engine-pill engine-warning'}">Total pesos: ${total}% ${total===100?'<i class="ph ph-check"></i>':'· se normaliza automáticamente'}</div>
        ${Object.keys(engineWeights).map(k=>`
          <div class="weight-row">
            <div><strong>${engineLabels[k]} ${tip(k==="appointment"?"appointment":k==="movement"?"movement":k==="activity"?"activity":k==="attribution"?"attribution":"acquisition")}</strong><div class="small">${k} · peso ${tip("weight")}</div></div>
            <input type="range" min="0" max="60" value="${engineWeights[k]}" onchange="setWeight('${k}',this.value)" oninput="this.nextElementSibling.textContent=this.value+'%'">
            <strong>${engineWeights[k]}%</strong>
          </div>`).join('')}
        <div class="tabs">
          <button onclick="resetWeights()">Default TRD</button>
          <button onclick="commercialWeights()">Prioridad comercial</button>
          <button onclick="acquisitionWeights()">Prioridad adquisición</button>
          <button onclick="balanceWeights()">Balanceado</button>
        </div>
      </div>
      <div class="card">
        <h3>Cómo funciona</h3>
        <div class="insight"><strong>Appointment Rate</strong><p>Premia clientes que convierten leads en citas.</p></div>
        <div class="insight"><strong>CRM Movement</strong><p>Mide si los leads avanzan o tienen señales de gestión.</p></div>
        <div class="insight"><strong>CRM Activity</strong><p>Evalúa actividad reciente y seguimiento.</p></div>
        <div class="insight"><strong>Attribution Quality</strong><p>Evalúa qué tanto podemos conectar lead con campaña/anuncio.</p></div>
        <div class="insight"><strong>Acquisition Efficiency</strong><p>Evalúa eficiencia de adquisición según CPL relativo.</p></div><div class="insight"><strong>Datos pendientes</strong><div class="missing-list"><div class="missing-item">Pipeline Stage actual</div><div class="missing-item">Stage History</div><div class="missing-item">Fecha hacer 1ra llamada</div><div class="missing-item">Fecha hacer 2da llamada</div><div class="missing-item">Cita asistida</div><div class="missing-item">Venta / cierre</div></div></div>
      </div>
    </div>

    <div class="card" style="margin-top:18px">
      <h3>Ranking recalculado por motor</h3>
      <div class="engine-table">
        <table>
          <thead><tr><th>Cliente</th><th>Score actual</th><th>Score motor ${tip('engineScore')}</th><th>Delta ${tip('engineDelta')}</th><th>Categoría</th><th>Cuello de botella ${tip('engineBottleneck')}</th><th>Fortaleza ${tip('engineStrength')}</th></tr></thead>
          <tbody>
            ${sorted.map(c=>`<tr>
              <td><strong>${c.client}</strong></td>
              <td>${c.score}</td>
              <td><strong>${c.engine_score}</strong></td>
              <td class="${deltaClass(c.engine_delta)}">${fmtDelta(c.engine_delta)}</td>
              <td>${badge(c.engine_category)}</td>
              <td>${engineLabels[c.engine_bottleneck]}</td>
              <td>${engineLabels[c.engine_strength]}</td>
            </tr>`).join('')}
          </tbody>
        </table>
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
              <div class="component" style="grid-template-columns:92px 1fr 36px;margin:10px 0">
                <span>${k}</span><div class="progress" style="--w:${Math.round(v)}%"><i></i></div><strong>${Math.round(v)}</strong>
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
    const reached={meta:c.meta_results,crm:leads.length,contacted:leads.filter(l=>l.workflow_detected||l.active_recent||l.used_button||l.custom_data_detected||l.has_appointment).length,first_call:leads.filter(l=>l.used_button||l.custom_data_detected||l.waiting||l.has_appointment).length,second_call:leads.filter(l=>l.custom_data_detected||l.waiting||l.has_appointment).length,follow_up:leads.filter(l=>l.waiting||l.has_appointment).length,appointment:leads.filter(l=>l.has_appointment).length,sales:null};
    const defs=[["meta","Meta Results","Base de leads reportados por Meta."],["crm","CRM Leads","Leads capturados en Leadtion."],["contacted","Contactados","Workflow detectado, actividad o interacción."],["first_call","Hacer 1ra llamada","Interacción detectada por botón/handover/respuesta."],["second_call","Hacer 2da llamada","Datos personalizados o etapa posterior."],["follow_up","Seguimiento","Seguimiento/espera o etapa posterior."],["appointment","Agendados","Citas confirmadas o abiertas."],["sales","Ventas","Pendiente integración de cierres."]];
    let prev=null;const stages=defs.map(([key,label,description])=>{const value=reached[key];if(value===null)return{key,label,description,value:null,from_previous:null,cumulative_from_crm:null,cumulative_from_meta:null,lost_from_previous:null,leak_rate:null,health:"neutral",pending:true};const from_previous=prev===null?1:pct2(value,prev);const lost=prev===null?0:Math.max(0,prev-value);const obj={key,label,description,value,from_previous,cumulative_from_crm:pct2(value,leads.length),cumulative_from_meta:pct2(value,c.meta_results),lost_from_previous:lost,leak_rate:pct2(lost,prev),health:from_previous>=.75?"green":from_previous>=.45?"yellow":"red",pending:false};if(["meta","crm"].includes(key))obj.health="neutral";prev=value;return obj;});
    const leaks=stages.filter(s=>s.lost_from_previous);
    return {client:c.client,mode:"date_filtered_model",stages,biggest_drop:leaks.slice().sort((a,b)=>b.lost_from_previous-a.lost_from_previous)[0]||null,note:"CRM filtrado por fecha real de creación. Meta está prorrateado/modelado hasta tener breakdown diario o API.",missing_fields:["Pipeline Stage actual","Stage History","Fecha hacer 1ra llamada","Fecha hacer 2da llamada","Cita asistida","Venta/Cierre"]};
  });
}
function applyDateRange(){
  const filtered=rawFilteredLeads();
  if(!DATA.benchmarks) DATA.benchmarks={total_clients:0,total_leads:0,total_appointments:0,avg_appointment_rate:0,top_appointment_rate:0,avg_movement_rate:0,avg_activity_rate:0,avg_attribution_quality:0,healthy_clients:0,risk_clients:0,critical_clients:0,agency_health_score:0,agency_category:"Emerging",engine_agency_health_score:0,engine_agency_category:"Emerging",agency_stage_matrix:[]};
  DATA.clients=buildClientMetrics(filtered);
  DATA.ads=buildAds(filtered);
  DATA.leads=filtered.map(l=>({client:l.client,name:l.name,last_activity:l.last_activity,ad:l.ad,status:l.status,risk:l.risk}));
  DATA.funnel_intelligence=buildFunnelIntelligence(DATA.clients);
  DATA.progression_funnels=buildProgression(filtered,DATA.clients);
}

function showEmptyState() {
  document.querySelectorAll('.view').forEach(e => e.classList.add('hidden'));
  const actionView = document.getElementById('view-action');
  if(!actionView) return;
  actionView.classList.remove('hidden');
  actionView.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; text-align:center;">' +
    '<i class="ph ph-folder-open" style="font-size: 64px; color: var(--muted); margin-bottom: 20px;"></i>' +
    '<h2 style="font-size: 24px; margin-bottom: 10px;">A\u00fan no hay datos</h2>' +
    '<p style="color: var(--muted); max-width: 400px; margin: 0 auto 24px;">Sube tu archivo Excel o CSV para comenzar a visualizar los dashboards.</p>' +
    '<button onclick="document.querySelector(\'input[type=file]\').click()" style="background:#3b82f6;color:white;border:none;padding:14px 28px;border-radius:8px;font-size:16px;cursor:pointer;display:flex;align-items:center;gap:8px;font-weight:600;box-shadow:0 4px 12px rgba(59,130,246,0.3);">' +
    '<i class="ph ph-upload-simple" style="font-size:20px;"></i> Cargar CSV / Excel</button></div>';
}

function renderAll(){
  if (!DATA || !DATA.clients || DATA.clients.length === 0) {
    showEmptyState();
    return;
  }
  applyDateRange();recalculateEngineScores();renderAction();renderAgency();renderEngine();renderClients();renderClient();renderAds();renderLeads();renderRisks();renderAlerts();renderOps();renderAI();renderAcademy()
}
document.body.classList.toggle('learning-on',learningMode);
renderAll();
updateLearningButton();
