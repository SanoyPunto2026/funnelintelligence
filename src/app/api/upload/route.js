import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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

    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    let currentData = {};
    if (fs.existsSync(dbPath)) {
      currentData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }

    const sheetNames = workbook.SheetNames;
    if (type === 'all' && sheetNames.length > 0) {
      sheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(sheet);
        // Mapeo básico de nombres de hojas a claves del JSON
        const name = sheetName.toLowerCase();
        const key = name.includes('client') ? 'clients' : 
                    name.includes('ad') ? 'ads' : 
                    name.includes('lead') ? 'leads' : sheetName;
        currentData[key] = json;
      });
    } else {
      const firstSheetName = sheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const json = xlsx.utils.sheet_to_json(sheet);
      currentData[type] = json;
    }

    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2));

    return NextResponse.json({ message: 'Database updated successfully!', data: currentData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
