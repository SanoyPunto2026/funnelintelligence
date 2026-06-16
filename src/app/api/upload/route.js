import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'all';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    let currentData = { clients: [], ads: [], leads: [] };
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

    const sheetNames = workbook.SheetNames;
    sheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(sheet, { defval: "" });
      
      if (json.length === 0) return;

      // Detect GoHighLevel export
      const isGHL = json[0]['Contact Id'] !== undefined || json[0]['First Name'] !== undefined;

      if (isGHL) {
        let clientName = fileName;
        // Clean up client name if it has " Mayo" etc. (Optional, keep it raw for now)
        
        const transformedLeads = json.map(row => {
          let name = ((row['First Name'] || '') + ' ' + (row['Last Name'] || '')).trim() || 'Desconocido';
          let created = row['Created'] || '';
          let dateMatch = created.match(/^(\d{4}-\d{2}-\d{2})/);
          let created_date = dateMatch ? dateMatch[1] : created; 
          
          let adName = row['Ad Name'] || row['Ad Set'] || 'Orgánico';
          let adsetName = row['AdSet Name'] || row['Ad Set'] || 'Sin AdSet';
          let tags = (row['Tags'] || '').toLowerCase();
          let opps = (row['Opportunities'] || '').toLowerCase();
          let wfActive = (row['Workflows Active'] || '').toLowerCase();
          let wfFinished = (row['Workflows Finished'] || '').toLowerCase();
          let lastAppt = row['Last Appointment - Confirmed/Open'] || '';

          // Derive boolean fields from GHL data
          let has_appointment = lastAppt.length > 0 || opps.includes('agendado') || tags.includes('cita agendada');
          let crm_movement = opps.includes('seguimiento') || opps.includes('agendado') || tags.includes('usó_botón') || tags.includes('human handover');
          let active_recent = wfActive.length > 0 || tags.includes('reactivación') || tags.includes('esperando');
          let has_attribution = adName !== 'Orgánico' && adName.length > 0;
          let workflow_detected = wfFinished.length > 0 || wfActive.length > 0;
          let used_button = tags.includes('usó_botón') || tags.includes('human handover');
          let waiting = tags.includes('esperando') || opps.includes('seguimiento');
          let discarded_inferred = opps.includes('descartado') || opps.includes('no interesa');
          let custom_data_detected = (row['Email'] || '').length > 0 && (row['Phone'] || '').length > 0;

          let statusRaw = row['Opportunities'] || '';
          let status = statusRaw.length > 0 
            ? (statusRaw.includes('open ') ? statusRaw.replace(/^open\s+/i, '').split('|').pop().trim() : statusRaw)
            : (tags.includes('cita agendada') ? 'Agendado' : 'Nuevo Lead');

          return {
            client: clientName,
            name: name,
            created_date: created_date,
            status: status,
            ad_name_norm: adName,
            adset_norm: adsetName,
            ad: adName,
            risk: discarded_inferred ? "Alto" : (has_appointment ? "Bajo" : "Medio"),
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
          currentData.clients.push({ client: clientName, currency: 'USD' });
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
