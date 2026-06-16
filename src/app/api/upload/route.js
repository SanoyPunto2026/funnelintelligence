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
    let currentData = {};

    const sheetNames = workbook.SheetNames;
    if (type === 'all' && sheetNames.length > 0) {
      sheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(sheet);
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

    return NextResponse.json({ message: 'Data parsed successfully!', data: currentData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
