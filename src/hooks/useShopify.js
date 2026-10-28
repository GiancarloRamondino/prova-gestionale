import { useState, useEffect } from 'react';

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

  if (loading) return <div className="loading">Caricamento prodotti...</div>;
  if (error) return <div className="error">Errore: {error}</div>;

  return (
    <div className="products-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          {product.image && (
            <img src={product.image.src} alt={product.title} className="product-image" />
          )}
          <h3>{product.title}</h3>
          <p className="vendor">{product.vendor}</p>
          <p className="price">€{product.variants[0]?.price || 'N/D'}</p>
          <button className="add-to-cart">Aggiungi al carrello</button>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente: Modulo Creazione Ordine
 */
export function CreateOrderForm({ onOrderCreated }) {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    items: []
  });
  const [loading, setLoading] = useState(false);
  const { createOrder } = useShopify();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await createOrder({
        line_items: formData.items,
        customer: {
          first_name: formData.customerName.split(' ')[0],
          last_name: formData.customerName.split(' ')[1] || '',
          email: formData.email,
          phone: formData.phone
        },
        shipping_address: {
          address1: formData.address,
          phone: formData.phone
        }
      });

      alert('Ordine creato con successo!');
      onOrderCreated?.(order);
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        address: '',
        items: []
      });
    } catch (error) {
      alert('Errore nella creazione ordine: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-order-form">
      <h2>Crea Nuovo Ordine</h2>
      
      <div className="form-group">
        <label>Nome Cliente</label>
        <input
          type="text"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Telefono</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Indirizzo</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creazione in corso...' : 'Crea Ordine'}
      </button>
    </form>
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

  if (loading) return <div className="loading">Caricamento ordini...</div>;
  if (error) return <div className="error">Errore: {error}</div>;

  return (
    <div className="orders-list">
      <h2>Ordini Recenti</h2>
      <table>
        <thead>
          <tr>
            <th>ID Ordine</th>
            <th>Cliente</th>
            <th>Totale</th>
            <th>Stato</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.order_number}</td>
              <td>{order.customer?.first_name} {order.customer?.last_name}</td>
              <td>€{order.total_price}</td>
              <td>{order.fulfillment_status || 'pending'}</td>
              <td>{new Date(order.created_at).toLocaleDateString('it-IT')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Componente: Dashboard Shopify
 */
export function ShopifyDashboard() {
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getShopInfo } = useShopify();

  useEffect(() => {
    getShopInfo()
      .then(data => setShopInfo(data))
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="shopify-dashboard">
      <h2>Dashboard Shopify</h2>
      {shopInfo && (
        <div className="shop-info">
          <p><strong>Negozio:</strong> {shopInfo.name}</p>
          <p><strong>Owner:</strong> {shopInfo.shop_owner}</p>
          <p><strong>Email:</strong> {shopInfo.email}</p>
          <p><strong>Valuta:</strong> {shopInfo.currency}</p>
          <p><strong>Dominio:</strong> {shopInfo.domain}</p>
        </div>
      )}
    </div>
  );
}

export default {
  useShopify,
  ShopifyProductList,
  CreateOrderForm,
  OrdersList,
  ShopifyDashboard
};
