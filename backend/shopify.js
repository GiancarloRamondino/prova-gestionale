import { shopifyClient as _client } from './config/shopifyConfig.js';

// Use the client or return a mock if not configured
const shopifyClient = _client || {
  product: { list: () => Promise.resolve([]), get: () => Promise.reject(new Error('Shopify not configured')) },
  order: { list: () => Promise.resolve([]), get: () => Promise.reject(new Error('Shopify not configured')) },
  customer: { list: () => Promise.resolve([]), get: () => Promise.reject(new Error('Shopify not configured')) },
  shop: { get: () => Promise.reject(new Error('Shopify not configured')) }
};

export default shopifyClient;

