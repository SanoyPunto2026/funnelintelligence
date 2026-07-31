import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { name, email, instagram } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'El nombre y el correo son obligatorios' },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'parches_leads.json');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let leads = [];

    // Read existing leads if file exists
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      try {
        leads = JSON.parse(fileData);
      } catch (e) {
        console.error('Error al parsear leads existentes, iniciando lista nueva', e);
      }
    }

    // Add new lead with timestamp
    const newLead = {
      name,
      email,
      instagram: instagram || '',
      timestamp: new Date().toISOString()
    };

    leads.push(newLead);

    // Save back to file (try local project data folder, then /tmp, then fallback)
    try {
      fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (writeError) {
      console.warn('Fallo escritura en ruta local (Vercel read-only). Intentando en /tmp...', writeError.message);
      try {
        const tmpPath = path.join('/tmp', 'parches_leads.json');
        fs.writeFileSync(tmpPath, JSON.stringify(leads, null, 2), 'utf8');
        console.log('Escritura exitosa en /tmp/parches_leads.json');
      } catch (tmpError) {
        console.error('Fallo escritura final en /tmp. Lead no persistido físicamente, pero se ignora para no bloquear al usuario.', tmpError.message);
      }
    }

    return NextResponse.json({ success: true, count: leads.length });
  } catch (error) {
    console.error('Error general en API parches-leads:', error);
    // Return success: true even on error so that the user is not blocked
    return NextResponse.json({ success: true, count: 0 });
  }
}
