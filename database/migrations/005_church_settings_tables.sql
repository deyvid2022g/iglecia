-- Migración para configuraciones de la iglesia y horarios de atención
-- Archivo: 005_church_settings_tables.sql

-- Crear tabla de configuraciones generales de la iglesia
CREATE TABLE IF NOT EXISTS church_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json', 'url', 'email', 'phone', 'color', 'image')),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'contact', 'social', 'appearance', 'services', 'notifications', 'integrations', 'security')),
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Si la configuración es visible públicamente
  is_editable BOOLEAN DEFAULT true, -- Si la configuración puede ser editada
  display_order INTEGER DEFAULT 0,
  validation_rules JSONB, -- Reglas de validación en formato JSON
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de horarios de servicios
CREATE TABLE IF NOT EXISTS service_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) DEFAULT 'regular' CHECK (service_type IN ('regular', 'special', 'holiday', 'conference', 'retreat')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Domingo, 6 = Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  description TEXT,
  target_audience VARCHAR(100), -- 'all', 'children', 'youth', 'adults', 'seniors', etc.
  language VARCHAR(10) DEFAULT 'es', -- Idioma del servicio
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT true,
  capacity INTEGER,
  requires_registration BOOLEAN DEFAULT false,
  online_streaming BOOLEAN DEFAULT false,
  streaming_url TEXT,
  special_date DATE, -- Para servicios especiales en fechas específicas
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de horarios de atención/oficina
CREATE TABLE IF NOT EXISTS office_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department VARCHAR(100) NOT NULL, -- 'pastoral', 'administrative', 'counseling', 'general'
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start_time TIME, -- Hora de inicio del descanso
  break_end_time TIME, -- Hora de fin del descanso
  location VARCHAR(255),
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  services_offered TEXT[], -- Servicios disponibles en este horario
  appointment_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de días festivos y fechas especiales
CREATE TABLE IF NOT EXISTS special_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  date_type VARCHAR(50) DEFAULT 'holiday' CHECK (date_type IN ('holiday', 'special_service', 'closure', 'event', 'conference', 'retreat')),
  description TEXT,
  affects_schedule BOOLEAN DEFAULT true, -- Si afecta los horarios normales
  office_closed BOOLEAN DEFAULT false,
  special_schedule JSONB, -- Horarios especiales en formato JSON
  year_recurring BOOLEAN DEFAULT true, -- Si se repite cada año
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ubicaciones/instalaciones de la iglesia
CREATE TABLE IF NOT EXISTS church_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(50) DEFAULT 'room' CHECK (facility_type IN ('room', 'hall', 'office', 'classroom', 'outdoor', 'parking', 'kitchen', 'bathroom', 'storage')),
  description TEXT,
  capacity INTEGER,
  location_details TEXT, -- Descripción de la ubicación dentro del edificio
  floor_level INTEGER DEFAULT 1,
  accessibility_features TEXT[], -- Características de accesibilidad
  available_equipment TEXT[], -- Equipos disponibles
  booking_required BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true, -- Si está disponible para uso público
  is_active BOOLEAN DEFAULT true,
  contact_person VARCHAR(255),
  usage_rules TEXT,
  images TEXT[], -- URLs de imágenes de la instalación
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de reservas de instalaciones
CREATE TABLE IF NOT EXISTS facility_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES church_facilities(id) ON DELETE CASCADE,
  booked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_title VARCHAR(255) NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  attendees_count INTEGER,
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  special_requirements TEXT,
  equipment_needed TEXT[],
  setup_requirements TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar solapamientos de reservas
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    facility_id WITH =,
    tstzrange(start_datetime, end_datetime) WITH &&
  ) WHERE (status IN ('approved', 'pending'))
);

-- Crear tabla de notificaciones del sistema
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'announcement')),
  target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'members', 'leaders', 'admins', 'specific_role', 'specific_ministry')),
  target_role VARCHAR(50), -- Si target_audience es 'specific_role'
  target_ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE, -- Si target_audience es 'specific_ministry'
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_dismissible BOOLEAN DEFAULT true,
  action_url TEXT, -- URL de acción opcional
  action_text VARCHAR(100), -- Texto del botón de acción
  icon VARCHAR(50),
  color VARCHAR(7), -- Color hexadecimal
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de lecturas de notificaciones
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES system_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraint para evitar lecturas duplicadas
  CONSTRAINT unique_notification_read UNIQUE (notification_id, user_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_church_settings_key ON church_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_church_settings_category ON church_settings(category);
CREATE INDEX IF NOT EXISTS idx_church_settings_public ON church_settings(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_church_settings_order ON church_settings(display_order);

CREATE INDEX IF NOT EXISTS idx_service_schedules_day ON service_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_service_schedules_type ON service_schedules(service_type);
CREATE INDEX IF NOT EXISTS idx_service_schedules_active ON service_schedules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_schedules_time ON service_schedules(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_service_schedules_special_date ON service_schedules(special_date) WHERE special_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_schedules_order ON service_schedules(display_order);

CREATE INDEX IF NOT EXISTS idx_office_hours_department ON office_hours(department);
CREATE INDEX IF NOT EXISTS idx_office_hours_day ON office_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_office_hours_active ON office_hours(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_office_hours_time ON office_hours(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_office_hours_order ON office_hours(display_order);

CREATE INDEX IF NOT EXISTS idx_special_dates_date ON special_dates(date);
CREATE INDEX IF NOT EXISTS idx_special_dates_type ON special_dates(date_type);
CREATE INDEX IF NOT EXISTS idx_special_dates_active ON special_dates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_special_dates_recurring ON special_dates(year_recurring) WHERE year_recurring = true;

CREATE INDEX IF NOT EXISTS idx_church_facilities_type ON church_facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_church_facilities_active ON church_facilities(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_church_facilities_public ON church_facilities(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_church_facilities_floor ON church_facilities(floor_level);
CREATE INDEX IF NOT EXISTS idx_church_facilities_order ON church_facilities(display_order);

CREATE INDEX IF NOT EXISTS idx_facility_bookings_facility ON facility_bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_user ON facility_bookings(booked_by);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_status ON facility_bookings(status);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_datetime ON facility_bookings(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_approved_by ON facility_bookings(approved_by);

CREATE INDEX IF NOT EXISTS idx_system_notifications_type ON system_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_system_notifications_audience ON system_notifications(target_audience);
CREATE INDEX IF NOT EXISTS idx_system_notifications_priority ON system_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_system_notifications_active ON system_notifications(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_system_notifications_dates ON system_notifications(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_system_notifications_ministry ON system_notifications(target_ministry_id) WHERE target_ministry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_reads_notification ON notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_read_at ON notification_reads(read_at DESC);

-- Crear triggers para updated_at
CREATE TRIGGER update_church_settings_updated_at
  BEFORE UPDATE ON church_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_schedules_updated_at
  BEFORE UPDATE ON service_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_office_hours_updated_at
  BEFORE UPDATE ON office_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_dates_updated_at
  BEFORE UPDATE ON special_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_facilities_updated_at
  BEFORE UPDATE ON church_facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_bookings_updated_at
  BEFORE UPDATE ON facility_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_notifications_updated_at
  BEFORE UPDATE ON system_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para church_settings
CREATE POLICY "Public church settings are viewable by everyone" ON church_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "All church settings are viewable by authenticated users" ON church_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Church settings can be managed by admins and pastors" ON church_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para service_schedules
CREATE POLICY "Active service schedules are viewable by everyone" ON service_schedules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service schedules can be managed by admins and pastors" ON service_schedules
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para office_hours
CREATE POLICY "Active office hours are viewable by everyone" ON office_hours
  FOR SELECT USING (is_active = true);

CREATE POLICY "Office hours can be managed by admins and pastors" ON office_hours
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para special_dates
CREATE POLICY "Active special dates are viewable by everyone" ON special_dates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Special dates can be managed by admins and pastors" ON special_dates
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para church_facilities
CREATE POLICY "Public church facilities are viewable by everyone" ON church_facilities
  FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "All church facilities are viewable by authenticated users" ON church_facilities
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Church facilities can be managed by admins and pastors" ON church_facilities
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para facility_bookings
CREATE POLICY "Users can view their own facility bookings" ON facility_bookings
  FOR SELECT USING (
    auth.uid() = booked_by OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can create facility bookings" ON facility_bookings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = booked_by
  );

CREATE POLICY "Users can update their own bookings, admins can update all" ON facility_bookings
  FOR UPDATE USING (
    auth.uid() = booked_by OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Users can cancel their own bookings, admins can manage all" ON facility_bookings
  FOR DELETE USING (
    auth.uid() = booked_by OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para system_notifications
CREATE POLICY "Active notifications are viewable based on target audience" ON system_notifications
  FOR SELECT USING (
    is_active = true AND
    (start_date IS NULL OR start_date <= NOW()) AND
    (end_date IS NULL OR end_date >= NOW()) AND
    (
      target_audience = 'all' OR
      (target_audience = 'members' AND auth.uid() IS NOT NULL) OR
      (target_audience = 'leaders' AND auth.uid() IN (
        SELECT id FROM profiles 
        WHERE role IN ('leader', 'pastor', 'admin') AND is_active = true
      )) OR
      (target_audience = 'admins' AND auth.uid() IN (
        SELECT id FROM profiles 
        WHERE role IN ('admin', 'pastor') AND is_active = true
      )) OR
      (target_audience = 'specific_role' AND auth.uid() IN (
        SELECT id FROM profiles 
        WHERE role = target_role AND is_active = true
      )) OR
      (target_audience = 'specific_ministry' AND auth.uid() IN (
        SELECT user_id FROM ministry_members 
        WHERE ministry_id = target_ministry_id AND is_active = true
      ))
    )
  );

CREATE POLICY "System notifications can be managed by admins and pastors" ON system_notifications
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para notification_reads
CREATE POLICY "Users can manage their own notification reads" ON notification_reads
  FOR ALL USING (auth.uid() = user_id);

-- Insertar configuraciones básicas de la iglesia
INSERT INTO church_settings (setting_key, setting_value, setting_type, category, description, is_public, display_order) VALUES
('church_name', 'Iglesia Cristiana Vida Nueva', 'text', 'general', 'Nombre oficial de la iglesia', true, 1),
('church_tagline', 'Una iglesia para toda la familia', 'text', 'general', 'Lema o eslogan de la iglesia', true, 2),
('church_vision', 'Ser una iglesia que transforma vidas y comunidades a través del amor de Cristo', 'text', 'general', 'Visión de la iglesia', true, 3),
('church_mission', 'Predicar el evangelio, discipular creyentes y servir a nuestra comunidad', 'text', 'general', 'Misión de la iglesia', true, 4),
('church_address', 'Calle 123 #45-67, Bogotá, Colombia', 'text', 'contact', 'Dirección física de la iglesia', true, 5),
('church_phone', '+57 1 234-5678', 'phone', 'contact', 'Teléfono principal', true, 6),
('church_whatsapp', '+57 300 123-4567', 'phone', 'contact', 'WhatsApp de contacto', true, 7),
('church_email', 'info@iglesiavidanueva.com', 'email', 'contact', 'Email principal', true, 8),
('church_website', 'https://www.iglesiavidanueva.com', 'url', 'contact', 'Sitio web oficial', true, 9),
('facebook_url', 'https://facebook.com/iglesiavidanueva', 'url', 'social', 'Página de Facebook', true, 10),
('instagram_url', 'https://instagram.com/iglesiavidanueva', 'url', 'social', 'Perfil de Instagram', true, 11),
('youtube_url', 'https://youtube.com/@iglesiavidanueva', 'url', 'social', 'Canal de YouTube', true, 12),
('primary_color', '#2563eb', 'color', 'appearance', 'Color primario del tema', false, 13),
('secondary_color', '#64748b', 'color', 'appearance', 'Color secundario del tema', false, 14),
('logo_url', '/images/logo.png', 'image', 'appearance', 'URL del logo de la iglesia', true, 15),
('enable_online_streaming', 'true', 'boolean', 'services', 'Habilitar transmisión en línea', true, 16),
('streaming_platform', 'YouTube', 'text', 'services', 'Plataforma de transmisión', true, 17),
('enable_event_registration', 'true', 'boolean', 'services', 'Habilitar registro de eventos', false, 18),
('max_event_capacity', '500', 'number', 'services', 'Capacidad máxima por defecto para eventos', false, 19),
('enable_notifications', 'true', 'boolean', 'notifications', 'Habilitar notificaciones del sistema', false, 20);

-- Insertar horarios de servicios
INSERT INTO service_schedules (service_name, service_type, day_of_week, start_time, end_time, location, description, target_audience, is_active, display_order) VALUES
('Servicio Dominical Matutino', 'regular', 0, '09:00:00', '11:00:00', 'Santuario Principal', 'Servicio principal de adoración dominical', 'all', true, 1),
('Servicio Dominical Vespertino', 'regular', 0, '18:00:00', '20:00:00', 'Santuario Principal', 'Servicio de adoración vespertino', 'all', true, 2),
('Escuela Dominical', 'regular', 0, '09:00:00', '10:00:00', 'Aulas Múltiples', 'Enseñanza bíblica por grupos de edad', 'all', true, 3),
('Reunión de Oración', 'regular', 2, '19:00:00', '20:30:00', 'Sala de Oración', 'Tiempo de oración e intercesión', 'all', true, 4),
('Estudio Bíblico', 'regular', 3, '19:00:00', '20:30:00', 'Santuario Principal', 'Estudio profundo de la Palabra', 'adults', true, 5),
('Reunión de Jóvenes', 'regular', 5, '19:00:00', '21:00:00', 'Salón de Jóvenes', 'Encuentro semanal de jóvenes', 'youth', true, 6),
('Servicio de Niños', 'regular', 0, '09:00:00', '11:00:00', 'Aulas de Niños', 'Servicio especial para niños', 'children', true, 7);

-- Insertar horarios de atención
INSERT INTO office_hours (department, day_of_week, start_time, end_time, break_start_time, break_end_time, location, contact_person, services_offered, appointment_required, is_active, display_order) VALUES
('pastoral', 1, '09:00:00', '17:00:00', '12:00:00', '13:00:00', 'Oficina Pastoral', 'Pastor Principal', ARRAY['Consejería', 'Oración', 'Visitas'], true, true, 1),
('pastoral', 2, '09:00:00', '17:00:00', '12:00:00', '13:00:00', 'Oficina Pastoral', 'Pastor Principal', ARRAY['Consejería', 'Oración', 'Visitas'], true, true, 2),
('pastoral', 3, '09:00:00', '17:00:00', '12:00:00', '13:00:00', 'Oficina Pastoral', 'Pastor Principal', ARRAY['Consejería', 'Oración', 'Visitas'], true, true, 3),
('pastoral', 4, '09:00:00', '17:00:00', '12:00:00', '13:00:00', 'Oficina Pastoral', 'Pastor Principal', ARRAY['Consejería', 'Oración', 'Visitas'], true, true, 4),
('pastoral', 5, '09:00:00', '15:00:00', '12:00:00', '13:00:00', 'Oficina Pastoral', 'Pastor Principal', ARRAY['Consejería', 'Oración'], true, true, 5),
('administrative', 1, '08:00:00', '16:00:00', '12:00:00', '13:00:00', 'Oficina Administrativa', 'Administrador', ARRAY['Información general', 'Certificados', 'Donaciones'], false, true, 6),
('administrative', 2, '08:00:00', '16:00:00', '12:00:00', '13:00:00', 'Oficina Administrativa', 'Administrador', ARRAY['Información general', 'Certificados', 'Donaciones'], false, true, 7),
('administrative', 3, '08:00:00', '16:00:00', '12:00:00', '13:00:00', 'Oficina Administrativa', 'Administrador', ARRAY['Información general', 'Certificados', 'Donaciones'], false, true, 8),
('administrative', 4, '08:00:00', '16:00:00', '12:00:00', '13:00:00', 'Oficina Administrativa', 'Administrador', ARRAY['Información general', 'Certificados', 'Donaciones'], false, true, 9),
('administrative', 5, '08:00:00', '16:00:00', '12:00:00', '13:00:00', 'Oficina Administrativa', 'Administrador', ARRAY['Información general', 'Certificados', 'Donaciones'], false, true, 10),
('counseling', 2, '14:00:00', '18:00:00', NULL, NULL, 'Sala de Consejería', 'Consejero Pastoral', ARRAY['Consejería matrimonial', 'Consejería familiar', 'Consejería personal'], true, true, 11),
('counseling', 4, '14:00:00', '18:00:00', NULL, NULL, 'Sala de Consejería', 'Consejero Pastoral', ARRAY['Consejería matrimonial', 'Consejería familiar', 'Consejería personal'], true, true, 12),
('counseling', 6, '09:00:00', '12:00:00', NULL, NULL, 'Sala de Consejería', 'Consejero Pastoral', ARRAY['Consejería matrimonial', 'Consejería familiar', 'Consejería personal'], true, true, 13);

-- Insertar fechas especiales
INSERT INTO special_dates (name, date, date_type, description, affects_schedule, office_closed, year_recurring, is_active) VALUES
('Año Nuevo', '2024-01-01', 'holiday', 'Celebración de Año Nuevo', true, true, true, true),
('Viernes Santo', '2024-03-29', 'holiday', 'Conmemoración de la crucifixión de Cristo', true, true, true, true),
('Domingo de Resurrección', '2024-03-31', 'special_service', 'Celebración de la resurrección de Cristo', true, false, true, true),
('Día del Trabajo', '2024-05-01', 'holiday', 'Día Internacional del Trabajo', true, true, true, true),
('Día de la Independencia', '2024-07-20', 'holiday', 'Independencia de Colombia', true, true, true, true),
('Batalla de Boyacá', '2024-08-07', 'holiday', 'Conmemoración de la Batalla de Boyacá', true, true, true, true),
('Asunción de la Virgen', '2024-08-15', 'holiday', 'Día de la Asunción', true, true, true, true),
('Día de la Raza', '2024-10-12', 'holiday', 'Día de la Raza', true, true, true, true),
('Todos los Santos', '2024-11-01', 'holiday', 'Día de Todos los Santos', true, true, true, true),
('Independencia de Cartagena', '2024-11-11', 'holiday', 'Independencia de Cartagena', true, true, true, true),
('Inmaculada Concepción', '2024-12-08', 'holiday', 'Día de la Inmaculada Concepción', true, true, true, true),
('Navidad', '2024-12-25', 'special_service', 'Celebración del nacimiento de Cristo', true, false, true, true),
('Fin de Año', '2024-12-31', 'special_service', 'Servicio de fin de año', true, false, true, true);

-- Insertar instalaciones de la iglesia
INSERT INTO church_facilities (name, facility_type, description, capacity, location_details, floor_level, accessibility_features, available_equipment, booking_required, is_public, is_active, display_order) VALUES
('Santuario Principal', 'hall', 'Salón principal de adoración', 500, 'Planta baja, entrada principal', 1, ARRAY['Rampa de acceso', 'Asientos para sillas de ruedas', 'Baños accesibles'], ARRAY['Sistema de sonido', 'Proyectores', 'Iluminación LED', 'Piano', 'Batería'], true, true, true, 1),
('Salón de Jóvenes', 'room', 'Espacio dedicado para reuniones juveniles', 80, 'Segundo piso, ala este', 2, ARRAY['Ascensor'], ARRAY['Sistema de sonido', 'Proyector', 'Sillas móviles', 'Aire acondicionado'], true, true, true, 2),
('Aulas de Niños', 'classroom', 'Conjunto de aulas para ministerio infantil', 120, 'Primer piso, ala oeste', 1, ARRAY['Puertas amplias', 'Baños adaptados'], ARRAY['Proyectores', 'Pizarras', 'Juguetes educativos', 'Aire acondicionado'], false, true, true, 3),
('Sala de Oración', 'room', 'Espacio tranquilo para oración e intercesión', 30, 'Segundo piso, ala oeste', 2, ARRAY['Acceso por escaleras'], ARRAY['Iluminación suave', 'Alfombras', 'Sillas cómodas'], false, true, true, 4),
('Oficina Pastoral', 'office', 'Oficina del pastor principal', 6, 'Primer piso, área administrativa', 1, ARRAY['Rampa de acceso'], ARRAY['Escritorio', 'Sillas', 'Computador', 'Teléfono'], true, false, true, 5),
('Oficina Administrativa', 'office', 'Oficina de administración', 4, 'Primer piso, área administrativa', 1, ARRAY['Rampa de acceso'], ARRAY['Escritorios', 'Computadores', 'Impresora', 'Teléfonos'], false, false, true, 6),
('Cocina', 'kitchen', 'Cocina para eventos y actividades', 15, 'Planta baja, área de servicios', 1, ARRAY['Puertas amplias'], ARRAY['Estufa industrial', 'Refrigerador', 'Microondas', 'Utensilios'], true, true, true, 7),
('Parqueadero', 'parking', 'Área de estacionamiento', 50, 'Exterior, entrada principal', 1, ARRAY['Espacios para discapacitados'], ARRAY['Iluminación nocturna', 'Seguridad'], false, true, true, 8),
('Salón de Matrimonios', 'room', 'Espacio para reuniones de parejas', 40, 'Segundo piso, ala central', 2, ARRAY['Ascensor'], ARRAY['Proyector', 'Sistema de sonido', 'Sillas cómodas', 'Aire acondicionado'], true, true, true, 9),
('Patio de Juegos', 'outdoor', 'Área exterior para actividades infantiles', 100, 'Exterior, área posterior', 1, ARRAY['Superficie nivelada'], ARRAY['Juegos infantiles', 'Bancas', 'Iluminación'], false, true, true, 10);

COMMIT;