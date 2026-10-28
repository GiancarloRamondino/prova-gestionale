import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SHOP_NAME = process.env.SHOPIFY_SHOP;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

// Store access token in memory (in production, use database)
let ACCESS_TOKEN = null;

/**
 * Get OAuth authorization URL
 */
export function getAuthorizationUrl(redirectUri) {
  const scope = 'read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_shops';
  const state = Math.random().toString(36).substring(7);
  
  const url = `https://${SHOP_NAME}.myshopify.com/admin/oauth/authorize?` +
    `client_id=${CLIENT_ID}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;
  
  return url;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code, redirectUri) {
  try {
    const response = await axios.post(
      `https://${SHOP_NAME}.myshopify.com/admin/oauth/access_token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri
      }
    );

    ACCESS_TOKEN = response.data.access_token;
    console.log('✅ Access token obtained via OAuth!');
    return response.data;
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error.message);
    throw error;
  }
}

/**
 * Get current access token
 */
export function getAccessToken() {
  return ACCESS_TOKEN;
}

/**
 * Set access token manually
 */
export function setAccessToken(token) {
  ACCESS_TOKEN = token;
}

export default {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getAccessToken,
  setAccessToken
};
