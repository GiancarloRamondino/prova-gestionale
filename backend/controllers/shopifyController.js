import shopify from '../shopify.js';

// Products
export const getProducts = async (req, res) => {
  try {
    if (!shopify) {
      return res.status(503).json({ 
        error: 'Shopify not configured',
        message: 'Please configure SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP in .env'
      });
    }
    const products = await shopify.product.list({ limit: 250 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Check your Shopify credentials and token'
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await shopify.product.get(req.params.id);
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await shopify.product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await shopify.product.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await shopify.product.delete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
};

// Orders
export const getOrders = async (req, res) => {
  try {
    if (!shopify) {
      return res.status(503).json({ 
        error: 'Shopify not configured',
        message: 'Please configure SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP in .env'
      });
    }
    const orders = await shopify.order.list({ limit: 250, status: 'any' });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Check your Shopify credentials and token'
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await shopify.order.get(req.params.id);
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const order = await shopify.order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await shopify.order.update(req.params.id, req.body);
    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: err.message });
  }
};

// Customers
export const getCustomers = async (req, res) => {
  try {
    if (!shopify) {
      return res.status(503).json({ 
        error: 'Shopify not configured',
        message: 'Please configure SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP in .env'
      });
    }
    const customers = await shopify.customer.list({ limit: 250 });
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Check your Shopify credentials and token'
    });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await shopify.customer.get(req.params.id);
    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = await shopify.customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await shopify.customer.update(req.params.id, req.body);
    res.json(customer);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: err.message });
  }
};

// Inventory
export const getInventory = async (req, res) => {
  try {
    const inventoryLevels = await shopify.inventoryLevel.list();
    res.json(inventoryLevels);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { inventoryItemId, locationId, quantity } = req.body;
    const result = await shopify.inventoryLevel.set({
      inventory_item_id: inventoryItemId,
      location_id: locationId,
      available: quantity
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: err.message });
  }
};

// Collections
export const getCollections = async (req, res) => {
  try {
    const collections = await shopify.customCollection.list({ limit: 250 });
    res.json(collections);
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: err.message });
  }
};

// Shop Info
export const getShopInfo = async (req, res) => {
  try {
    if (!shopify) {
      return res.status(503).json({ 
        error: 'Shopify not configured',
        message: 'Please configure SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP in .env'
      });
    }
    const shop = await shopify.shop.get();
    res.json(shop);
  } catch (err) {
    console.error('Error fetching shop info:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Verify your Shopify token and shop name'
    });
  }
};

// Webhooks
export const handleProductCreated = async (req, res) => {
  try {
    console.log('Product created webhook:', req.body);
    // Handle product creation - sync to database or perform actions
    res.json({ success: true });
  } catch (err) {
    console.error('Error handling product created webhook:', err);
    res.status(500).json({ error: err.message });
  }
};

export const handleOrderCreated = async (req, res) => {
  try {
    console.log('Order created webhook:', req.body);
    // Handle order creation - update database, send notifications, etc.
    res.json({ success: true });
  } catch (err) {
    console.error('Error handling order created webhook:', err);
    res.status(500).json({ error: err.message });
  }
};

export const handleOrderUpdated = async (req, res) => {
  try {
    console.log('Order updated webhook:', req.body);
    // Handle order update - sync changes to database
    res.json({ success: true });
  } catch (err) {
    console.error('Error handling order updated webhook:', err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getInventory,
  updateInventory,
  getCollections,
  getShopInfo,
  handleProductCreated,
  handleOrderCreated,
  handleOrderUpdated
};
