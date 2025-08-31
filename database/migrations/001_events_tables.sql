-- Migración para tablas de eventos
-- Archivo: 001_events_tables.sql

-- Crear tabla de ubicaciones
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
  coordinates JSONB, -- {"lat": number, "lng": number}
  capacity INTEGER,
  facilities TEXT[], -- Array de facilidades disponibles
  contact_info JSONB, -- {"phone": string, "email": string, "website": string}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- Descripción detallada en markdown
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  requires_rsvp BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  event_type VARCHAR(50) DEFAULT 'service' CHECK (event_type IN ('service', 'conference', 'workshop', 'social', 'outreach', 'other')),
  target_audience VARCHAR(100), -- 'all', 'youth', 'adults', 'children', etc.
  contact_info JSONB, -- {"phone": string, "email": string, "whatsapp": string}
  image_url TEXT,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de inscripciones a eventos
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Campos para usuarios no registrados
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  -- Información adicional
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  notes TEXT,
  additional_info JSONB, -- Información adicional específica del evento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar registros duplicados
  CONSTRAINT unique_user_event UNIQUE (event_id, user_id),
  CONSTRAINT unique_guest_event UNIQUE (event_id, guest_email)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location_id);
CREATE INDEX IF NOT EXISTS idx_events_host ON events(host_id);

CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_date ON event_registrations(registration_date);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para updated_at
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear función para actualizar contador de inscripciones
CREATE OR REPLACE FUNCTION update_event_registrations_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET current_registrations = (
      SELECT COUNT(*) 
      FROM event_registrations 
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE events 
    SET current_registrations = (
      SELECT COUNT(*) 
      FROM event_registrations 
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET current_registrations = (
      SELECT COUNT(*) 
      FROM event_registrations 
      WHERE event_id = OLD.event_id AND status = 'confirmed'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar contador automáticamente
CREATE TRIGGER update_event_registrations_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registrations_count();

-- Habilitar Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para locations
CREATE POLICY "Locations are viewable by everyone" ON locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Locations can be managed by admins and pastors" ON locations
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para events
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Events can be created by authenticated users" ON events
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Events can be updated by creators, admins and pastors" ON events
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Events can be deleted by admins and pastors" ON events
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para event_registrations
CREATE POLICY "Users can view their own registrations" ON event_registrations
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own registrations" ON event_registrations
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Users can cancel their own registrations" ON event_registrations
  FOR DELETE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Insertar datos de ejemplo para ubicaciones
INSERT INTO locations (name, address, city, state, country, capacity, facilities, contact_info, is_active) VALUES
('Templo Principal', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', 'Colombia', 500, 
 ARRAY['Sonido', 'Proyección', 'Aire acondicionado', 'Estacionamiento'], 
 '{"phone": "+57 1 234-5678", "email": "templo@iglesia.com"}', true),
('Salón de Usos Múltiples', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', 'Colombia', 150, 
 ARRAY['Sonido básico', 'Cocina', 'Mesas y sillas'], 
 '{"phone": "+57 1 234-5678", "email": "eventos@iglesia.com"}', true),
('Aula de Niños', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', 'Colombia', 50, 
 ARRAY['Juegos didácticos', 'Proyector', 'Baño adaptado'], 
 '{"phone": "+57 1 234-5678"}', true),
('Sede Norte', 'Carrera 45 #123-89', 'Bogotá', 'Cundinamarca', 'Colombia', 200, 
 ARRAY['Sonido', 'Proyección', 'Estacionamiento'], 
 '{"phone": "+57 1 987-6543", "email": "norte@iglesia.com"}', true);

COMMIT;