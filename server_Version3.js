const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PAGOMOVIL_NUMBER = process.env.PAGOMOVIL_NUMBER || '0414XXXXXXXX';
const BANK_ACCOUNT = process.env.BANK_ACCOUNT || 'BANCO: Ejemplo, CUENTA: 1234567890, RIF: V-12345678';
const DB_FILE = process.env.DB_FILE || 'rifas.db';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new Database(DB_FILE);

// Crear tablas si no existen
db.prepare(`
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_name TEXT,
  email TEXT,
  quantity INTEGER,
  status TEXT,
  reference TEXT,
  payment_method TEXT,
  tx_id TEXT,
  created_at TEXT
);
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number INTEGER UNIQUE,
  order_id INTEGER,
  status TEXT,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);
`).run();

function createReference() {
  return 'REF-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
}

// Endpoint: crear orden y reservar boletos en secuencia
app.post('/api/buy', (req, res) => {
  const { buyer_name, email, quantity, payment_method } = req.body;
  if (!buyer_name || !email || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Faltan datos: buyer_name, email, quantity' });
  }
  if (!['pagomovil', 'transferencia'].includes((payment_method||'').toLowerCase())) {
    return res.status(400).json({ error: 'payment_method debe ser "pagomovil" o "transferencia"' });
  }

  const reference = createReference();
  const createdAt = new Date().toISOString();

  const insertOrder = db.prepare(`INSERT INTO orders (buyer_name, email, quantity, status, reference, payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertTicket = db.prepare(`INSERT INTO tickets (number, order_id, status) VALUES (?, ?, ?)`);
  const getMaxNum = db.prepare(`SELECT COALESCE(MAX(number), 0) as maxnum FROM tickets`);

  const tx = db.transaction(() => {
    const info = insertOrder.run(buyer_name, email, quantity, 'pending', reference, payment_method, createdAt);
    const orderId = info.lastInsertRowid;
    const maxnum = getMaxNum.get().maxnum;
    const assigned = [];
    for (let i = 1; i <= quantity; i++) {
      const ticketNum = maxnum + i;
      insertTicket.run(ticketNum, orderId, 'reserved');
      assigned.push(ticketNum);
    }
    return { orderId, assigned };
  });

  try {
    const { orderId, assigned } = tx();
    const paymentInstructions = {
      payment_method: payment_method,
      pagomovil_number: PAGOMOVIL_NUMBER,
      bank_account: BANK_ACCOUNT,
      reference
    };
    return res.json({
      ok: true,
      order: {
        id: orderId,
        buyer_name,
        email,
        quantity,
        status: 'pending',
        reference,
        tickets: assigned,
        created_at: createdAt
      },
      paymentInstructions
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear la orden' });
  }
});

// Endpoint: comprador registra comprobante (tx id)
app.post('/api/confirm', (req, res) => {
  const { order_id, tx_id } = req.body;
  if (!order_id || !tx_id) return res.status(400).json({ error: 'order_id y tx_id son requeridos' });

  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(order_id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  db.prepare(`UPDATE orders SET tx_id = ?, status = ? WHERE id = ?`).run(tx_id, 'awaiting_confirmation', order_id);
  return res.json({ ok: true, message: 'Comprobante registrado. El administrador verificará y confirmará la orden.' });
});

// Admin: listar órdenes y boletos (autenticación simple por header)
app.get('/api/admin/orders', (req, res) => {
  const pwd = req.header('x-admin-password');
  if (pwd !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const orders = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
  const tickets = db.prepare(`SELECT * FROM tickets ORDER BY number ASC`).all();
  return res.json({ orders, tickets });
});

// Admin: confirmar orden => status paid y tickets sold
app.post('/api/admin/confirm', (req, res) => {
  const pwd = req.header('x-admin-password');
  if (pwd !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'order_id requerido' });

  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(order_id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  const tx = db.transaction(() => {
    db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run('paid', order_id);
    db.prepare(`UPDATE tickets SET status = ?, order_id = ? WHERE order_id = ?`).run('sold', order_id, order_id);
  });

  try {
    tx();
    return res.json({ ok: true, message: 'Orden confirmada y boletos marcados como vendidos' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al confirmar' });
  }
});

// Servir admin UI
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});