import React from 'react';
import { PhoneCall, ShoppingCart, Users, Euro, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats, onSimulateCall }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      
      {/* Total Calls */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Chiamate Gestite</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
            {stats.totalCalls || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Live stream attivo
          </div>
        </div>
        <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
          <PhoneCall size={24} />
        </div>
      </div>

      {/* Total Orders */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Ordini Registrati</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
            {stats.totalOrders || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gestionale Excel sincronizzato
          </div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', padding: '12px', borderRadius: '12px' }}>
          <ShoppingCart size={24} />
        </div>
      </div>

      {/* Total Revenue */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Fatturato Totale</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: 'var(--font-heading)', color: '#34D399', marginTop: '4px' }}>
            € {(stats.totalRevenue || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Da ordini telefonici
          </div>
        </div>
        <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', padding: '12px', borderRadius: '12px' }}>
          <Euro size={24} />
        </div>
      </div>

      {/* Customer DB */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Numeri in Anagrafica</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
            {stats.totalCustomers || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Database numeri noti
          </div>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', padding: '12px', borderRadius: '12px' }}>
          <Users size={24} />
        </div>
      </div>

    </div>
  );
}
