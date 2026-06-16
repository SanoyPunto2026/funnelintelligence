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
          
          let adName = row['Ad Name'] || 'Orgánico';
          let statusRaw = row['Opportunities'] || row['Tags'] || 'Nuevo';
          let status = statusRaw.includes('open ') ? statusRaw.replace('open ', '').split('|').pop().trim() : statusRaw;

          return {
            client: clientName,
            name: name,
            created_date: created_date,
            status: status,
            ad_name_norm: adName,
            risk: "Medio",
            last_activity: row['Last Activity'] || ''
          };
        });
        
        currentData.leads = currentData.leads.concat(transformedLeads);

        // Auto-generate ads based on unique ad names found
        const uniqueAds = [...new Set(transformedLeads.map(l => l.ad_name_norm))];
        uniqueAds.forEach(ad => {
          currentData.ads.push({
            client: clientName,
            currency: 'USD',
            ad_name_norm: ad,
            adset_norm: 'GHL Import',
            spend: 0,
            meta_results: 0
          });
        });

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
