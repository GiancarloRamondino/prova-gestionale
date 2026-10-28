import express from 'express';
import * as shopifyOAuth from '../auth/shopifyOAuth.js';

const router = express.Router();

/**
 * Start OAuth flow
 * Redirects to Shopify authorization page
 */
router.get('/start', (req, res) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/callback`;
    const authUrl = shopifyOAuth.getAuthorizationUrl(redirectUri);
    
    console.log('📱 Redirecting to Shopify authorization...');
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error starting OAuth:', error);
    res.status(500).json({
      error: 'Failed to start OAuth flow',
      message: error.message
    });
  }
});

/**
 * OAuth callback
 * Shopify redirects here with authorization code
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, hmac, timestamp } = req.query;
    
    console.log('🔄 OAuth Callback received!');
    console.log('Query params:', { code, state, hmac, timestamp });
    console.log('Host:', req.get('host'));
    console.log('Protocol:', req.protocol);

    if (!code) {
      console.error('❌ Missing authorization code');
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/callback`;
    console.log('Using redirect_uri:', redirectUri);
    
    // Exchange code for access token
    const tokenData = await shopifyOAuth.exchangeCodeForToken(code, redirectUri);
    
    console.log('✅ Token obtained successfully!');
    console.log('Token data:', tokenData);

    // Redirect to frontend with success message
    const redirectUrl = `http://localhost:3000/?auth=success&shop=${tokenData.associated_user?.account_owner || 'licata-gioielli'}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error in OAuth callback:', error.message);
    console.error('Full error:', error);
    res.redirect(`http://localhost:3000/?auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Check auth status
 */
router.get('/status', (req, res) => {
  const token = shopifyOAuth.getAccessToken();
  
  res.json({
    authenticated: !!token,
    hasToken: !!token
  });
});

export default router;
