// Shopify API Authentication Middleware
export const verifyShopifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-SHA256');
  const body = req.rawBody;
  const secret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!hmac || !body || !secret) {
    return res.status(401).json({ error: 'Invalid webhook request' });
  }

  const crypto = await import('crypto');
  const computedHmac = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  if (computedHmac !== hmac) {
    return res.status(401).json({ error: 'Webhook signature verification failed' });
  }

  next();
};

// API Key validation middleware
export const validateApiKey = (req, res, next) => {
  const apiKey = req.get('X-API-Key');
  
  if (!apiKey || apiKey !== process.env.SHOPIFY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

export default {
  verifyShopifyWebhook,
  validateApiKey
};
