import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function quickDiagnosis() {
  console.log('🔍 Diagnóstico rápido de la base de datos...');
  
  try {
    // 1. Verificar conexión
    console.log('\n1. Verificando conexión...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Error de conexión:', testError.message);
      if (testError.message.includes('relation "public.users" does not exist')) {
        console.log('\n🚨 PROBLEMA: La tabla users no existe');
        console.log('\n📋 SQL para crear la tabla:');
        console.log(`
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'leader', 'member')),
  phone TEXT,
  address TEXT,
  birth_date DATE,
  membership_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Función trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`);
        return;
      }
    } else {
      console.log('✅ Conexión exitosa');
    }
    
    // 2. Verificar políticas RLS
    console.log('\n2. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'users' })
      .select();
    
    if (policiesError) {
      console.log('⚠️  No se pudieron verificar las políticas RLS');
    }
    
    // 3. Verificar trigger
    console.log('\n3. Verificando función trigger...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('check_function_exists', { function_name: 'handle_new_user' })
      .select();
    
    if (functionsError) {
      console.log('⚠️  No se pudo verificar la función trigger');
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

quickDiagnosis().catch(console.error);