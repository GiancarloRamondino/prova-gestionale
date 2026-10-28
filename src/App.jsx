import React, { useState, useEffect } from 'react';
import {
  PhoneCall, ShoppingCart, Users, Package, Smartphone, LayoutDashboard,
  Zap, Bell, RefreshCw, Radio, Cloud
} from 'lucide-react';

import StatsOverview from './components/StatsOverview';
import OrderList from './components/OrderList';
import CustomerList from './components/CustomerList';
import ProductCatalog from './components/ProductCatalog';
import PhoneSetupGuide from './components/PhoneSetupGuide';
import CallModal from './components/CallModal';
import { ShopifyProductList, OrdersList, ShopifyDashboard } from './hooks/useShopify.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'customers' | 'products' | 'guide' | 'shopify'
  
  // App state
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [activeCall, setActiveCall] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial data
  const fetchAllData = async () => {
    try {
      const [ordRes, custRes, prodRes, statRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/products'),
        fetch('/api/stats')
      ]);

      if (ordRes.ok) setOrders(await ordRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (statRes.ok) setStats(await statRes.json());
    } catch (err) {
      console.error('Errore caricamento dati API:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Connect to SSE Live Call Stream from backend
  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource('/api/calls/stream');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const callData = JSON.parse(event.data);
          setActiveCall(callData);
        } catch (e) {
          console.error('Errore parsing evento SSE chiamata:', e);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      setIsConnected(false);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Trigger simulated call directly via API POST /api/calls/incoming
  const triggerSimulatedCall = async (phone = '+39 340 123 4567', name = 'Marco Rossi') => {
    try {
      const res = await fetch('/api/calls/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name })
      });
      const data = await res.json();
      if (data.success && data.call) {
        setActiveCall(data.call);
      }
    } catch (err) {
      alert('Errore invio chiamata simulata.');
    }
  };

  const handleOrderCreated = () => {
    fetchAllData();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Navigation Bar */}
      <header style={{
        height: '70px',
        background: 'rgba(13, 17, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #4338CA 100%)',
            color: 'white',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px var(--primary-glow)'
          }}>
            <PhoneCall size={22} />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.3px', background: 'linear-gradient(to right, #FFF, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CallCenter E-Commerce CRM
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Riconoscimento Chiamate Cellulare & Gestionale Excel</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: isConnected ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                <Radio size={12} /> {isConnected ? 'Live Webhook Attivo' : 'Connessione API'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Simulate Call Button */}
          <button
            onClick={() => triggerSimulatedCall('+39 340 123 4567', 'Marco Rossi')}
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              fontWeight: '700',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem'
            }}
          >
            <Zap size={16} /> Simula Chiamata in Entrata
          </button>

          {/* Refresh Data */}
          <button
            onClick={fetchAllData}
            title="Aggiorna Dati"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '8px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <RefreshCw size={18} />
          </button>

        </div>
      </header>

      {/* Main Container Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Sidebar Menu */}
        <aside style={{
          width: '240px',
          background: 'rgba(13, 17, 26, 0.5)',
          borderRight: '1px solid var(--border-color)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: '600',
              background: activeTab === 'orders' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
              borderLeft: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent'
            }}
          >
            <ShoppingCart size={18} /> Gestionale Ordini
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: '600',
              background: activeTab === 'customers' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'customers' ? 'var(--primary)' : 'var(--text-muted)',
              borderLeft: activeTab === 'customers' ? '3px solid var(--primary)' : '3px solid transparent'
            }}
          >
            <Users size={18} /> Numeri Noti & Clienti
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: '600',
              background: activeTab === 'products' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-muted)',
              borderLeft: activeTab === 'products' ? '3px solid var(--primary)' : '3px solid transparent'
            }}
          >
            <Package size={18} /> Catalogo Prodotti
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: '600',
              background: activeTab === 'guide' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'guide' ? 'var(--primary)' : 'var(--text-muted)',
              borderLeft: activeTab === 'guide' ? '3px solid var(--primary)' : '3px solid transparent'
            }}
          >
            <Smartphone size={18} /> Guida Smartphone
          </button>

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }}></div>

          <button
            onClick={() => setActiveTab('shopify')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: '600',
              background: activeTab === 'shopify' ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
              color: activeTab === 'shopify' ? '#60A5FA' : 'var(--text-muted)',
              borderLeft: activeTab === 'shopify' ? '3px solid #60A5FA' : '3px solid transparent'
            }}
          >
            <Cloud size={18} /> Shopify Sync
          </button>

        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          
          {/* Top Key Stats Overview Card */}
          <StatsOverview stats={stats} onSimulateCall={triggerSimulatedCall} />

          {/* Dynamic Tab Views */}
          {activeTab === 'orders' && (
            <OrderList orders={orders} onRefreshOrders={fetchAllData} />
          )}

          {activeTab === 'customers' && (
            <CustomerList customers={customers} orders={orders} onRefreshCustomers={fetchAllData} />
          )}

          {activeTab === 'products' && (
            <ProductCatalog products={products} onRefreshProducts={fetchAllData} />
          )}

          {activeTab === 'guide' && (
            <PhoneSetupGuide onSimulateCall={triggerSimulatedCall} />
          )}

          {activeTab === 'shopify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ShopifyDashboard />
              <OrdersList />
              <ShopifyProductList />
            </div>
          )}

        </main>

      </div>

      {/* Active / Incoming Call Modal Pop-Up */}
      {activeCall && (
        <CallModal
          call={activeCall}
          products={products}
          allOrders={orders}
          onClose={() => setActiveCall(null)}
          onOrderCreated={handleOrderCreated}
        />
      )}

    </div>
  );
}
