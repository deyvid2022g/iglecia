-- Script principal para ejecutar todas las migraciones
-- Archivo: run_migrations.sql
-- Ejecutar este archivo en Supabase SQL Editor para aplicar todas las migraciones

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Abrir Supabase Dashboard
-- 2. Ir a SQL Editor
-- 3. Copiar y pegar el contenido de cada archivo en orden
-- 4. Ejecutar uno por uno en el siguiente orden:
--    a) 000_initial_setup.sql
--    b) 001_events_tables.sql
--    c) 002_sermons_tables.sql
--    d) 003_blog_tables.sql
--    e) 004_ministries_tables.sql
--    f) 005_church_settings_tables.sql
-- =====================================================

-- Verificar que las extensiones estén habilitadas
SELECT 
  extname as "Extension",
  extversion as "Version"
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'unaccent', 'btree_gist');

-- Verificar que las funciones base estén creadas
SELECT 
  proname as "Function Name",
  prosrc as "Function Body"
FROM pg_proc 
WHERE proname IN (
  'update_updated_at_column',
  'generate_slug',
  'is_valid_email',
  'is_valid_colombian_phone',
  'strip_html_tags',
  'calculate_read_time',
  'generate_excerpt',
  'handle_new_user',
  'update_last_login'
);

-- Verificar que las tablas principales estén creadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'locations',
  'events',
  'event_registrations',
  'sermon_categories',
  'sermon_series',
  'sermons',
  'sermon_resources',
  'blog_categories',
  'blog_posts',
  'comments',
  'likes',
  'newsletter_subscriptions',
  'contact_messages',
  'ministries',
  'ministry_activities',
  'ministry_members',
  'age_groups',
  'age_group_members',
  'ministry_resources',
  'church_settings',
  'service_schedules',
  'office_hours',
  'special_dates',
  'church_facilities',
  'facility_bookings',
  'system_notifications',
  'notification_reads'
)
ORDER BY tablename;

-- Verificar que RLS esté habilitado en todas las tablas
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- Verificar políticas de seguridad
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as "Command",
  qual as "Using Expression",
  with_check as "With Check Expression"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar triggers
SELECT 
  event_object_schema as "Schema",
  event_object_table as "Table",
  trigger_name as "Trigger Name",
  event_manipulation as "Event",
  action_timing as "Timing"
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verificar índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Contar registros en tablas con datos de ejemplo
SELECT 
  'locations' as table_name,
  COUNT(*) as record_count
FROM locations
UNION ALL
SELECT 
  'sermon_categories' as table_name,
  COUNT(*) as record_count
FROM sermon_categories
UNION ALL
SELECT 
  'sermon_series' as table_name,
  COUNT(*) as record_count
FROM sermon_series
UNION ALL
SELECT 
  'blog_categories' as table_name,
  COUNT(*) as record_count
FROM blog_categories
UNION ALL
SELECT 
  'ministries' as table_name,
  COUNT(*) as record_count
FROM ministries
UNION ALL
SELECT 
  'age_groups' as table_name,
  COUNT(*) as record_count
FROM age_groups
UNION ALL
SELECT 
  'ministry_activities' as table_name,
  COUNT(*) as record_count
FROM ministry_activities
UNION ALL
SELECT 
  'church_settings' as table_name,
  COUNT(*) as record_count
FROM church_settings
UNION ALL
SELECT 
  'service_schedules' as table_name,
  COUNT(*) as record_count
FROM service_schedules
UNION ALL
SELECT 
  'office_hours' as table_name,
  COUNT(*) as record_count
FROM office_hours
UNION ALL
SELECT 
  'special_dates' as table_name,
  COUNT(*) as record_count
FROM special_dates
UNION ALL
SELECT 
  'church_facilities' as table_name,
  COUNT(*) as record_count
FROM church_facilities
ORDER BY table_name;

-- Mensaje de finalización
SELECT 'Verificación de migraciones completada. Revisa los resultados anteriores para confirmar que todo esté configurado correctamente.' as status;