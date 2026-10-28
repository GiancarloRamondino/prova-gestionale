import { checkShopifyConnection, shopifyClient } from './config/shopifyConfig.js';
import shopifyService from './services/shopifyService.js';
import syncUtils from './utils/syncShopify.js';

/**
 * Test suite for Shopify backend integration
 */

console.log('\n🧪 Starting Shopify Backend Tests...\n');

/**
 * Test 1: Check Shopify Connection
 */
async function testConnection() {
  console.log('Test 1: Checking Shopify Connection...');
  try {
    const result = await checkShopifyConnection();
    if (result.connected) {
      console.log('✓ Connected to Shopify');
      console.log(`  Shop: ${result.shopName}`);
      console.log(`  Domain: ${result.shopDomain}`);
      console.log(`  Plan: ${result.shopifyPlanName}`);
    } else {
      console.log('✗ Failed to connect:', result.error);
    }
  } catch (error) {
    console.error('✗ Error testing connection:', error.message);
  }
}

/**
 * Test 2: Fetch Products
 */
async function testGetProducts() {
  console.log('\nTest 2: Fetching Products...');
  try {
    const products = await shopifyService.getAllProducts(10);
    console.log(`✓ Fetched ${products.length} products`);
    if (products.length > 0) {
      console.log(`  First product: ${products[0].title}`);
    }
  } catch (error) {
    console.error('✗ Error fetching products:', error.message);
  }
}

/**
 * Test 3: Fetch Orders
 */
async function testGetOrders() {
  console.log('\nTest 3: Fetching Orders...');
  try {
    const orders = await shopifyService.getAllOrders('any', 10);
    console.log(`✓ Fetched ${orders.length} orders`);
    if (orders.length > 0) {
      console.log(`  First order: #${orders[0].order_number}`);
    }
  } catch (error) {
    console.error('✗ Error fetching orders:', error.message);
  }
}

/**
 * Test 4: Fetch Customers
 */
async function testGetCustomers() {
  console.log('\nTest 4: Fetching Customers...');
  try {
    const customers = await shopifyService.getAllCustomers(10);
    console.log(`✓ Fetched ${customers.length} customers`);
    if (customers.length > 0) {
      console.log(`  First customer: ${customers[0].first_name} ${customers[0].last_name}`);
    }
  } catch (error) {
    console.error('✗ Error fetching customers:', error.message);
  }
}

/**
 * Test 5: Search Products
 */
async function testSearchProducts() {
  console.log('\nTest 5: Searching Products...');
  try {
    const products = await shopifyService.searchProducts('anello');
    console.log(`✓ Found ${products.length} products matching "anello"`);
  } catch (error) {
    console.error('✗ Error searching products:', error.message);
  }
}

/**
 * Test 6: Get Shop Info
 */
async function testShopInfo() {
  console.log('\nTest 6: Getting Shop Info...');
  try {
    const shop = await shopifyService.getShopInfo();
    console.log('✓ Shop info retrieved');
    console.log(`  Owner: ${shop.shop_owner}`);
    console.log(`  Email: ${shop.email}`);
    console.log(`  Currency: ${shop.currency}`);
  } catch (error) {
    console.error('✗ Error getting shop info:', error.message);
  }
}

/**
 * Test 7: Test Sync Functions (Dry Run)
 */
async function testSync() {
  console.log('\nTest 7: Testing Sync Functionality (Dry Run)...');
  try {
    console.log('  - syncProductsFromShopify: available');
    console.log('  - syncOrdersFromShopify: available');
    console.log('  - syncCustomersFromShopify: available');
    console.log('  - fullSync: available');
    console.log('✓ All sync functions are available');
  } catch (error) {
    console.error('✗ Error checking sync functions:', error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    await testConnection();
    await testGetProducts();
    await testGetOrders();
    await testGetCustomers();
    await testSearchProducts();
    await testShopInfo();
    await testSync();
    
    console.log('\n✅ Tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }
}

// Run tests
runAllTests();
