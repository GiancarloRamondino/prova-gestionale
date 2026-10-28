import axios from 'axios';

const token = process.env.SHOPIFY_ACCESS_TOKEN || 'shpat_replace_with_your_token';
const shop = process.env.SHOPIFY_SHOP || 'your-store-name';
const url = `https://${shop}.myshopify.com/admin/api/2024-01/graphql.json`;

try {
  const response = await axios.post(url, {query: '{ shop { name } }'}, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    }
  });
  
  console.log(JSON.stringify(response.data, null, 2));
} catch (error) {
  console.error('Error:', error.response?.data || error.message);
}
