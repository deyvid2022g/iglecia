import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Variable global para almacenar el token de sesión personalizada
let sessionToken: string | null = null;

// Función para establecer el token de sesión
export const setSessionToken = (token: string | null) => {
  sessionToken = token;
};

// Función para obtener el token de sesión
export const getSessionToken = () => sessionToken;

// Configuración del cliente sin sobrescribir el header Authorization
// Esto evita enviar un header Authorization vacío o un token no válido que provoque CORS/preflight y abortos de petición
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Configuración adicional del cliente
export const supabaseConfig = {
  url: supabaseUrl,
  key: supabaseAnonKey
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
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// Church Settings Types
export interface ChurchSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: string
  category: string
  description: string | null
  is_public: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ServiceSchedule {
  id: string
  service_name: string
  service_type: string
  day_of_week: number
  start_time: string
  end_time: string
  location: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OfficeHours {
  id: string
  department: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpecialDate {
  id: string
  title: string
  description: string | null
  date: string
  date_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChurchFacility {
  id: string
  name: string
  description: string | null
  facility_type: string
  capacity: number | null
  floor_level: number | null
  is_public: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface FacilityBooking {
  id: string
  facility_id: string
  booked_by_user_id: string
  title: string
  description: string | null
  start_datetime: string
  end_datetime: string
  status: string
  created_at: string
  updated_at: string
}