import express from 'express';
import * as shopifyGraphQL from '../graphql/shopifyGraphQL.js';

const router = express.Router();

/**
 * Get shop information
 */
router.get('/shop', async (req, res) => {
  try {
    const shop = await shopifyGraphQL.getShopInfo();
    res.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch shop information'
    });
  }
});

/**
 * Get all products
 */
router.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const after = req.query.after || null;
    
    const products = await shopifyGraphQL.getProducts(limit, after);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch products'
    });
  }
});

/**
 * Search products
 */
router.get('/products/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const products = await shopifyGraphQL.searchProducts(query, 20);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to search products'
    });
  }
});

/**
 * Get product inventory
 */
router.get('/products/:id/inventory', async (req, res) => {
  try {
    const product = await shopifyGraphQL.getProductInventory(`gid://shopify/Product/${req.params.id}`);
    res.json(product);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch inventory'
    });
  }
});

/**
 * Get all orders
 */
router.get('/orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const after = req.query.after || null;

    const orders = await shopifyGraphQL.getOrders(limit, after);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * Get single order
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await shopifyGraphQL.getOrderById(`gid://shopify/Order/${req.params.id}`);
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch order'
    });
  }
});

/**
 * Get all customers
 */
router.get('/customers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const after = req.query.after || null;

    const customers = await shopifyGraphQL.getCustomers(limit, after);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch customers'
    });
  }
});

/**
 * Placeholder for create order (read-only with automation token)
 */
router.post('/orders', (req, res) => {
  res.status(403).json({
    error: 'Not supported',
    message: 'Order creation requires REST API with write scopes'
  });
});

export default router;
