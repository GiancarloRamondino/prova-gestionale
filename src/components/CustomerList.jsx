import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Users, UserPlus, Search, Phone, MapPin, Star, Edit3, Trash2, FileSpreadsheet, Upload, History } from 'lucide-react';

export default function CustomerList({ customers, orders, onRefreshCustomers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formZip, setFormZip] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formVip, setFormVip] = useState(false);

  const filteredCustomers = customers.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormCity('');
    setFormZip('');
    setFormProvince('');
    setFormNotes('');
    setFormVip(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormName(cust.name || '');
    setFormPhone(cust.phone || '');
    setFormEmail(cust.email || '');
    setFormAddress(cust.address || '');
    setFormCity(cust.city || '');
    setFormZip(cust.zip || '');
    setFormProvince(cust.province || '');
    setFormNotes(cust.notes || '');
    setFormVip(cust.vip || false);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      alert('Nome e Telefono sono campi obbligatori!');
      return;
    }

    const payload = {
      name: formName,
      phone: formPhone,
      email: formEmail,
      address: formAddress,
      city: formCity,
      zip: formZip,
      province: formProvince,
      notes: formNotes,
      vip: formVip
    };

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        onRefreshCustomers();
      } else {
        const data = await res.json();
        alert('Errore: ' + (data.error || 'Impossibile salvare il cliente'));
      }
    } catch (err) {
      alert('Errore di connessione durante il salvataggio cliente.');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) onRefreshCustomers();
    } catch (err) {
      console.error('Errore eliminazione cliente:', err);
    }
  };

  // Export Customer List to Excel
  const exportCustomersToExcel = () => {
    if (customers.length === 0) {
      alert('Nessun cliente in anagrafica da esportare.');
      return;
    }

    const excelRows = customers.map(c => ({
      'ID Cliente': c.id,
      'Nome e Cognome': c.name,
      'Telefono (Numero Noto)': c.phone,
      'Email': c.email || '',
      'Indirizzo': c.address || '',
      'Città': c.city || '',
      'CAP': c.zip || '',
      'Provincia': c.province || '',
      'Cliente VIP': c.vip ? 'SÌ' : 'NO',
      'Note Cliente': c.notes || '',
      'Data Registrazione': new Date(c.createdAt || Date.now()).toLocaleDateString('it-IT')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 24 }, { wch: 18 }, { wch: 25 },
      { wch: 30 }, { wch: 18 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 35 }, { wch: 18 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Anagrafica Clienti');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Anagrafica_Clienti_${dateStr}.xlsx`);
  };

  // Import Customers from Excel/CSV File
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        let count = 0;
        for (const row of data) {
          const name = row['Nome e Cognome'] || row['Nome'] || row['Cliente'];
          const phone = row['Telefono'] || row['Telefono (Numero Noto)'] || row['Numero'];
          if (name && phone) {
            await fetch('/api/customers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: String(name),
                phone: String(phone),
                email: row['Email'] || '',
                address: row['Indirizzo'] || '',
                city: row['Città'] || '',
                notes: row['Note'] || ''
              })
            });
            count++;
          }
        }
        alert(`Importati ${count} clienti da Excel con successo!`);
        onRefreshCustomers();
      } catch (err) {
        alert('Errore durante la lettura del file Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '700' }}>
            Database Numeri Noti & Anagrafica Clienti
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
            Numeri memorizzati che verranno riconosciuti automaticamente ad ogni chiamata.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {/* Import Excel */}
          <label className="btn-primary" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60A5FA', cursor: 'pointer' }}>
            <Upload size={16} /> Importa da Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelImport} style={{ display: 'none' }} />
          </label>

          {/* Export Excel */}
          <button onClick={exportCustomersToExcel} className="btn-excel">
            <FileSpreadsheet size={18} /> Esporta Anagrafica Excel
          </button>

          {/* Add Customer */}
          <button onClick={openAddModal} className="btn-primary">
            <UserPlus size={18} /> Nuovo Numero Noti
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cerca per Nome, Numero di Telefono o Città..."
          style={{ width: '100%', paddingLeft: '38px' }}
        />
      </div>

      {/* Customers Grid / Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Telefono (Numero Noto)</th>
              <th>Indirizzo / Città</th>
              <th>Note</th>
              <th>VIP</th>
              <th style={{ textAlign: 'right' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Nessun cliente trovato in anagrafica.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(cust => {
                const custOrdersCount = orders.filter(o => o.phone === cust.phone || o.customerId === cust.id).length;

                return (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {cust.name}
                        {cust.vip && <Star size={14} color="var(--accent-amber)" fill="var(--accent-amber)" />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {cust.email || 'Nessuna email'} • {custOrdersCount} ordini effettuati
                      </div>
                    </td>

                    <td style={{ fontWeight: '600', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="var(--primary)" />
                        {cust.phone}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.88rem' }}>
                      {cust.address ? `${cust.address}, ${cust.city || ''}` : (cust.city || 'Indirizzo non inserito')}
                    </td>

                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                      {cust.notes || '-'}
                    </td>

                    <td>
                      {cust.vip ? (
                        <span className="badge badge-warning">VIP</span>
                      ) : (
                        <span className="badge badge-info">Standard</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setCustomerHistory({ customer: cust, orders: orders.filter(o => o.phone === cust.phone || o.customerId === cust.id) })}
                          title="Storico Ordini"
                          style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', padding: '6px', borderRadius: '6px' }}
                        >
                          <History size={16} />
                        </button>

                        <button
                          onClick={() => openEditModal(cust)}
                          title="Modifica Cliente"
                          style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '6px', borderRadius: '6px' }}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteCustomer(cust.id)}
                          title="Elimina"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', padding: '6px', borderRadius: '6px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '550px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
                {editingCustomer ? 'Modifica Numero / Cliente' : 'Registra Nuovo Numero Noto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'white' }}>✕</button>
            </div>

            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nome e Cognome *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="es. Mario Rossi"
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Telefono *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+39 340 1234567"
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  style={{ width: '100%', marginTop: '2px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Indirizzo di Spedizione</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Via/Piazza e Numero Civico"
                  style={{ width: '100%', marginTop: '2px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Città</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Città"
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CAP</label>
                  <input
                    type="text"
                    value={formZip}
                    onChange={(e) => setFormZip(e.target.value)}
                    placeholder="CAP"
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Provincia</label>
                  <input
                    type="text"
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    placeholder="MI"
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Note personali cliente</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="es. Preferenze orarie, note per il corriere..."
                  style={{ width: '100%', marginTop: '2px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="vipCheck"
                  checked={formVip}
                  onChange={(e) => setFormVip(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="vipCheck" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Contrassegna come Cliente VIP
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                  Annulla
                </button>
                <button type="submit" className="btn-primary">
                  Salva in Anagrafica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Order History Modal */}
      {customerHistory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '650px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
                Storico Ordini: {customerHistory.customer.name} ({customerHistory.customer.phone})
              </h3>
              <button onClick={() => setCustomerHistory(null)} style={{ background: 'transparent', color: 'white' }}>✕</button>
            </div>

            {customerHistory.orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                Nessun ordine registrato per questo cliente.
              </p>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {customerHistory.orders.map(order => (
                  <div key={order.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <b style={{ color: 'var(--primary)' }}>{order.id}</b>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(order.date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem' }}>
                      {(order.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem' }}>
                      <span>Stato: <b style={{ color: 'var(--accent-green)' }}>{order.status}</b></span>
                      <b style={{ color: '#34D399' }}>Totale: € {order.total.toFixed(2)}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button onClick={() => setCustomerHistory(null)} className="btn-primary">Chiudi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
