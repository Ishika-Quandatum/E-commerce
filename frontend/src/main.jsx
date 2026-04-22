import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PlatformProvider } from './context/PlatformContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <PlatformProvider>
          <App />
        </PlatformProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);