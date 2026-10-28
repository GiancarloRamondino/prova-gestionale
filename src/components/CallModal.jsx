import React, { useState, useEffect } from 'react';
import {
  PhoneIncoming, PhoneCall, PhoneOff, Volume2, VolumeX, User,
  Plus, Trash2, CheckCircle2, Calendar, UserPlus, X, Ban, Edit3, Save, Zap
} from 'lucide-react';

export default function CallModal({ call, products, allOrders = [], onClose, onOrderCreated }) {
  const [callState, setCallState] = useState('ringing'); // 'ringing' | 'answered'
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Customer state
  const [isKnownCustomer, setIsKnownCustomer] = useState(call?.isKnown || false);
  const [customerName, setCustomerName] = useState(call?.name || '');
  const [customerPhone, setCustomerPhone] = useState(call?.phone || '');
  const [customerOrigin, setCustomerOrigin] = useState(call?.customer?.city || 'Chiamata Cellulare');
  const [customerAddress, setCustomerAddress] = useState(call?.customer?.address || '');
  const [customerNotes, setCustomerNotes] = useState(call?.customer?.notes || '');
  const [isCustomerSaved, setIsCustomerSaved] = useState(false);

  // Quick product & price inputs
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQty, setProductQty] = useState(1);

  // Order items & shipping
  const [items, setItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Contrassegno (Alla Consegna)');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for customer's weekly active orders
  const [weeklyOrders, setWeeklyOrders] = useState([]);

  // Web Audio Ringtone Player for realistic incoming call perception
  useEffect(() => {
    if (callState !== 'ringing' || isMuted) return;

    let audioCtx = null;
    let intervalId = null;

    const playRingTone = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(480, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime + 1.4);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.6);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start(audioCtx.currentTime);
        osc2.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 1.6);
        osc2.stop(audioCtx.currentTime + 1.6);
      } catch (e) {}
    };

    playRingTone();
    intervalId = setInterval(playRingTone, 2800);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
      }
    };
  }, [callState, isMuted]);

  // Timer for active call (starts after answering)
  useEffect(() => {
    if (callState !== 'answered') return;

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filter active weekly orders for this customer (last 7 days)
  useEffect(() => {
    const cleanPhone = (customerPhone || '').replace(/[\s\-\(\)]/g, '');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const filtered = allOrders.filter(order => {
      const orderCleanPhone = (order.phone || '').replace(/[\s\-\(\)]/g, '');
      const orderDate = new Date(order.date);
      const isSamePhone = cleanPhone && orderCleanPhone && cleanPhone === orderCleanPhone;
      const isSameName = customerName && order.customerName && order.customerName.toLowerCase() === customerName.toLowerCase();
      
      return (isSamePhone || isSameName) && orderDate >= sevenDaysAgo;
    });

    setWeeklyOrders(filtered);
  }, [allOrders, customerPhone, customerName]);

  // Quick Customer Registration
  const handleRegisterCustomer = async () => {
    if (!customerName || customerName === 'Numero Sconosciuto' || !customerPhone) {
      alert('Inserisci Nome, Cognome e Numero di Telefono per registrare il cliente!');
      return;
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          city: customerOrigin,
          address: customerAddress,
          notes: customerNotes
        })
      });
      if (res.ok) {
        setIsKnownCustomer(true);
        setIsCustomerSaved(true);
        setTimeout(() => setIsCustomerSaved(false), 3000);
        onOrderCreated();
      }
    } catch (err) {
      alert('Errore durante la registrazione del cliente.');
    }
  };

  // Partial Order Cancellation
  const handleCancelOrderItem = async (orderId, itemIndex) => {
    const targetOrder = weeklyOrders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (!window.confirm(`Sei sicuro di voler annullare questo articolo dall'ordine ${orderId}?`)) return;

    const newItems = targetOrder.items.filter((_, idx) => idx !== itemIndex);

    if (newItems.length === 0) {
      return handleCancelEntireOrder(orderId);
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems })
      });

      if (res.ok) {
        const updated = await res.json();
        setWeeklyOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        onOrderCreated();
      }
    } catch (err) {
      alert('Errore durante l\'annullamento parziale dell\'articolo.');
    }
  };

  // Full Order Cancellation
  const handleCancelEntireOrder = async (orderId) => {
    if (!window.confirm(`Sei sicuro di voler ANNULLARE INTERAMENTE l'ordine ${orderId}?`)) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Annullato' })
      });

      if (res.ok) {
        const updated = await res.json();
        setWeeklyOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        onOrderCreated();
      }
    } catch (err) {
      alert('Errore durante l\'annullamento dell\'ordine.');
    }
  };

  // Add Free-form item to cart
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!productName || !productPrice) {
      alert('Inserisci Prodotto e Prezzo!');
      return;
    }

    const newItem = {
      productId: 'item-' + Date.now(),
      name: productName.trim(),
      price: parseFloat(productPrice),
      quantity: parseInt(productQty || 1, 10)
    };

    setItems(prev => [...prev, newItem]);
    setProductName('');
    setProductPrice('');
    setProductQty(1);
  };

  const handleRemoveItem = (id) => {
    setItems(prev => prev.filter(i => i.productId !== id));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + parseFloat(shippingCost || 0);
  };

  // SAVE ORDER AND CLOSE
  const handleSaveOrder = async () => {
    if (!customerName || customerName === 'Numero Sconosciuto') {
      alert('Per favore inserisci il Nome del cliente prima di salvare!');
      return;
    }

    if (items.length === 0) {
      alert('Inserisci almeno un prodotto nell\'ordine!');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customerName,
      phone: customerPhone,
      provenienza: customerOrigin || 'Chiamata Cellulare',
      shippingAddress: customerAddress || call?.customer?.address || '',
      items,
      shippingCost: parseFloat(shippingCost || 0),
      paymentMethod,
      notes: orderNotes,
      callDurationSeconds: callDuration
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (res.ok) {
        onOrderCreated(data);
        onClose();
      } else {
        alert('Errore nel salvataggio ordine: ' + (data.error || 'Errore server'));
      }
    } catch (err) {
      alert('Errore di connessione durante il salvataggio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // 1. INCOMING RINGING CALL SCREEN (CHIAMATA IN ENTRATA SQUILLO)
  // -------------------------------------------------------------
  if (callState === 'ringing') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(5, 7, 12, 0.88)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
      }} className="incoming-modal-bg">
        
        <div className="glass-modal" style={{
          width: '100%', maxWidth: '460px', padding: '24px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 20px 50px rgba(239, 68, 68, 0.25), 0 0 35px rgba(99, 102, 241, 0.2)',
          position: 'relative', overflow: 'hidden'
        }}>

          {/* Controls */}
          <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Attiva Suoneria' : 'Disattiva Suoneria'}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: isMuted ? 'var(--text-muted)' : 'var(--accent-green)',
                padding: '6px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              onClick={onClose}
              title="Chiudi"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                padding: '6px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Top Live Badge */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#F87171',
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Zap size={13} className="text-blink" /> Chiamata in Entrata (Live Webhook)
          </div>

          {/* Pulsing Avatar */}
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <div className="ripple-circle-1" style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid rgba(239, 68, 68, 0.6)', pointerEvents: 'none' }} />
            <div className="ripple-circle-2" style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid rgba(99, 102, 241, 0.5)', pointerEvents: 'none' }} />
            
            <div className="ring-pulse-red phone-shake-anim" style={{
              width: '74px', height: '74px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', boxShadow: '0 6px 25px rgba(239, 68, 68, 0.5)',
              zIndex: 2
            }}>
              <PhoneIncoming size={36} />
            </div>
          </div>

          {/* Caller Details */}
          <div style={{ marginBottom: '20px', width: '100%' }}>
            <div className="text-blink" style={{ fontSize: '0.82rem', color: 'var(--accent-red)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              📲 Squillo in corso...
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'white', lineHeight: '1.2' }}>
              {isKnownCustomer ? customerName : (customerName || 'Numero Sconosciuto')}
            </div>

            <div style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: '600', marginTop: '3px' }}>
              {customerPhone}
            </div>

            <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: isKnownCustomer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: isKnownCustomer ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)' }}>
              <User size={13} style={{ color: isKnownCustomer ? 'var(--accent-green)' : 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: '600', color: isKnownCustomer ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                {isKnownCustomer ? `Cliente Noto (${customerOrigin})` : 'Nuovo Contatto'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '10px', width: '100%' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                fontWeight: '700',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.92rem'
              }}
            >
              <PhoneOff size={18} /> Rifiuta
            </button>

            <button
              onClick={() => setCallState('answered')}
              className="ring-pulse-green"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                border: 'none',
                color: 'white',
                fontWeight: '800',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.98rem',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
              }}
            >
              <PhoneCall size={20} /> RISPONDI
            </button>
          </div>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. ANSWERED ACTIVE CALL DASHBOARD VIEW (COMPACT FIT-ON-SCREEN)
  // -------------------------------------------------------------
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
    }}>
      <div className="glass-modal" style={{ width: '100%', maxWidth: '1080px', maxHeight: '96vh', display: 'flex', flexDirection: 'column' }}>

        {/* Top Compact Header */}
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(99, 102, 241, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ring-pulse-green" style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--accent-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <PhoneIncoming size={18} />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                🟢 IN CHIAMATA ATTIVA - {formatTimer(callDuration)}
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{customerName || 'Cliente Non Registrato'}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '400' }}>({customerPhone})</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* 2-COLUMN DASHBOARD GRID LAYOUT (COMPACT FIT ON SCREEN) */}
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '16px', overflowY: 'auto' }}>
          
          {/* LEFT COLUMN: ANAGRAFICA & PRODUCT CARTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 1. ANAGRAFICA CLIENTE */}
            <div className="glass-panel" style={{ padding: '14px', background: isKnownCustomer ? 'rgba(255,255,255,0.02)' : 'rgba(245, 158, 11, 0.08)', border: isKnownCustomer ? '1px solid var(--border-color)' : '1px dashed var(--accent-amber)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ color: isKnownCustomer ? 'var(--primary)' : 'var(--accent-amber)', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} /> {isKnownCustomer ? 'DATI CLIENTE NOTO' : 'REGISTRA NUOVO CLIENTE IN ANAGRAFICA'}
                </div>

                <button
                  type="button"
                  onClick={handleRegisterCustomer}
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#60A5FA',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Save size={13} /> {isCustomerSaved ? 'Registrato!' : 'Registra in DB'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nome e Cognome *</label>
                  <input
                    type="text"
                    required
                    value={customerName === 'Numero Sconosciuto' ? '' : customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="es. Mario Rossi"
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Telefono</label>
                  <input
                    type="text"
                    readOnly
                    value={customerPhone}
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem', opacity: 0.8 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Provenienza / Città *</label>
                  <input
                    type="text"
                    value={customerOrigin}
                    onChange={(e) => setCustomerOrigin(e.target.value)}
                    placeholder="es. Milano, Roma..."
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Indirizzo Spedizione</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Via, Civico, CAP..."
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Note Cliente</label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Note..."
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. AGGIUNGI PRODOTTO ALL'ORDINE CORRENTE */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Aggiungi Prodotto all'Ordine (Scrittura Libera)
              </div>

              <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'end', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Prodotto *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="es. Caffè 1Kg"
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Prezzo (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="18.90"
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qtà</label>
                  <input
                    type="number"
                    min="1"
                    value={productQty}
                    onChange={(e) => setProductQty(e.target.value)}
                    style={{ width: '100%', marginTop: '1px', padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: '700',
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={15} /> Aggiungi
                </button>
              </form>

              {/* LISTA PRODOTTI NELL'ORDINE CORRENTE */}
              {items.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                  <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '4px 8px' }}>Prodotto</th>
                        <th style={{ padding: '4px 8px' }}>Prezzo</th>
                        <th style={{ padding: '4px 8px', textAlign: 'center' }}>Qtà</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right' }}>Subtotale</th>
                        <th style={{ padding: '4px 8px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.productId}>
                          <td style={{ padding: '6px 8px', fontWeight: '600' }}>{item.name}</td>
                          <td style={{ padding: '6px 8px' }}>€ {item.price.toFixed(2)}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700', color: 'var(--accent-green)' }}>
                            € {(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                            <button onClick={() => handleRemoveItem(item.productId)} style={{ background: 'transparent', color: 'var(--accent-red)', padding: '2px' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: ORDINI ATTIVI SETTIMANA, CONDIZIONI & SALVATAGGIO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* ORDINI ATTIVI NELLA SETTIMANA DEL CLIENTE */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} /> Ordini Settimana del Cliente ({weeklyOrders.length})
              </div>

              {weeklyOrders.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '6px 0', fontStyle: 'italic' }}>
                  Nessun ordine registrato nei passati 7 giorni per questo cliente.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {weeklyOrders.map(ord => (
                    <div key={ord.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px' }}>
                      
                      {/* Header Ordine Settimanale */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                        <div style={{ fontSize: '0.82rem' }}>
                          <b style={{ color: 'var(--primary)' }}>{ord.id}</b> • {new Date(ord.date).toLocaleDateString('it-IT')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${ord.status === 'Annullato' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                            {ord.status}
                          </span>
                          <b style={{ color: 'var(--accent-green)', fontSize: '0.88rem' }}>€ {ord.total.toFixed(2)}</b>
                          {ord.status !== 'Annullato' && (
                            <button
                              onClick={() => handleCancelEntireOrder(ord.id)}
                              title="Annulla Intero Ordine"
                              style={{ background: 'rgba(239, 68, 68, 0.18)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Ban size={11} /> Annulla Ordine
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lista Articoli con Annullamento per Singolo Articolo */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {(ord.items || []).map((item, itemIdx) => (
                          <div key={itemIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', background: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '4px' }}>
                            <span>{item.name} (x{item.quantity} - €{item.price.toFixed(2)})</span>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <b style={{ color: 'var(--text-main)' }}>€ {(item.price * item.quantity).toFixed(2)}</b>
                              {ord.status !== 'Annullato' && (
                                <button
                                  onClick={() => handleCancelOrderItem(ord.id, itemIdx)}
                                  title="Annulla Soltanto Questo Articolo"
                                  style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}
                                >
                                  <Trash2 size={12} /> Annulla Articolo
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NOTE ORDINE */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Note Ordine</label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Note aggiuntive sull'ordine..."
                style={{ width: '100%', marginTop: '2px', padding: '6px 8px', fontSize: '0.85rem' }}
              />
            </div>

            {/* BOTTONE SALVATAGGIO INFERIORE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 17, 26, 0.9)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Totale Nuovo Ordine:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'var(--font-heading)' }}>
                  € {calculateTotal().toFixed(2)}
                </div>
              </div>

              <button
                onClick={handleSaveOrder}
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-green) 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: '700',
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.98rem',
                  boxShadow: '0 4px 16px var(--accent-green-glow)'
                }}
              >
                <CheckCircle2 size={18} /> {isSubmitting ? 'Salvataggio...' : 'Salva Ordine'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
