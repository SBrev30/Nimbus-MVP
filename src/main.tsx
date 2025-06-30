import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './routes/App.tsx';  // ✅ Updated path
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
