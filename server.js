import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
import shopifyRoutes from './backend/routes/shopifyRoutes.js';
import syncRoutes from './backend/routes/syncRoutes.js';
import authRoutes from './backend/routes/authRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');
const EXCEL_FOLDER_PATH = path.join(__dirname, 'excel');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Client connections for Server-Sent Events (SSE)
let sseClients = [];

// Helper to read DB
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { customers: [], products: [], orders: [], callHistory: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Errore lettura DB:', err);
    return { customers: [], products: [], orders: [], callHistory: [] };
  }
}

// Helper to write DB & automatically update Excel file in the excel/ folder!
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    // Automatically generate and save Excel file in the excel/ folder
    saveExcelToFolder(data.orders || []);
  } catch (err) {
    console.error('Errore scrittura DB:', err);
  }
}

// Helper to generate & save organized Excel file in c:\Users\Giancarlo Portatile\Desktop\prova gestionale\excel\
function saveExcelToFolder(orders) {
  try {
    // Ensure excel folder exists
    if (!fs.existsSync(EXCEL_FOLDER_PATH)) {
      fs.mkdirSync(EXCEL_FOLDER_PATH, { recursive: true });
    }

    if (!orders || orders.length === 0) return;

    const workbook = XLSX.utils.book_new();

    // Group orders by Provenienza (Città / Canale)
    const grouped = {};
    orders.forEach(ord => {
      const prov = (ord.provenienza || ord.shippingAddress || 'Chiamata Cellulare').trim();
      if (!grouped[prov]) grouped[prov] = [];
      grouped[prov].push(ord);
    });

    // 1. Overview Sheet
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

    // 2. Separate Sheets per provenienza
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

    // Master File always updated at excel/Ordini_Organizzati_Per_Provenienza.xlsx
    const masterPath = path.join(EXCEL_FOLDER_PATH, 'Ordini_Organizzati_Per_Provenienza.xlsx');
    try {
      XLSX.writeFile(workbook, masterPath);
      console.log(`✅ File Excel aggiornato con successo in: ${masterPath}`);
    } catch (e) {
      console.log('File master temporaneamente in uso da Excel.');
    }

    // Dated file copy at excel/Ordini_Organizzati_Per_Provenienza_2026-08-13.xlsx
    const datedPath = path.join(EXCEL_FOLDER_PATH, `Ordini_Organizzati_Per_Provenienza_${dateStr}.xlsx`);
    try {
      XLSX.writeFile(workbook, datedPath);
    } catch (e) {
      // ignore lock on dated file
    }
  } catch (err) {
    console.error('Errore salvataggio file Excel nella cartella excel:', err);
  }
}

// Standardize phone number format for easy comparison
function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)]/g, '');
}

// -------------------------------------------------------------
// SSE Endpoint for Live Incoming Call Stream to Frontend
// -------------------------------------------------------------
app.get('/api/calls/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    res.write(':\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

function broadcastIncomingCall(callData) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(callData)}\n\n`);
  });
}

// -------------------------------------------------------------
// WEBHOOK Endpoint for Incoming Mobile Calls (Tasker / MacroDroid / Web Simulator)
// -------------------------------------------------------------
app.post('/api/calls/incoming', (req, res) => {
  const phone = req.body.phone || req.query.phone;
  let callerName = req.body.name || req.query.name || '';

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Numero di telefono mancante' });
  }

  const db = readDB();
  const cleanPhone = formatPhone(phone);

  // Search in database for matching customer by phone
  const matchedCustomer = db.customers.find(c => formatPhone(c.phone) === cleanPhone);

  let isKnown = false;
  let customerData = null;

  if (matchedCustomer) {
    isKnown = true;
    customerData = matchedCustomer;
    callerName = matchedCustomer.name;
  } else {
    isKnown = false;
    if (!callerName) callerName = 'Numero Sconosciuto';
  }

  const callEvent = {
    id: 'call-' + Date.now(),
    phone: phone,
    cleanPhone: cleanPhone,
    name: callerName,
    isKnown: isKnown,
    customer: customerData,
    timestamp: new Date().toISOString(),
    status: 'In Arrivo'
  };

  // Add to call history
  db.callHistory.unshift({
    id: callEvent.id,
    phone: phone,
    name: callerName,
    timestamp: callEvent.timestamp,
    status: isKnown ? `Chiamata da Cliente (${callerName})` : 'Chiamata da Numero Sconosciuto'
  });
  writeDB(db);

  // Broadcast live incoming call alert to UI via SSE
  broadcastIncomingCall(callEvent);

  return res.json({
    success: true,
    message: 'Chiamata in arrivo notificata al gestionale',
    call: callEvent
  });
});

// -------------------------------------------------------------
// CUSTOMERS API (Anagrafica & Numeri Noti)
// -------------------------------------------------------------
app.get('/api/customers', (req, res) => {
  const db = readDB();
  res.json(db.customers);
});

app.post('/api/customers', (req, res) => {
  const db = readDB();
  const { phone, name, email, address, city, zip, province, notes, vip } = req.body;

  if (!phone || !name) {
    return res.status(400).json({ error: 'Nome e Telefono sono obbligatori' });
  }

  const newCust = {
    id: 'cust-' + Date.now(),
    phone,
    name,
    email: email || '',
    address: address || '',
    city: city || '',
    zip: zip || '',
    province: province || '',
    notes: notes || '',
    vip: !!vip,
    createdAt: new Date().toISOString()
  };

  db.customers.unshift(newCust);
  writeDB(db);
  res.json(newCust);
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDB();
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Cliente non trovato' });

  db.customers[index] = { ...db.customers[index], ...req.body };
  writeDB(db);
  res.json(db.customers[index]);
});

app.delete('/api/customers/:id', (req, res) => {
  const db = readDB();
  db.customers = db.customers.filter(c => c.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Lookup customer by phone
app.get('/api/customers/lookup', (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).json({ error: 'Numero mancante' });

  const db = readDB();
  const cleanPhone = formatPhone(phone);
  const matched = db.customers.find(c => formatPhone(c.phone) === cleanPhone);

  if (matched) {
    res.json({ found: true, customer: matched });
  } else {
    res.json({ found: false });
  }
});

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const { sku, name, price, stock, category, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e Prezzo sono obbligatori' });
  }

  const newProd = {
    id: 'prod-' + Date.now(),
    sku: sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
    name,
    price: parseFloat(price),
    stock: parseInt(stock || 0, 10),
    category: category || 'Generale',
    description: description || ''
  };

  db.products.unshift(newProd);
  writeDB(db);
  res.json(newProd);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Prodotto non trovato' });

  db.products[index] = { ...db.products[index], ...req.body };
  writeDB(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// ORDERS API
// -------------------------------------------------------------
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const {
    customerId,
    customerName,
    phone,
    shippingAddress,
    items,
    shippingCost,
    paymentMethod,
    notes,
    callDurationSeconds
  } = req.body;

  if (!customerName || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: 'Dati ordine incompleti o carrello vuoto' });
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = parseFloat(shippingCost || 0);
  const total = subtotal + shipping;

  // Auto-register customer if customerId is missing or new
  let activeCustomerId = customerId;
  let existingCust = db.customers.find(c => formatPhone(c.phone) === formatPhone(phone));
  
  if (!existingCust) {
    existingCust = {
      id: 'cust-' + Date.now(),
      phone: phone,
      name: customerName,
      address: shippingAddress || '',
      vip: false,
      notes: 'Registrato automaticamente durante la presa ordine.',
      createdAt: new Date().toISOString()
    };
    db.customers.unshift(existingCust);
  }
  activeCustomerId = existingCust.id;

  const newOrder = {
    id: 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString(),
    customerId: activeCustomerId,
    customerName: customerName,
    phone: phone,
    provenienza: req.body.provenienza || existingCust.city || 'Chiamata Cellulare',
    shippingAddress: shippingAddress || existingCust.address || '',
    items: items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingCost: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    paymentMethod: paymentMethod || 'Contrassegno (Alla Consegna)',
    status: 'Nuovo',
    notes: notes || '',
    callDurationSeconds: callDurationSeconds || 0
  };

  // Deduct inventory stock
  items.forEach(item => {
    const prod = db.products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  db.orders.unshift(newOrder);
  writeDB(db);

  res.json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Ordine non trovato' });

  order.status = req.body.status;
  writeDB(db);
  res.json(order);
});

app.put('/api/orders/:id', (req, res) => {
  const db = readDB();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ordine non trovato' });

  const updatedOrder = { ...db.orders[index], ...req.body };
  if (req.body.items) {
    const subtotal = req.body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = parseFloat(updatedOrder.shippingCost || 0);
    updatedOrder.subtotal = parseFloat(subtotal.toFixed(2));
    updatedOrder.total = parseFloat((subtotal + shipping).toFixed(2));
  }

  db.orders[index] = updatedOrder;
  writeDB(db);
  res.json(updatedOrder);
});

app.delete('/api/orders/:id', (req, res) => {
  const db = readDB();
  db.orders = db.orders.filter(o => o.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Clear active orders registry after batch export
app.post('/api/orders/clear', (req, res) => {
  const db = readDB();
  db.orders = [];
  writeDB(db);
  res.json({ success: true, message: 'Registro ordini svuotato con successo' });
});

// -------------------------------------------------------------
// CALL HISTORY & STATS API
// -------------------------------------------------------------
app.get('/api/calls', (req, res) => {
  const db = readDB();
  res.json(db.callHistory);
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  const totalOrders = db.orders.length;
  const totalRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);
  const totalCustomers = db.customers.length;
  const totalCalls = db.callHistory.length;

  res.json({
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCustomers,
    totalCalls
  });
});

// Endpoint to generate, save copy in excel folder, and send for download
app.get('/api/export/excel', (req, res) => {
  const db = readDB();
  saveExcelToFolder(db.orders || []);
  const masterPath = path.join(EXCEL_FOLDER_PATH, 'Ordini_Organizzati_Per_Provenienza.xlsx');
  res.download(masterPath, 'Ordini_Organizzati_Per_Provenienza.xlsx');
});

// Shopify API Routes
app.use('/api/shopify', shopifyRoutes);

// Shopify Sync Routes
app.use('/api/sync', syncRoutes);

// Shopify OAuth Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server CallCenter Backend attivo su http://localhost:${PORT}`);
  // Initial Excel file generation on startup
  const initialDb = readDB();
  saveExcelToFolder(initialDb.orders || []);
});
