import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Configuración mejorada del cliente con opciones explícitas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Configurar interceptor para asegurar que todas las solicitudes incluyan la API key
supabase.functions.setAuth(supabaseAnonKey)

// Configurar el cliente para que incluya la API key en todas las solicitudes
const originalFetch = globalThis.fetch
const customFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {})
  
  // Asegurar que la API key esté presente en todas las solicitudes
  if (!headers.has('apikey')) {
    headers.set('apikey', supabaseAnonKey)
  }
  
  // Asegurar que la autorización esté presente
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${supabaseAnonKey}`)
  }
  
  // Asegurar que el Content-Type esté presente
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  
  // Añadir el header Accept para evitar errores 406
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  
  // Añadir el header Prefer para recibir los datos insertados
  if (!headers.has('Prefer')) {
    headers.set('Prefer', 'return=representation')
  }
  
  const modifiedOptions = {
    ...options,
    headers
  }
  
  return originalFetch(url, modifiedOptions)
}

// Reemplazar el fetch global para las solicitudes de Supabase
if (typeof window !== 'undefined') {
  const originalWindowFetch = window.fetch
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input instanceof Request ? input.url : String(input))
    
    // Solo interceptar solicitudes a Supabase
    if (url.includes(supabaseUrl)) {
      return customFetch(input, init)
    }
    
    // Para otras solicitudes, usar el fetch original
    return originalWindowFetch.apply(this, [input, init])
  }
}

// Types for our database
export interface Profile {
  id: number
  user_id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface LocalUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}