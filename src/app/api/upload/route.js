import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'all';
    const customClientName = formData.get('clientName');
    const reportMonth = formData.get('month') || 'Julio';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    let workbook;
    if (isCsv) {
      let decodedText = '';
      if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        decodedText = buffer.toString('utf8');
      } else {
        try {
          const decoder = new TextDecoder('utf-8', { fatal: true });
          decodedText = decoder.decode(buffer);
        } catch (e) {
          const decoder = new TextDecoder('iso-8859-1');
          decodedText = decoder.decode(buffer);
        }
      }
      workbook = xlsx.read(decodedText, { type: 'string' });
    } else {
      workbook = xlsx.read(buffer, { type: 'buffer' });
    }

    let currentData = { clients: [], ads: [], leads: [] };

    const sheetNames = workbook.SheetNames;
    sheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(sheet, { defval: "" });
      
      if (json.length === 0) return;

      // Detect Leadtion export
      const isGHL = json[0]['Contact Id'] !== undefined || json[0]['First Name'] !== undefined;

      if (isGHL) {
        let clientName = customClientName || fileName;
        
        const transformedLeads = json.map(row => {
          let name = ((row['First Name'] || '') + ' ' + (row['Last Name'] || '')).trim() || 'Desconocido';
          let created = row['Created'] || '';
          let dateMatch = created.match(/^(\d{4}-\d{2}-\d{2})/);
          let created_date = dateMatch ? dateMatch[1] : created; 
          
          let adName = row['Ad Name'] || row['Ad Set'] || 'Orgánico';
          let adsetName = row['AdSet Name'] || row['Ad Set'] || 'Sin AdSet';
          let oppsRaw = row['Opportunities'] || '';
          let tagsRaw = row['Tags'] || '';
          let wfActive = (row['Workflows Active'] || '').toLowerCase();
          let wfFinished = (row['Workflows Finished'] || '').toLowerCase();
 
          // Clasificar únicamente en base a las 5 etapas automáticas exactas
          let status = 'lead nuevo';
          let opps = oppsRaw.toLowerCase();
          if (opps.includes('agendado') || opps.includes('cita') || opps.includes('appointment') || opps.includes('booking')) {
            status = 'agendado';
          } else if (opps.includes('lead futuro') || opps.includes('futuro') || opps.includes('future')) {
            status = 'lead futuro';
          } else if (opps.includes('dejo de responder-seguimiento') || opps.includes('dejo de responder') || (opps.includes('seguimiento') && !opps.includes('contactado') && !opps.includes('mensaje'))) {
            status = 'dejo de responder-seguimiento';
          } else if (opps.includes('atender dudas') || opps.includes('dudas') || opps.includes('atender')) {
            status = 'atender dudas';
          } else if (opps.includes('lead nuevo') || opps.includes('nuevo') || opps.includes('new')) {
            status = 'lead nuevo';
          } else {
            // Cualquier etapa del cliente no automatizada (como "Contactado 1 Mensaje", "Sin WhatsApp")
            // se mapea a "lead nuevo" para no sesgar las analíticas de automatización
            status = 'lead nuevo';
          }

          // Derivar campos booleanos basándose en el estado
          let has_appointment = status === 'agendado';
          let crm_movement = status === 'atender dudas' || status === 'dejo de responder-seguimiento' || status === 'agendado' || status === 'lead futuro';
          let active_recent = status === 'lead nuevo' || status === 'atender dudas' || status === 'dejo de responder-seguimiento';
          let has_attribution = adName !== 'Orgánico' && adName.length > 0;
          let workflow_detected = wfFinished.length > 0 || wfActive.length > 0;
          let used_button = tagsRaw.toLowerCase().includes('usó_botón') || tagsRaw.toLowerCase().includes('human handover');
          let waiting = status === 'dejo de responder-seguimiento';
          let discarded_inferred = status === 'dejo de responder-seguimiento';
          let custom_data_detected = (row['Email'] || '').length > 0 && (row['Phone'] || '').length > 0;

          return {
            client: clientName,
            name: name,
            created_date: created_date,
            month: reportMonth,
            status: status,
            tags: tagsRaw,
            ad_name_norm: adName,
            adset_norm: adsetName,
            ad: adName,
            risk: status === 'dejo de responder-seguimiento' ? "Alto" : (has_appointment ? "Bajo" : "Medio"),
            last_activity: row['Last Activity'] || '',
            has_appointment: has_appointment,
            crm_movement: crm_movement,
            active_recent: active_recent,
            has_attribution: has_attribution,
            workflow_detected: workflow_detected,
            used_button: used_button,
            waiting: waiting,
            discarded_inferred: discarded_inferred,
            custom_data_detected: custom_data_detected
          };
        });
        
        currentData.leads = currentData.leads.concat(transformedLeads);

        // Auto-generate ads based on unique ad+adset combinations
        const adMap = new Map();
        transformedLeads.forEach(l => {
          const key = l.ad_name_norm + '||' + l.adset_norm;
          if (!adMap.has(key)) {
            adMap.set(key, {
              client: clientName,
              currency: 'USD',
              ad_name_norm: l.ad_name_norm,
              adset_norm: l.adset_norm,
              spend: 0,
              meta_results: transformedLeads.filter(x => x.ad_name_norm === l.ad_name_norm && x.adset_norm === l.adset_norm).length
            });
          }
        });
        currentData.ads = currentData.ads.concat([...adMap.values()]);

        // Add client config if not exists
        if (!currentData.clients.find(c => c.client === clientName)) {
          currentData.clients.push({ client: clientName, currency: 'USD', month: reportMonth });
        }
      } else {
        // Standard TRD format detection
        const name = sheetName.toLowerCase();
        const key = name.includes('client') ? 'clients' : 
                    name.includes('ad') ? 'ads' : 
                    name.includes('lead') ? 'leads' : sheetName;
        if (!currentData[key]) currentData[key] = [];
        currentData[key] = currentData[key].concat(json);
      }
    });

    return NextResponse.json({ message: 'Data parsed successfully!', data: currentData, fileName });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
