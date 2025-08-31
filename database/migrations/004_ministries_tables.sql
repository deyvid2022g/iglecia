-- Migración para tablas de ministerios y grupos de edad
-- Archivo: 004_ministries_tables.sql

-- Crear tabla de ministerios
CREATE TABLE IF NOT EXISTS ministries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  mission TEXT,
  vision TEXT,
  icon VARCHAR(50), -- Nombre del ícono
  color VARCHAR(7), -- Código hexadecimal para color
  image_url TEXT,
  leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_age_group VARCHAR(50), -- 'children', 'youth', 'adults', 'seniors', 'all'
  meeting_schedule TEXT, -- Descripción del horario de reuniones
  meeting_location VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_whatsapp VARCHAR(20),
  requirements TEXT[], -- Requisitos para unirse
  benefits TEXT[], -- Beneficios de participar
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de actividades ministeriales
CREATE TABLE IF NOT EXISTS ministry_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  activity_type VARCHAR(50) DEFAULT 'regular' CHECK (activity_type IN ('regular', 'special', 'training', 'outreach', 'service')),
  schedule TEXT, -- Horario específico de la actividad
  location VARCHAR(255),
  duration INTEGER, -- Duración en minutos
  capacity INTEGER,
  current_participants INTEGER DEFAULT 0,
  requirements TEXT[],
  materials_needed TEXT[],
  icon VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT true,
  recurrence_pattern VARCHAR(50), -- 'weekly', 'monthly', 'quarterly', etc.
  next_date TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de membresías ministeriales
CREATE TABLE IF NOT EXISTS ministry_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'coordinator', 'member', 'volunteer')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  skills TEXT[], -- Habilidades que aporta al ministerio
  availability TEXT, -- Disponibilidad horaria
  emergency_contact JSONB, -- {"name": string, "phone": string, "relationship": string}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar membresías duplicadas
  CONSTRAINT unique_ministry_member UNIQUE (ministry_id, user_id)
);

-- Crear tabla de grupos de edad específicos
CREATE TABLE IF NOT EXISTS age_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  min_age INTEGER,
  max_age INTEGER,
  icon VARCHAR(50),
  color VARCHAR(7),
  image_url TEXT,
  coordinator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  meeting_schedule TEXT,
  meeting_location VARCHAR(255),
  contact_info JSONB,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de membresías por grupo de edad
CREATE TABLE IF NOT EXISTS age_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  age_group_id UUID NOT NULL REFERENCES age_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('coordinator', 'assistant', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar membresías duplicadas
  CONSTRAINT unique_age_group_member UNIQUE (age_group_id, user_id)
);

-- Crear tabla de recursos ministeriales
CREATE TABLE IF NOT EXISTS ministry_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('document', 'video', 'audio', 'image', 'link', 'manual', 'form')),
  file_url TEXT,
  external_url TEXT,
  file_size INTEGER,
  access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN ('public', 'members_only', 'leaders_only', 'private')),
  download_count INTEGER DEFAULT 0,
  tags TEXT[],
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ministries_slug ON ministries(slug);
CREATE INDEX IF NOT EXISTS idx_ministries_leader ON ministries(leader_id);
CREATE INDEX IF NOT EXISTS idx_ministries_age_group ON ministries(target_age_group);
CREATE INDEX IF NOT EXISTS idx_ministries_active ON ministries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ministries_featured ON ministries(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_ministries_order ON ministries(display_order);

CREATE INDEX IF NOT EXISTS idx_ministry_activities_ministry ON ministry_activities(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministry_activities_type ON ministry_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_ministry_activities_active ON ministry_activities(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ministry_activities_next_date ON ministry_activities(next_date);
CREATE INDEX IF NOT EXISTS idx_ministry_activities_order ON ministry_activities(display_order);

CREATE INDEX IF NOT EXISTS idx_ministry_members_ministry ON ministry_members(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministry_members_user ON ministry_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ministry_members_role ON ministry_members(role);
CREATE INDEX IF NOT EXISTS idx_ministry_members_status ON ministry_members(status);
CREATE INDEX IF NOT EXISTS idx_ministry_members_active ON ministry_members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ministry_members_joined ON ministry_members(joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_age_groups_slug ON age_groups(slug);
CREATE INDEX IF NOT EXISTS idx_age_groups_coordinator ON age_groups(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_age_groups_active ON age_groups(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_age_groups_order ON age_groups(display_order);
CREATE INDEX IF NOT EXISTS idx_age_groups_ages ON age_groups(min_age, max_age);

CREATE INDEX IF NOT EXISTS idx_age_group_members_group ON age_group_members(age_group_id);
CREATE INDEX IF NOT EXISTS idx_age_group_members_user ON age_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_age_group_members_active ON age_group_members(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ministry_resources_ministry ON ministry_resources(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministry_resources_type ON ministry_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_ministry_resources_access ON ministry_resources(access_level);
CREATE INDEX IF NOT EXISTS idx_ministry_resources_active ON ministry_resources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ministry_resources_tags ON ministry_resources USING GIN(tags);

-- Crear triggers para updated_at
CREATE TRIGGER update_ministries_updated_at
  BEFORE UPDATE ON ministries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ministry_activities_updated_at
  BEFORE UPDATE ON ministry_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ministry_members_updated_at
  BEFORE UPDATE ON ministry_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_age_groups_updated_at
  BEFORE UPDATE ON age_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_age_group_members_updated_at
  BEFORE UPDATE ON age_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ministry_resources_updated_at
  BEFORE UPDATE ON ministry_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear función para actualizar contador de miembros en ministerios
CREATE OR REPLACE FUNCTION update_ministry_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ministries 
    SET member_count = (
      SELECT COUNT(*) 
      FROM ministry_members 
      WHERE ministry_id = NEW.ministry_id AND is_active = true
    )
    WHERE id = NEW.ministry_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE ministries 
    SET member_count = (
      SELECT COUNT(*) 
      FROM ministry_members 
      WHERE ministry_id = NEW.ministry_id AND is_active = true
    )
    WHERE id = NEW.ministry_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ministries 
    SET member_count = (
      SELECT COUNT(*) 
      FROM ministry_members 
      WHERE ministry_id = OLD.ministry_id AND is_active = true
    )
    WHERE id = OLD.ministry_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar contador de miembros en ministerios
CREATE TRIGGER update_ministry_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ministry_members
  FOR EACH ROW
  EXECUTE FUNCTION update_ministry_member_count();

-- Crear función para actualizar contador de miembros en grupos de edad
CREATE OR REPLACE FUNCTION update_age_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE age_groups 
    SET member_count = (
      SELECT COUNT(*) 
      FROM age_group_members 
      WHERE age_group_id = NEW.age_group_id AND is_active = true
    )
    WHERE id = NEW.age_group_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE age_groups 
    SET member_count = (
      SELECT COUNT(*) 
      FROM age_group_members 
      WHERE age_group_id = NEW.age_group_id AND is_active = true
    )
    WHERE id = NEW.age_group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE age_groups 
    SET member_count = (
      SELECT COUNT(*) 
      FROM age_group_members 
      WHERE age_group_id = OLD.age_group_id AND is_active = true
    )
    WHERE id = OLD.age_group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar contador de miembros en grupos de edad
CREATE TRIGGER update_age_group_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON age_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_age_group_member_count();

-- Crear función para actualizar contador de participantes en actividades
CREATE OR REPLACE FUNCTION update_activity_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Esta función se puede expandir cuando se cree una tabla de participantes en actividades
  -- Por ahora, solo es un placeholder
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Habilitar Row Level Security (RLS)
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_resources ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para ministries
CREATE POLICY "Active ministries are viewable by everyone" ON ministries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Ministries can be created by authenticated users" ON ministries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Ministries can be updated by leaders, admins and pastors" ON ministries
  FOR UPDATE USING (
    auth.uid() = leader_id OR
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Ministries can be deleted by admins and pastors" ON ministries
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para ministry_activities
CREATE POLICY "Active ministry activities are viewable by everyone" ON ministry_activities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Ministry activities can be managed by ministry leaders and admins" ON ministry_activities
  FOR ALL USING (
    auth.uid() IN (
      SELECT leader_id FROM ministries WHERE id = ministry_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM ministry_members 
      WHERE ministry_id = ministry_activities.ministry_id 
      AND role IN ('leader', 'co_leader', 'coordinator') 
      AND is_active = true
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para ministry_members
CREATE POLICY "Ministry members can view their own memberships" ON ministry_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT leader_id FROM ministries WHERE id = ministry_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM ministry_members m2
      WHERE m2.ministry_id = ministry_members.ministry_id 
      AND m2.role IN ('leader', 'co_leader') 
      AND m2.is_active = true
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Users can join ministries" ON ministry_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Ministry members can be updated by leaders and admins" ON ministry_members
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT leader_id FROM ministries WHERE id = ministry_id
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Ministry members can leave or be removed by leaders and admins" ON ministry_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT leader_id FROM ministries WHERE id = ministry_id
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para age_groups
CREATE POLICY "Active age groups are viewable by everyone" ON age_groups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Age groups can be managed by coordinators, admins and pastors" ON age_groups
  FOR ALL USING (
    auth.uid() = coordinator_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para age_group_members
CREATE POLICY "Age group members can view their own memberships" ON age_group_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT coordinator_id FROM age_groups WHERE id = age_group_id
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Users can join age groups" ON age_group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Age group members can be updated by coordinators and admins" ON age_group_members
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT coordinator_id FROM age_groups WHERE id = age_group_id
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para ministry_resources
CREATE POLICY "Public ministry resources are viewable by everyone" ON ministry_resources
  FOR SELECT USING (access_level = 'public' AND is_active = true);

CREATE POLICY "Member-only resources are viewable by ministry members" ON ministry_resources
  FOR SELECT USING (
    (access_level = 'public' AND is_active = true) OR
    (access_level = 'members_only' AND auth.uid() IN (
      SELECT user_id FROM ministry_members 
      WHERE ministry_id = ministry_resources.ministry_id AND is_active = true
    )) OR
    (access_level = 'leaders_only' AND auth.uid() IN (
      SELECT user_id FROM ministry_members 
      WHERE ministry_id = ministry_resources.ministry_id 
      AND role IN ('leader', 'co_leader', 'coordinator') 
      AND is_active = true
    )) OR
    (access_level = 'private' AND auth.uid() = created_by) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Ministry resources can be managed by leaders and admins" ON ministry_resources
  FOR ALL USING (
    auth.uid() IN (
      SELECT leader_id FROM ministries WHERE id = ministry_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM ministry_members 
      WHERE ministry_id = ministry_resources.ministry_id 
      AND role IN ('leader', 'co_leader', 'coordinator') 
      AND is_active = true
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Insertar ministerios de ejemplo
INSERT INTO ministries (name, slug, description, detailed_description, target_age_group, meeting_schedule, meeting_location, contact_email, contact_phone, is_active, is_featured, display_order) VALUES
('Ministerio de Alabanza', 'alabanza', 'Ministerio dedicado a la adoración y música en los servicios', 'Nuestro ministerio de alabanza se dedica a guiar a la congregación en adoración a través de la música. Buscamos músicos y cantantes comprometidos con la excelencia y la adoración genuina.', 'all', 'Ensayos: Miércoles 7:00 PM, Domingos 8:00 AM', 'Santuario Principal', 'alabanza@iglesia.com', '+57 300 123-4567', true, true, 1),
('Ministerio de Niños', 'ninos', 'Ministerio enfocado en la enseñanza y cuidado de los niños', 'Dedicados a enseñar a los niños sobre el amor de Jesús a través de actividades dinámicas, juegos y enseñanzas bíblicas adaptadas a su edad.', 'children', 'Domingos 9:00 AM y 11:00 AM', 'Aulas de Niños', 'ninos@iglesia.com', '+57 300 234-5678', true, true, 2),
('Ministerio de Jóvenes', 'jovenes', 'Ministerio para adolescentes y jóvenes adultos', 'Un espacio donde los jóvenes pueden crecer en su fe, desarrollar liderazgo y formar amistades sólidas basadas en principios cristianos.', 'youth', 'Viernes 7:00 PM', 'Salón de Jóvenes', 'jovenes@iglesia.com', '+57 300 345-6789', true, true, 3),
('Ministerio de Intercesión', 'intercesion', 'Ministerio dedicado a la oración e intercesión', 'Grupo comprometido con la oración constante por las necesidades de la iglesia, la comunidad y las naciones.', 'all', 'Martes 6:00 AM, Sábados 6:00 PM', 'Sala de Oración', 'intercesion@iglesia.com', '+57 300 456-7890', true, false, 4),
('Ministerio de Evangelismo', 'evangelismo', 'Ministerio enfocado en compartir el evangelio', 'Dedicados a llevar el mensaje de salvación a nuestra comunidad y más allá, a través de diferentes estrategias evangelísticas.', 'all', 'Sábados 2:00 PM', 'Punto de Encuentro Variable', 'evangelismo@iglesia.com', '+57 300 567-8901', true, false, 5),
('Ministerio de Matrimonios', 'matrimonios', 'Ministerio para fortalecer los matrimonios', 'Espacio para que las parejas casadas fortalezcan su relación matrimonial basándose en principios bíblicos.', 'adults', 'Segundo sábado del mes 7:00 PM', 'Salón de Matrimonios', 'matrimonios@iglesia.com', '+57 300 678-9012', true, false, 6),
('Ministerio de Adultos Mayores', 'adultos-mayores', 'Ministerio para la tercera edad', 'Un ministerio especial para nuestros hermanos de la tercera edad, con actividades adaptadas y compañerismo.', 'seniors', 'Jueves 3:00 PM', 'Salón de Adultos Mayores', 'adultos@iglesia.com', '+57 300 789-0123', true, false, 7),
('Ministerio de Diaconado', 'diaconado', 'Ministerio de servicio y ayuda social', 'Dedicados a servir a la congregación y la comunidad en sus necesidades prácticas y espirituales.', 'all', 'Primer domingo del mes 1:00 PM', 'Oficina Pastoral', 'diaconado@iglesia.com', '+57 300 890-1234', true, false, 8);

-- Insertar grupos de edad de ejemplo
INSERT INTO age_groups (name, slug, description, min_age, max_age, meeting_schedule, meeting_location, is_active, display_order) VALUES
('Bebés y Maternales', 'bebes-maternales', 'Cuidado especializado para bebés y niños pequeños', 0, 3, 'Domingos durante los servicios', 'Sala de Bebés', true, 1),
('Preescolares', 'preescolares', 'Enseñanza bíblica para niños en edad preescolar', 4, 5, 'Domingos 9:00 AM y 11:00 AM', 'Aula Preescolar', true, 2),
('Niños Escolares', 'ninos-escolares', 'Escuela dominical para niños en edad escolar', 6, 11, 'Domingos 9:00 AM y 11:00 AM', 'Aulas de Primaria', true, 3),
('Preadolescentes', 'preadolescentes', 'Ministerio para preadolescentes', 12, 14, 'Domingos 9:00 AM, Miércoles 6:30 PM', 'Aula de Preadolescentes', true, 4),
('Adolescentes', 'adolescentes', 'Ministerio juvenil para adolescentes', 15, 17, 'Viernes 7:00 PM, Domingos 11:00 AM', 'Salón de Adolescentes', true, 5),
('Jóvenes Adultos', 'jovenes-adultos', 'Ministerio para jóvenes adultos solteros', 18, 30, 'Viernes 7:30 PM, Domingos 9:00 AM', 'Salón de Jóvenes Adultos', true, 6),
('Adultos', 'adultos', 'Ministerio para adultos en general', 31, 64, 'Domingos 9:00 AM y 11:00 AM', 'Santuario Principal', true, 7),
('Adultos Mayores', 'adultos-mayores', 'Ministerio especializado para la tercera edad', 65, 120, 'Jueves 3:00 PM, Domingos 9:00 AM', 'Salón de Adultos Mayores', true, 8);

-- Insertar actividades ministeriales de ejemplo
INSERT INTO ministry_activities (ministry_id, title, description, activity_type, schedule, location, duration, is_active, is_recurring, recurrence_pattern, display_order) VALUES
((SELECT id FROM ministries WHERE slug = 'alabanza'), 'Ensayo General', 'Ensayo semanal del equipo de alabanza', 'regular', 'Miércoles 7:00 PM - 9:00 PM', 'Santuario Principal', 120, true, true, 'weekly', 1),
((SELECT id FROM ministries WHERE slug = 'alabanza'), 'Ensayo Pre-Servicio', 'Ensayo antes del servicio dominical', 'regular', 'Domingos 8:00 AM - 8:45 AM', 'Santuario Principal', 45, true, true, 'weekly', 2),
((SELECT id FROM ministries WHERE slug = 'ninos'), 'Escuela Dominical', 'Enseñanza bíblica para niños', 'regular', 'Domingos 9:00 AM - 10:00 AM', 'Aulas de Niños', 60, true, true, 'weekly', 1),
((SELECT id FROM ministries WHERE slug = 'ninos'), 'Actividad Especial', 'Actividades recreativas y educativas', 'special', 'Primer sábado del mes 3:00 PM', 'Patio de Juegos', 120, true, true, 'monthly', 2),
((SELECT id FROM ministries WHERE slug = 'jovenes'), 'Reunión de Jóvenes', 'Encuentro semanal de jóvenes', 'regular', 'Viernes 7:00 PM - 9:00 PM', 'Salón de Jóvenes', 120, true, true, 'weekly', 1),
((SELECT id FROM ministries WHERE slug = 'jovenes'), 'Retiro Juvenil', 'Retiro anual de jóvenes', 'special', 'Una vez al año', 'Centro de Retiros', 2880, true, false, 'yearly', 2),
((SELECT id FROM ministries WHERE slug = 'intercesion'), 'Oración Matutina', 'Tiempo de oración e intercesión', 'regular', 'Martes 6:00 AM - 7:00 AM', 'Sala de Oración', 60, true, true, 'weekly', 1),
((SELECT id FROM ministries WHERE slug = 'intercesion'), 'Vigilia de Oración', 'Vigilia mensual de oración', 'special', 'Último sábado del mes 6:00 PM - 10:00 PM', 'Santuario Principal', 240, true, true, 'monthly', 2);

COMMIT;