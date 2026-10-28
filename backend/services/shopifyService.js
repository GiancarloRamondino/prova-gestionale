import shopify from '../shopify.js';

export class ShopifyService {
  // Product Service Methods
  async getAllProducts(limit = 250) {
    try {
      return await shopify.product.list({ limit });
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await shopify.product.get(id);
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      return await shopify.product.list({ 
        limit: 250,
        title: query
      });
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error;
    }
  }

  // Order Service Methods
  async getAllOrders(status = 'any', limit = 250) {
    try {
      return await shopify.order.list({ 
        limit,
        status
      });
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      return await shopify.order.get(id);
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  }

  async fulfillOrder(orderId, lineItems) {
    try {
      return await shopify.fulfillment.create(orderId, { line_items: lineItems });
    } catch (error) {
      console.error('Error in fulfillOrder:', error);
      throw error;
    }
  }

  // Customer Service Methods
  async getAllCustomers(limit = 250) {
    try {
      return await shopify.customer.list({ limit });
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      throw error;
    }
  }

  async getCustomerById(id) {
    try {
      return await shopify.customer.get(id);
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      throw error;
    }
  }

  async findCustomerByEmail(email) {
    try {
      const customers = await shopify.customer.list({ 
        limit: 250,
        email
      });
      return customers[0] || null;
    } catch (error) {
      console.error('Error in findCustomerByEmail:', error);
      throw error;
    }
  }

  // Inventory Service Methods
  async getInventoryLevels() {
    try {
      return await shopify.inventoryLevel.list();
    } catch (error) {
      console.error('Error in getInventoryLevels:', error);
      throw error;
    }
  }

  async updateInventoryLevel(inventoryItemId, locationId, quantity) {
    try {
      return await shopify.inventoryLevel.set({
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available: quantity
      });
    } catch (error) {
      console.error('Error in updateInventoryLevel:', error);
      throw error;
    }
  }

  // Shop Info
  async getShopInfo() {
    try {
      return await shopify.shop.get();
    } catch (error) {
      console.error('Error in getShopInfo:', error);
      throw error;
    }
  }

  // Analytics
  async getOrderMetrics(startDate, endDate) {
    try {
      const orders = await shopify.order.list({ 
        status: 'any',
        limit: 250
      });
      
      return orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
    } catch (error) {
      console.error('Error in getOrderMetrics:', error);
      throw error;
    }
  }
}

export default new ShopifyService();
