import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.json');
const excelFolder = path.join(__dirname, 'excel');

if (!fs.existsSync(excelFolder)) {
  fs.mkdirSync(excelFolder, { recursive: true });
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const orders = db.orders || [];

const workbook = XLSX.utils.book_new();

const grouped = {};
orders.forEach(ord => {
  const prov = (ord.provenienza || ord.shippingAddress || 'Chiamata Cellulare').trim();
  if (!grouped[prov]) grouped[prov] = [];
  grouped[prov].push(ord);
});

const overviewRows = orders.map(ord => ({
  'Provenienza': ord.provenienza || 'Chiamata Cellulare',
  'ID Ordine': ord.id,
  'Data & Ora': new Date(ord.date).toLocaleString('it-IT'),
  'Cliente': ord.customerName,
  'Telefono': ord.phone,
  'Indirizzo': ord.shippingAddress || 'N/D',
  'Articoli Ordinati': (ord.items || []).map(i => `${i.name} (x${i.quantity} - €${i.price})`).join(', '),
  'Subtotale (€)': ord.subtotal,
  'Spedizione (€)': ord.shippingCost,
  'Totale Finale (€)': ord.total,
  'Pagamento': ord.paymentMethod,
  'Stato': ord.status,
  'Note': ord.notes || ''
}));

overviewRows.sort((a, b) => (a['Provenienza'] || '').localeCompare(b['Provenienza'] || ''));

const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);
overviewSheet['!cols'] = [
  { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 22 },
  { wch: 16 }, { wch: 30 }, { wch: 45 }, { wch: 14 },
  { wch: 14 }, { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 30 }
];
if (overviewSheet['!ref']) {
  overviewSheet['!autofilter'] = { ref: overviewSheet['!ref'] };
}
XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Tutti gli Ordini');

const usedSheetNames = new Set(['Tutti gli Ordini']);
Object.keys(grouped).forEach(provName => {
  let cleanName = provName.replace(/[\:\\/\?\*\[\]]/g, '').trim().substring(0, 22) || 'Provenienza';
  let finalSheetName = cleanName;
  let counter = 1;
  while (usedSheetNames.has(finalSheetName)) {
    finalSheetName = `${cleanName.substring(0, 18)}_${counter}`;
    counter++;
  }
  usedSheetNames.add(finalSheetName);

  const rows = grouped[provName].map(ord => ({
    'ID Ordine': ord.id,
    'Data': new Date(ord.date).toLocaleString('it-IT'),
    'Cliente': ord.customerName,
    'Telefono': ord.phone,
    'Articoli': (ord.items || []).map(i => `${i.name} (x${i.quantity})`).join(', '),
    'Totale (€)': ord.total,
    'Stato': ord.status,
    'Note': ord.notes || ''
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet['!cols'] = [
    { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 16 },
    { wch: 40 }, { wch: 14 }, { wch: 16 }, { wch: 25 }
  ];
  if (sheet['!ref']) {
    sheet['!autofilter'] = { ref: sheet['!ref'] };
  }
  XLSX.utils.book_append_sheet(workbook, sheet, finalSheetName);
});

const dateStr = new Date().toISOString().split('T')[0];
const targetPath = path.join(excelFolder, 'Ordini_Organizzati_Per_Provenienza.xlsx');
const datedPath = path.join(excelFolder, `Ordini_Organizzati_Per_Provenienza_${dateStr}.xlsx`);

XLSX.writeFile(workbook, targetPath);
XLSX.writeFile(workbook, datedPath);

console.log('✅ File Excel creato in:', targetPath);
