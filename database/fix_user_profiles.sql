-- Script to fix user profiles for authentication issues

-- 1. Ensure profile for camplaygo005@gmail.com
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'camplaygo005@gmail.com') THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      phone,
      is_active,
      join_date,
      created_at,
      updated_at
    ) 
    SELECT 
      id,
      email,
      'Cam Playgo',
      'admin',
      '+573001234567',
      true,
      NOW(),
      NOW(),
      NOW()
    FROM auth.users 
    WHERE email = 'camplaygo005@gmail.com'
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = 'Cam Playgo',
      role = 'admin',
      is_active = true,
      updated_at = NOW();
    RAISE NOTICE 'Profile for camplaygo005@gmail.com fixed';
  ELSE
    RAISE NOTICE 'User camplaygo005@gmail.com not found';
  END IF;
END
$$;

-- 2. Ensure profile for admin@iglesia.com
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@iglesia.com') THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      phone,
      is_active,
      join_date,
      created_at,
      updated_at
    ) 
    SELECT 
      id,
      email,
      'Admin Iglesia',
      'admin',
      '+573001234567',
      true,
      NOW(),
      NOW(),
      NOW()
    FROM auth.users 
    WHERE email = 'admin@iglesia.com'
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = 'Admin Iglesia',
      role = 'admin',
      is_active = true,
      updated_at = NOW();
    RAISE NOTICE 'Profile for admin@iglesia.com fixed';
  ELSE
    RAISE NOTICE 'User admin@iglesia.com not found';
  END IF;
END
$$;

-- 3. Verification
SELECT 'Profiles fixed' as status, COUNT(*) as total FROM public.profiles WHERE email IN ('camplaygo005@gmail.com', 'admin@iglesia.com');