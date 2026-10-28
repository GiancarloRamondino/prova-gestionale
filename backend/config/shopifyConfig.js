import shopifyApp from 'shopify-api-node';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Initialize Shopify API client with advanced configuration
 */
export class ShopifyConfig {
  constructor() {
    this.shopName = process.env.SHOPIFY_SHOP;
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.clientId = process.env.SHOPIFY_CLIENT_ID;
    this.clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    
    this.validateConfig();
  }

  validateConfig() {
    if (!this.shopName) {
      console.warn('⚠️  SHOPIFY_SHOP is not configured in .env file');
    }
    if (!this.accessToken) {
      console.warn('⚠️  SHOPIFY_ACCESS_TOKEN is not configured. Shopify API endpoints may not work.');
    }
  }

  getClient() {
    if (!this.shopName || !this.accessToken) {
      console.warn('⚠️  Shopify credentials not fully configured. Shopify client not available.');
      return null;
    }
    return new shopifyApp({
      shopName: this.shopName,
      accessToken: this.accessToken
    });
  }

  /**
   * Get API credentials info (safe for logging)
   */
  getInfo() {
    return {
      shop: this.shopName,
      hasAccessToken: !!this.accessToken,
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret
    };
  }
}

/**
 * Create a singleton instance
 */
const config = new ShopifyConfig();
let shopifyClient = null;

try {
  shopifyClient = config.getClient();
} catch (error) {
  console.warn('⚠️  Could not initialize Shopify client:', error.message);
}

export { shopifyClient };

/**
 * Helper to check API connectivity
 */
export async function checkShopifyConnection() {
  try {
    if (!shopifyClient) {
      return {
        connected: false,
        error: 'Shopify client not initialized - check your .env configuration'
      };
    }
    const shop = await shopifyClient.shop.get();
    return {
      connected: true,
      shopName: shop.name,
      shopDomain: shop.domain,
      shopifyPlanName: shop.plan_display_name
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Format price with currency
 */
export function formatPrice(price, currency = 'EUR') {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Handle API errors consistently
 */
export function handleShopifyError(error) {
  if (error.statusCode === 401) {
    return { status: 401, message: 'Unauthorized - Check your access token' };
  }
  if (error.statusCode === 404) {
    return { status: 404, message: 'Resource not found' };
  }
  if (error.statusCode === 429) {
    return { status: 429, message: 'Rate limited - Too many requests' };
  }
  return { 
    status: error.statusCode || 500, 
    message: error.message || 'Unknown error' 
  };
}

/**
 * Retry logic for failed API calls
 */
export async function retryApiCall(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export default config;
