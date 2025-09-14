import { vi } from 'vitest';

// Mock de variables de entorno
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://toopbtydsiepeoisuecg.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3BidHlkc2llcGVvaXN1ZWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzY0MDQsImV4cCI6MjA3MjA1MjQwNH0.ckYKpJDfqhbQ4mnZNDBBdR3Qd63VaS1jOhSIW3_SE8g'
      }
    }
  }
});

// Mock global de fetch para simular respuestas de red
global.fetch = vi.fn();

// Configuración adicional para pruebas
beforeEach(() => {
  vi.clearAllMocks();
});