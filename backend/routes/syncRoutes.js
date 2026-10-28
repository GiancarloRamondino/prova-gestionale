import express from 'express';
import syncUtils from '../utils/syncShopify.js';

const router = express.Router();

/**
 * Sync endpoint - Trigger manual sync between Shopify and local database
 */
router.post('/sync', async (req, res) => {
  try {
    const { type } = req.body;
    let result;

    switch (type) {
      case 'products':
        result = await syncUtils.syncProductsFromShopify();
        res.json({ 
          success: true, 
          message: `Synced ${result.length} products`,
          data: result 
        });
        break;
      
      case 'orders':
        result = await syncUtils.syncOrdersFromShopify();
        res.json({ 
          success: true, 
          message: `Synced ${result.length} orders`,
          data: result 
        });
        break;
      
      case 'customers':
        result = await syncUtils.syncCustomersFromShopify();
        res.json({ 
          success: true, 
          message: `Synced ${result.length} customers`,
          data: result 
        });
        break;
      
      case 'all':
        await syncUtils.fullSync();
        res.json({ 
          success: true, 
          message: 'Full sync completed' 
        });
        break;
      
      default:
        res.status(400).json({ 
          error: 'Invalid sync type. Use: products, orders, customers, or all' 
        });
    }
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook for product updates
 * Called when product is updated in Shopify
 */
router.post('/webhooks/product-updated', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const product = JSON.parse(req.body);
    console.log('Product updated webhook received:', product.id);
    
    // Trigger sync to update local database
    await syncUtils.syncProductsFromShopify();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook for order creation
 * Called when order is created in Shopify
 */
router.post('/webhooks/order-created-sync', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const order = JSON.parse(req.body);
    console.log('Order created webhook received:', order.id);
    
    // Sync new order to local database
    await syncUtils.syncOrdersFromShopify();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook for customer creation
 * Called when customer is created in Shopify
 */
router.post('/webhooks/customer-created-sync', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const customer = JSON.parse(req.body);
    console.log('Customer created webhook received:', customer.id);
    
    // Sync new customer to local database
    await syncUtils.syncCustomersFromShopify();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
