import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import shopifyService from '../services/shopifyService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'database.json');

// Utility to read local database
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { customers: [], products: [], orders: [], callHistory: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { customers: [], products: [], orders: [], callHistory: [] };
  }
}

// Utility to write local database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

/**
 * Sync products from Shopify to local database
 */
export async function syncProductsFromShopify() {
  try {
    console.log('Syncing products from Shopify...');
    const shopifyProducts = await shopifyService.getAllProducts();
    const db = readDB();
    
    db.products = shopifyProducts.map(product => ({
      id: product.id,
      shopifyId: product.id,
      name: product.title,
      description: product.body_html,
      price: product.variants[0]?.price || 0,
      sku: product.variants[0]?.sku || '',
      inventory: product.variants[0]?.inventory_quantity || 0,
      image: product.image?.src || null,
      syncedAt: new Date().toISOString()
    }));
    
    writeDB(db);
    console.log(`✓ Synced ${db.products.length} products from Shopify`);
    return db.products;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
}

/**
 * Sync orders from Shopify to local database
 */
export async function syncOrdersFromShopify() {
  try {
    console.log('Syncing orders from Shopify...');
    const shopifyOrders = await shopifyService.getAllOrders('any');
    const db = readDB();
    
    db.orders = shopifyOrders.map(order => ({
      id: order.id,
      shopifyId: order.id,
      orderId: order.order_number,
      customerName: order.customer?.first_name + ' ' + order.customer?.last_name || 'N/D',
      phone: order.customer?.phone || order.billing_address?.phone || '',
      email: order.customer?.email || order.email || '',
      shippingAddress: order.shipping_address?.address1 || 'N/D',
      items: order.line_items.map(item => ({
        name: item.title,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku
      })),
      subtotal: order.subtotal_price || 0,
      shippingCost: order.shipping_lines?.[0]?.price || 0,
      total: order.total_price || 0,
      paymentMethod: order.payment_details?.credit_card?.brand || 'N/D',
      status: order.fulfillment_status || 'pending',
      notes: order.note || '',
      date: order.created_at,
      syncedAt: new Date().toISOString()
    }));
    
    writeDB(db);
    console.log(`✓ Synced ${db.orders.length} orders from Shopify`);
    return db.orders;
  } catch (error) {
    console.error('Error syncing orders:', error);
    throw error;
  }
}

/**
 * Sync customers from Shopify to local database
 */
export async function syncCustomersFromShopify() {
  try {
    console.log('Syncing customers from Shopify...');
    const shopifyCustomers = await shopifyService.getAllCustomers();
    const db = readDB();
    
    db.customers = shopifyCustomers.map(customer => ({
      id: customer.id,
      shopifyId: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone || '',
      country: customer.default_address?.country || 'N/D',
      city: customer.default_address?.city || 'N/D',
      address: customer.default_address?.address1 || 'N/D',
      totalOrders: customer.orders_count || 0,
      totalSpent: customer.total_spent || 0,
      syncedAt: new Date().toISOString()
    }));
    
    writeDB(db);
    console.log(`✓ Synced ${db.customers.length} customers from Shopify`);
    return db.customers;
  } catch (error) {
    console.error('Error syncing customers:', error);
    throw error;
  }
}

/**
 * Push local orders to Shopify
 */
export async function pushOrdersToShopify() {
  try {
    console.log('Pushing orders to Shopify...');
    const db = readDB();
    let pushedCount = 0;
    
    for (const order of db.orders) {
      if (!order.shopifyId) {
        try {
          const shopifyOrder = await shopifyService.createOrder({
            line_items: order.items.map(item => ({
              title: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            customer: {
              first_name: order.customerName.split(' ')[0],
              last_name: order.customerName.split(' ').slice(1).join(' '),
              email: order.email,
              phone: order.phone
            },
            shipping_address: {
              address1: order.shippingAddress,
              phone: order.phone
            },
            note: order.notes
          });
          
          order.shopifyId = shopifyOrder.id;
          pushedCount++;
        } catch (error) {
          console.error(`Error pushing order ${order.id}:`, error);
        }
      }
    }
    
    writeDB(db);
    console.log(`✓ Pushed ${pushedCount} orders to Shopify`);
    return pushedCount;
  } catch (error) {
    console.error('Error pushing orders:', error);
    throw error;
  }
}

/**
 * Full sync both ways
 */
export async function fullSync() {
  try {
    console.log('Starting full sync...');
    await syncProductsFromShopify();
    await syncCustomersFromShopify();
    await syncOrdersFromShopify();
    console.log('✓ Full sync completed successfully');
  } catch (error) {
    console.error('Error during full sync:', error);
    throw error;
  }
}

export default {
  syncProductsFromShopify,
  syncOrdersFromShopify,
  syncCustomersFromShopify,
  pushOrdersToShopify,
  fullSync
};
