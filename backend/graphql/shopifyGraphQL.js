import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAccessToken } from '../auth/shopifyOAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SHOP_NAME = process.env.SHOPIFY_SHOP;

if (!SHOP_NAME) {
  console.warn('⚠️ SHOPIFY_SHOP not configured');
}

const SHOPIFY_API_URL = `https://${SHOP_NAME}.myshopify.com/admin/api/2024-01/graphql.json`;

/**
 * Execute a GraphQL query against Shopify Admin API
 */
export async function executeGraphQL(query, variables = {}) {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('Shopify access token not available. Please authorize first.');
    }

    if (!SHOP_NAME) {
      throw new Error('Shopify shop name not configured');
    }

    const response = await axios.post(SHOPIFY_API_URL, 
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token
        }
      }
    );

    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('GraphQL Error:', error.message);
    throw error;
  }
}

/**
 * Get shop info
 */
export async function getShopInfo() {
  const query = `
    query {
      shop {
        name
        email
        ownerEmail
        primaryDomain {
          url
        }
        plan {
          displayName
        }
        currencyCode
      }
    }
  `;
  
  const result = await executeGraphQL(query);
  return result.shop;
}

/**
 * Get all products
 */
export async function getProducts(limit = 50, after = null) {
  const query = `
    query GetProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            description
            handle
            vendor
            productType
            status
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  availableForSale
                  inventoryQuantity
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `;

  const variables = {
    first: limit,
    after: after
  };

  const result = await executeGraphQL(query, variables);
  return result.products;
}

/**
 * Get all orders
 */
export async function getOrders(limit = 50, after = null) {
  const query = `
    query GetOrders($first: Int!, $after: String) {
      orders(first: $first, after: $after) {
        edges {
          node {
            id
            name
            orderNumber
            createdAt
            updatedAt
            email
            phone
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customer {
              id
              email
              firstName
              lastName
              phone
            }
            lineItems(first: 10) {
              edges {
                node {
                  id
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `;

  const variables = {
    first: limit,
    after: after
  };

  const result = await executeGraphQL(query, variables);
  return result.orders;
}

/**
 * Get all customers
 */
export async function getCustomers(limit = 50, after = null) {
  const query = `
    query GetCustomers($first: Int!, $after: String) {
      customers(first: $first, after: $after) {
        edges {
          node {
            id
            email
            firstName
            lastName
            phone
            createdAt
            updatedAt
            numberOfOrders
            totalSpent
            defaultAddress {
              address1
              city
              provinceCode
              country
              zip
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `;

  const variables = {
    first: limit,
    after: after
  };

  const result = await executeGraphQL(query, variables);
  return result.customers;
}

/**
 * Search products by query
 */
export async function searchProducts(query, limit = 10) {
  const graphqlQuery = `
    query SearchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
              }
            }
            featuredImage {
              url
            }
          }
        }
      }
    }
  `;

  const variables = {
    query: query,
    first: limit
  };

  const result = await executeGraphQL(graphqlQuery, variables);
  return result.products.edges.map(e => e.node);
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId) {
  const query = `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        name
        orderNumber
        email
        phone
        totalPriceSet {
          shopMoney {
            amount
          }
        }
        displayFinancialStatus
        displayFulfillmentStatus
        customer {
          id
          email
          firstName
          lastName
        }
        lineItems(first: 50) {
          edges {
            node {
              id
              title
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = { id: orderId };
  const result = await executeGraphQL(query, variables);
  return result.order;
}

/**
 * Get inventory levels for a product
 */
export async function getProductInventory(productId) {
  const query = `
    query GetInventory($id: ID!) {
      product(id: $id) {
        id
        title
        variants(first: 50) {
          edges {
            node {
              id
              sku
              title
              inventoryQuantity
              availableForSale
            }
          }
        }
      }
    }
  `;

  const variables = { id: productId };
  const result = await executeGraphQL(query, variables);
  return result.product;
}

export default {
  executeGraphQL,
  getShopInfo,
  getProducts,
  getOrders,
  getCustomers,
  searchProducts,
  getOrderById,
  getProductInventory
};
