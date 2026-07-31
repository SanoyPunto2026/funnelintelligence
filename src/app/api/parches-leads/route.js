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

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');

    return NextResponse.json({ success: true, count: leads.length });
  } catch (error) {
    console.error('Error en API parches-leads:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar el registro' },
      { status: 500 }
    );
  }
}
