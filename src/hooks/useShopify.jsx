import { useState, useEffect } from 'react';
import ShopifyAuthButton from '../components/ShopifyAuthButton';

/**
 * Hook personalizzato per Shopify API
 */
export function useShopify() {
  const baseUrl = 'http://localhost:3001/api/shopify';

  const getProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  const getProductById = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const getOrders = async () => {
    try {
      const response = await fetch(`${baseUrl}/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };

  const getOrderById = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  };

  const createCustomer = async (customerData) => {
    try {
      const response = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!response.ok) throw new Error('Failed to create customer');
      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  const getCustomers = async () => {
    try {
      const response = await fetch(`${baseUrl}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  };

  const getShopInfo = async () => {
    try {
      const response = await fetch(`${baseUrl}/shop`);
      if (!response.ok) throw new Error('Failed to fetch shop info');
      return await response.json();
    } catch (error) {
      console.error('Error fetching shop info:', error);
      throw error;
    }
  };

  return {
    getProducts,
    getProductById,
    createOrder,
    getOrders,
    getOrderById,
    createCustomer,
    getCustomers,
    getShopInfo
  };
}

/**
 * Componente: Lista Prodotti Shopify
 */
export function ShopifyProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getProducts } = useShopify();

  useEffect(() => {
    getProducts()
      .then(data => {
        setProducts(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading" style={{ padding: '20px', textAlign: 'center' }}>Caricamento prodotti Shopify...</div>;
  if (error) return <div className="error" style={{ padding: '20px', textAlign: 'center', color: '#EF4444' }}>Errore: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#60A5FA' }}>📦 Prodotti Shopify</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {products.map(product => (
          <div key={product.id} style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            background: 'rgba(13, 17, 26, 0.5)',
            cursor: 'pointer'
          }}>
            {product.image && (
              <img src={product.image.src} alt={product.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }} />
            )}
            <h3 style={{ marginBottom: '8px', color: '#FFF', fontSize: '0.95rem' }}>{product.title}</h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '10px' }}>{product.vendor}</p>
            <p style={{ color: '#60A5FA', fontWeight: 'bold', marginBottom: '12px' }}>€{product.variants[0]?.price || 'N/D'}</p>
            <button style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(96, 165, 250, 0.2)',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              color: '#60A5FA',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}>Aggiungi al carrello</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente: Lista Ordini
 */
export function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getOrders } = useShopify();

  useEffect(() => {
    getOrders()
      .then(data => {
        setOrders(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Caricamento ordini Shopify...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: '#EF4444' }}>Errore: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#60A5FA' }}>📋 Ordini Recenti Shopify</h2>
      {orders.length === 0 ? (
        <p style={{ color: '#9CA3AF', textAlign: 'center' }}>Nessun ordine trovato</p>
      ) : (
        <div style={{
          overflowX: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          background: 'rgba(13, 17, 26, 0.5)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(99, 102, 241, 0.1)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#60A5FA' }}>ID Ordine</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#60A5FA' }}>Cliente</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#60A5FA' }}>Totale</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#60A5FA' }}>Stato</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#60A5FA' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order, idx) => (
                <tr key={order.id} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: idx % 2 === 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                }}>
                  <td style={{ padding: '12px 16px', color: '#E5E7EB' }}>#{order.order_number}</td>
                  <td style={{ padding: '12px 16px', color: '#E5E7EB' }}>
                    {order.customer?.first_name} {order.customer?.last_name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#10B981' }}>€{order.total_price}</td>
                  <td style={{ padding: '12px 16px', color: '#FBBF24' }}>{order.fulfillment_status || 'pending'}</td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>
                    {new Date(order.created_at).toLocaleDateString('it-IT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Componente: Dashboard Shopify
 */
export function ShopifyDashboard() {
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getShopInfo } = useShopify();

  useEffect(() => {
    getShopInfo()
      .then(data => setShopInfo(data))
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Caricamento info Shopify...</div>;

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <ShopifyAuthButton />
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
      borderRadius: '8px',
      border: '1px solid rgba(96, 165, 250, 0.2)'
    }}>
      <h2 style={{ marginBottom: '16px', color: '#60A5FA' }}>🔗 Shopify Dashboard</h2>
      {shopInfo && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ padding: '12px', background: 'rgba(13, 17, 26, 0.5)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '4px' }}>Negozio</p>
            <p style={{ color: '#60A5FA', fontWeight: 'bold' }}>{shopInfo.name}</p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(13, 17, 26, 0.5)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '4px' }}>Owner</p>
            <p style={{ color: '#60A5FA', fontWeight: 'bold' }}>{shopInfo.shop_owner}</p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(13, 17, 26, 0.5)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '4px' }}>Email</p>
            <p style={{ color: '#60A5FA', fontWeight: 'bold' }}>{shopInfo.email}</p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(13, 17, 26, 0.5)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '4px' }}>Valuta</p>
            <p style={{ color: '#60A5FA', fontWeight: 'bold' }}>{shopInfo.currency}</p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(13, 17, 26, 0.5)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '4px' }}>Dominio</p>
            <p style={{ color: '#60A5FA', fontWeight: 'bold', fontSize: '0.9rem' }}>{shopInfo.domain}</p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(13, 17, 26, 0.5)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '4px' }}>Piano</p>
            <p style={{ color: '#60A5FA', fontWeight: 'bold' }}>{shopInfo.plan_display_name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default {
  useShopify,
  ShopifyProductList,
  OrdersList,
  ShopifyDashboard
};
