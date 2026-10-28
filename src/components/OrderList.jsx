import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet, Search, Filter, Eye, Trash2, Calendar, Phone,
  MapPin, CheckCircle, Plus, Edit3, Layers, RefreshCw, Save, X
} from 'lucide-react';

export default function OrderList({ orders, onRefreshOrders }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tutti');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Manual new order modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualOrigin, setManualOrigin] = useState('Chiamata Cellulare');
  const [manualProductName, setManualProductName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualShipping, setManualShipping] = useState(0);
  const [manualPayment, setManualPayment] = useState('Contrassegno (Alla Consegna)');
  const [manualNotes, setManualNotes] = useState('');

  // Edit Order modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProvenienza, setEditProvenienza] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [editShipping, setEditShipping] = useState(0);
  const [editPayment, setEditPayment] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // New Item input inside Edit Modal
  const [editAddName, setEditAddName] = useState('');
  const [editAddPrice, setEditAddPrice] = useState('');
  const [editAddQty, setEditAddQty] = useState(1);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.phone && order.phone.includes(searchTerm)) ||
      (order.provenienza && order.provenienza.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'Tutti' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Open Edit Modal with selected order values
  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName || '');
    setEditPhone(order.phone || '');
    setEditProvenienza(order.provenienza || 'Chiamata Cellulare');
    setEditAddress(order.shippingAddress || '');
    setEditItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);
    setEditShipping(order.shippingCost || 0);
    setEditPayment(order.paymentMethod || 'Contrassegno (Alla Consegna)');
    setEditStatus(order.status || 'Nuovo');
    setEditNotes(order.notes || '');
    
    setEditAddName('');
    setEditAddPrice('');
    setEditAddQty(1);
  };

  // Add Item to Edit List
  const handleAddItemToEdit = (e) => {
    e.preventDefault();
    if (!editAddName || !editAddPrice) {
      alert('Inserisci nome prodotto e prezzo!');
      return;
    }
    setEditItems(prev => [...prev, {
      productId: 'item-' + Date.now(),
      name: editAddName.trim(),
      price: parseFloat(editAddPrice),
      quantity: parseInt(editAddQty || 1, 10)
    }]);
    setEditAddName('');
    setEditAddPrice('');
    setEditAddQty(1);
  };

  const handleRemoveItemFromEdit = (index) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemQtyInEdit = (index, newQty) => {
    const qty = Math.max(1, parseInt(newQty || 1, 10));
    setEditItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  };

  // Save edited order to backend
  const handleSaveEditedOrder = async (e) => {
    e.preventDefault();
    if (!editCustomerName || !editPhone) {
      alert('Inserisci Nome e Telefono del cliente!');
      return;
    }
    if (editItems.length === 0) {
      alert('L\'ordine deve contenere almeno un prodotto!');
      return;
    }

    const payload = {
      customerName: editCustomerName,
      phone: editPhone,
      provenienza: editProvenienza,
      shippingAddress: editAddress,
      items: editItems,
      shippingCost: parseFloat(editShipping || 0),
      paymentMethod: editPayment,
      status: editStatus,
      notes: editNotes
    };

    try {
      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingOrder(null);
        if (selectedOrder?.id === editingOrder.id) setSelectedOrder(null);
        onRefreshOrders();
      } else {
        const data = await res.json();
        alert('Errore modifica ordine: ' + (data.error || 'Impossibile salvare'));
      }
    } catch (err) {
      alert('Errore di connessione durante la modifica dell\'ordine.');
    }
  };

  // Handle manual new order submission
  const handleSaveManualOrder = async (e) => {
    e.preventDefault();
    if (!manualCustomerName || !manualPhone) {
      alert('Inserisci Nome e Telefono del cliente!');
      return;
    }
    if (!manualProductName || !manualPrice) {
      alert('Inserisci il nome del prodotto ed il prezzo!');
      return;
    }

    const items = [{
      productId: 'manual-' + Date.now(),
      name: manualProductName.trim(),
      price: parseFloat(manualPrice),
      quantity: parseInt(manualQty || 1, 10)
    }];

    const orderPayload = {
      customerName: manualCustomerName,
      phone: manualPhone,
      provenienza: manualOrigin || 'Chiamata Cellulare',
      shippingAddress: manualAddress,
      items,
      shippingCost: parseFloat(manualShipping || 0),
      paymentMethod: manualPayment,
      notes: manualNotes,
      callDurationSeconds: 0
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        setIsManualModalOpen(false);
        setManualCustomerName('');
        setManualPhone('');
        setManualAddress('');
        setManualProductName('');
        setManualPrice('');
        setManualNotes('');
        setManualShipping(0);
        onRefreshOrders();
      } else {
        const data = await res.json();
        alert('Errore: ' + (data.error || 'Impossibile salvare ordine'));
      }
    } catch (err) {
      alert('Errore di connessione durante il salvataggio.');
    }
  };

  // Export Excel organized by Provenienza and AUTOMATICALLY CLEAR ORDER REGISTRY
  const exportOrganizedExcel = async () => {
    if (orders.length === 0) {
      alert('Nessun ordine presente nel registro per l\'esportazione.');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Group orders by Provenienza (Città / Canale)
      const grouped = {};
      orders.forEach(ord => {
        const prov = (ord.provenienza || ord.shippingAddress || 'Chiamata Cellulare').trim();
        if (!grouped[prov]) grouped[prov] = [];
        grouped[prov].push(ord);
      });

      // 1. Overview Sheet sorted by Provenienza
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

      // 2. Separate Sheets for each Provenienza
      const usedSheetNames = new Set(['Tutti gli Ordini']);

      Object.keys(grouped).forEach(provName => {
        let cleanName = provName.replace(/[\:\\/\?\*\[\]]/g, '').trim();
        if (!cleanName) cleanName = 'Provenienza';
        
        cleanName = cleanName.substring(0, 22);

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

      // Clear backend active orders
      await fetch('/api/orders/clear', { method: 'POST' });

      // Trigger browser download of Excel file
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Ordini_Organizzati_Per_Provenienza_${dateStr}.xlsx`);

      // Refresh UI table immediately to 0 orders
      onRefreshOrders();
    } catch (err) {
      console.error('Errore durante l\'esportazione Excel:', err);
      alert('Si è verificato un errore durante l\'esportazione Excel: ' + err.message);
    }
  };

  // Manual Clear Orders Registry Button
  const handleClearAllOrders = async () => {
    if (!window.confirm('Sei sicuro di voler svuotare l\'intero registro ordini?')) return;
    try {
      const res = await fetch('/api/orders/clear', { method: 'POST' });
      if (res.ok) {
        onRefreshOrders();
      } else {
        alert('Impossibile svuotare il registro ordini.');
      }
    } catch (err) {
      alert('Errore di connessione durante lo svuotamento del registro.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onRefreshOrders();
      }
    } catch (err) {
      console.error('Errore aggiornamento stato:', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'ordine ${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshOrders();
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
      } else {
        const data = await res.json();
        alert('Errore eliminazione: ' + (data.error || 'Impossibile eliminare'));
      }
    } catch (err) {
      console.error('Errore eliminazione ordine:', err);
      alert('Errore di rete durante l\'eliminazione dell\'ordine.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Consegnato': return 'badge-success';
      case 'Spedito': return 'badge-info';
      case 'In Lavorazione': return 'badge-warning';
      case 'Annullato': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const calculateEditSubtotal = () => {
    return editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateEditTotal = () => {
    return calculateEditSubtotal() + parseFloat(editShipping || 0);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '700' }}>
            Gestionale Ordini E-Commerce
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
            {orders.length} ordini registrati nel sistema.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {/* Manual Order button */}
          <button onClick={() => setIsManualModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Nuovo Ordine Manuale
          </button>

          {/* Excel Export Organized By Provenienza Button */}
          <button onClick={exportOrganizedExcel} className="btn-excel">
            <FileSpreadsheet size={18} /> Invia / Esporta Tutti gli Ordini in Excel (Organizzati per Provenienza)
          </button>

          {/* Manual Clear Registry Button */}
          <button
            onClick={handleClearAllOrders}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--accent-red)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <Trash2 size={16} /> Svuota Registro Ordini
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per ID, Cliente, Provenienza, Telefono o Note..."
            style={{ width: '100%', paddingLeft: '38px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '160px' }}
          >
            <option value="Tutti">Tutti gli Stati</option>
            <option value="Nuovo">Nuovo</option>
            <option value="In Lavorazione">In Lavorazione</option>
            <option value="Spedito">Spedito</option>
            <option value="Consegnato">Consegnato</option>
            <option value="Annullato">Annullato</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID Ordine</th>
              <th>Provenienza</th>
              <th>Data & Ora</th>
              <th>Cliente & Telefono</th>
              <th>Prodotti</th>
              <th>Totale</th>
              <th>Stato Ordine</th>
              <th style={{ textAlign: 'right' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Nessun ordine presente nel registro.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                    {order.id}
                  </td>

                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.78rem' }}>
                      {order.provenienza || 'Chiamata Cellulare'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {new Date(order.date).toLocaleDateString('it-IT')}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {order.phone}
                    </div>
                  </td>

                  <td style={{ fontSize: '0.85rem', maxWidth: '250px' }}>
                    <div style={{ fontWeight: '500' }}>
                      {(order.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                    {order.notes && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note: {order.notes}
                      </div>
                    )}
                  </td>

                  <td style={{ fontWeight: '700', color: 'var(--accent-green)', fontFamily: 'var(--font-heading)' }}>
                    € {order.total.toFixed(2)}
                  </td>

                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`badge ${getStatusBadgeClass(order.status)}`}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="Nuovo">Nuovo</option>
                      <option value="In Lavorazione">In Lavorazione</option>
                      <option value="Spedito">Spedito</option>
                      <option value="Consegnato">Consegnato</option>
                      <option value="Annullato">Annullato</option>
                    </select>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      {/* Dettaglio Button */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        title="Vedi Dettaglio"
                        style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={15} /> Dettagli
                      </button>

                      {/* Modifica Ordine Button */}
                      <button
                        onClick={() => openEditModal(order)}
                        title="Modifica Ordine"
                        style={{ background: 'rgba(245, 158, 11, 0.18)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                      >
                        <Edit3 size={15} /> Modifica
                      </button>

                      {/* Elimina Ordine Button */}
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Elimina Ordine"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={15} /> Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODIFICA ORDINE MODAL */}
      {editingOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto', padding: '24px' }}>
            
            {/* Header Modal Modifica */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '8px', borderRadius: '8px' }}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800' }}>
                    Modifica Ordine {editingOrder.id}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Modifica anagrafica cliente, articoli ordinati, totale e stato dell'ordine
                  </div>
                </div>
              </div>

              <button onClick={() => setEditingOrder(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Sezione Anagrafica Cliente */}
              <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>
                  ANAGRAFICA & RECAPITO CLIENTE
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nome e Cognome Cliente *</label>
                    <input
                      type="text"
                      required
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      style={{ width: '100%', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Telefono *</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      style={{ width: '100%', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Provenienza / Città *</label>
                    <input
                      type="text"
                      required
                      value={editProvenienza}
                      onChange={(e) => setEditProvenienza(e.target.value)}
                      placeholder="es. Milano, Roma..."
                      style={{ width: '100%', marginTop: '2px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Indirizzo di Spedizione</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Via, Civico, CAP, Città..."
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
              </div>

              {/* Sezione Gestione Articoli Ordine */}
              <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>ARTICOLI NELL'ORDINE ({editItems.length})</span>
                  <span>Subtotale Articoli: € {calculateEditSubtotal().toFixed(2)}</span>
                </div>

                {/* Tabella Articoli Esistenti nell'Ordine */}
                {editItems.length === 0 ? (
                  <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', fontStyle: 'italic', padding: '8px 0' }}>
                    ⚠️ L'ordine è vuoto! Aggiungi almeno un articolo sotto.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {editItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>€ {item.price.toFixed(2)} cad.</div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Qtà</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQtyInEdit(idx, e.target.value)}
                            style={{ width: '100%', padding: '4px 8px', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div style={{ textAlign: 'right', fontWeight: '700', color: 'var(--accent-green)', fontSize: '0.9rem' }}>
                          € {(item.price * item.quantity).toFixed(2)}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromEdit(idx)}
                            title="Rimuovi Articolo"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', padding: '6px', borderRadius: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form Aggiunta Nuovo Articolo all'Ordine */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>
                    + Aggiungi Nuovo Prodotto a questo Ordine:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(90px, 110px)', gap: '8px', alignItems: 'end', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Nome Prodotto..."
                      value={editAddName}
                      onChange={(e) => setEditAddName(e.target.value)}
                      style={{ fontSize: '0.88rem', width: '100%' }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Prezzo €"
                      value={editAddPrice}
                      onChange={(e) => setEditAddPrice(e.target.value)}
                      style={{ fontSize: '0.88rem', width: '100%' }}
                    />
                    <input
                      type="number"
                      min="1"
                      value={editAddQty}
                      onChange={(e) => setEditAddQty(e.target.value)}
                      style={{ fontSize: '0.88rem', width: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToEdit}
                      className="order-add-item-btn"
                    >
                      + Aggiungi
                    </button>
                  </div>
                </div>

              </div>

              {/* Sezione Spedizione, Pagamento, Stato & Note */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Costo Spedizione (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editShipping}
                    onChange={(e) => setEditShipping(e.target.value)}
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stato Ordine</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', marginTop: '2px' }}
                  >
                    <option value="Nuovo">Nuovo</option>
                    <option value="In Lavorazione">In Lavorazione</option>
                    <option value="Spedito">Spedito</option>
                    <option value="Consegnato">Consegnato</option>
                    <option value="Annullato">Annullato</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Metodo di Pagamento</label>
                  <select
                    value={editPayment}
                    onChange={(e) => setEditPayment(e.target.value)}
                    style={{ width: '100%', marginTop: '2px' }}
                  >
                    <option value="Contrassegno (Alla Consegna)">Contrassegno (Alla Consegna)</option>
                    <option value="Bonifico Bancario">Bonifico Bancario</option>
                    <option value="Carta di Credito / POS">Carta di Credito / POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Note Ordine</label>
                <textarea
                  rows="2"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Note operative sull'ordine..."
                  style={{ width: '100%', marginTop: '2px' }}
                />
              </div>

              {/* Bottom Save Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 17, 26, 0.9)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Totale Ricalcolato Ordine:</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'var(--font-heading)' }}>
                    € {calculateEditTotal().toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '600' }}
                  >
                    Annulla
                  </button>

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                      color: 'white',
                      fontWeight: '700',
                      padding: '10px 22px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <Save size={18} /> Salva Modifiche Ordine
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      {isManualModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '600px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--primary)" /> Nuovo Ordine Manuale
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} style={{ background: 'transparent', color: 'white' }}>✕</button>
            </div>

            <form onSubmit={handleSaveManualOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nome e Cognome Cliente *</label>
                  <input
                    type="text"
                    required
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    placeholder="es. Mario Rossi"
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Telefono *</label>
                  <input
                    type="text"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="+39 340..."
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Provenienza Ordine / Città *</label>
                <input
                  type="text"
                  required
                  value={manualOrigin}
                  onChange={(e) => setManualOrigin(e.target.value)}
                  placeholder="es. Milano, Roma, Cellulare, Sito Web..."
                  style={{ width: '100%', marginTop: '2px' }}
                />
              </div>

              {/* Free product & price writing */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--accent-green)' }}>
                  Scrittura Libera Prodotto e Prezzo
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nome Prodotto Libero *</label>
                    <input
                      type="text"
                      required
                      value={manualProductName}
                      onChange={(e) => setManualProductName(e.target.value)}
                      placeholder="es. Scarpe Nike misura 42"
                      style={{ width: '100%', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prezzo (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="89.90"
                      style={{ width: '100%', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quantità</label>
                    <input
                      type="number"
                      min="1"
                      value={manualQty}
                      onChange={(e) => setManualQty(e.target.value)}
                      style={{ width: '100%', marginTop: '2px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Spesa Spedizione (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualShipping}
                    onChange={(e) => setManualShipping(e.target.value)}
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Metodo Pagamento</label>
                  <select
                    value={manualPayment}
                    onChange={(e) => setManualPayment(e.target.value)}
                    style={{ width: '100%', marginTop: '2px' }}
                  >
                    <option value="Contrassegno (Alla Consegna)">Contrassegno (Alla Consegna)</option>
                    <option value="Bonifico Bancario">Bonifico Bancario</option>
                    <option value="Carta di Credito / POS">Carta di Credito / POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Note Ordine</label>
                <textarea
                  rows="2"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Note aggiuntive..."
                  style={{ width: '100%', marginTop: '2px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsManualModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                  Annulla
                </button>
                <button type="submit" className="btn-primary">
                  Salva Ordine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '600px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
                Dettaglio Ordine {selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', color: 'white' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.9rem' }}>
              <div><b>Cliente:</b> {selectedOrder.customerName}</div>
              <div><b>Telefono:</b> {selectedOrder.phone}</div>
              <div><b>Provenienza:</b> {selectedOrder.provenienza || 'Chiamata Cellulare'}</div>
              <div><b>Pagamento:</b> {selectedOrder.paymentMethod}</div>
              <div style={{ gridColumn: 'span 2' }}><b>Indirizzo:</b> {selectedOrder.shippingAddress || 'N/D'}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <b style={{ fontSize: '0.9rem' }}>Articoli Ordinati:</b>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', marginTop: '6px' }}>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '4px 0' }}>
                    <span>{item.name} (x{item.quantity})</span>
                    <b>€ {(item.price * item.quantity).toFixed(2)}</b>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Spedizione: € {selectedOrder.shippingCost.toFixed(2)}</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--accent-green)', fontWeight: '700' }}>Totale: € {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <b>Note:</b> {selectedOrder.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openEditModal(selectedOrder)}
                  style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={16} /> Modifica Questo Ordine
                </button>

                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={16} /> Elimina Ordine
                </button>
              </div>

              <button onClick={() => setSelectedOrder(null)} className="btn-primary">Chiudi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
