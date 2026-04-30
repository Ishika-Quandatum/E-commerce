import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PlatformProvider } from './context/PlatformContext';

import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <PlatformProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <App />
        </PlatformProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);