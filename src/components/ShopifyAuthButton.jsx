import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export function ShopifyAuthButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status on mount
    checkAuthStatus();

    // Check URL params for auth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('auth') === 'error') {
      const message = params.get('message');
      alert(`Authorization failed: ${message}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/status');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Redirect to OAuth start endpoint
    window.location.href = 'http://localhost:3001/api/auth/start';
  };

  if (loading) {
    return <div className="text-gray-500">Checking authentication...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
        <CheckCircle size={20} className="text-green-600" />
        <div>
          <p className="font-semibold text-green-800">Connected to Shopify</p>
          <p className="text-sm text-green-700">OAuth authorized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <AlertCircle size={20} className="text-yellow-600" />
        <p className="text-sm text-yellow-800">
          Shopify connection requires authorization via OAuth
        </p>
      </div>
      <button
        onClick={handleLogin}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        <Lock size={18} />
        Connect to Shopify
      </button>
    </div>
  );
}

export default ShopifyAuthButton;
