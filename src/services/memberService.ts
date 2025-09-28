import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['users']['Row'];
type ProfileInsert = Database['public']['Tables']['users']['Insert'];
type ProfileUpdate = Database['public']['Tables']['users']['Update'];

type MinistryInsert = Database['public']['Tables']['ministries']['Insert'];
type MinistryUpdate = Database['public']['Tables']['ministries']['Update'];

type MinistryMemberInsert = Database['public']['Tables']['ministry_members']['Insert'];
type MinistryMemberUpdate = Database['public']['Tables']['ministry_members']['Update'];

type AgeGroupInsert = Database['public']['Tables']['age_groups']['Insert'];
type AgeGroupUpdate = Database['public']['Tables']['age_groups']['Update'];



// Servicios para Perfiles de Miembros
export const profileService = {
  // Obtener todos los perfiles
  async getProfiles() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener perfil por ID
  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener perfil por user_id
  async getProfileByUserId(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nuevo perfil
  async createProfile(profile: ProfileInsert) {
    const { data, error } = await supabase
      .from('users')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar perfil
  async updateProfile(id: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar perfil
  async deleteProfile(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Buscar perfiles por nombre
  async searchProfiles(searchTerm: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('full_name');

    if (error) throw error;
    return data;
  }
};

// Servicios para Ministerios
export const ministryService = {
  // Obtener todos los ministerios
  async getMinistries() {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Obtener ministerio por ID
  async getMinistryById(id: string) {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener ministerios activos
  async getActiveMinistries() {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Crear nuevo ministerio
  async createMinistry(ministry: MinistryInsert) {
    const { data, error } = await supabase
      .from('ministries')
      .insert(ministry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar ministerio
  async updateMinistry(id: string, updates: MinistryUpdate) {
    const { data, error } = await supabase
      .from('ministries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar ministerio
  async deleteMinistry(id: string) {
    const { error } = await supabase
      .from('ministries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Obtener ministerios por líder
  async getMinistriesByLeader(leaderId: string) {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .eq('leader_id', leaderId)
      .order('name');

    if (error) throw error;
    return data;
  }
};

// Servicios para Miembros de Ministerios
export const ministryMemberService = {
  // Obtener todos los miembros de ministerios
  async getMinistryMembers() {
    const { data, error } = await supabase
      .from('ministry_members')
      .select(`
        *,
        ministries:ministry_id(*),
        users:user_id(*)
      `)
      .order('joined_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener miembros por ministerio
  async getMembersByMinistry(ministryId: string) {
    const { data, error } = await supabase
      .from('ministry_members')
      .select(`
        *,
        users:user_id(*)
      `)
      .eq('ministry_id', ministryId)
      .eq('is_active', true)
      .order('joined_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener ministerios por usuario
  async getMinistriesByUser(userId: string) {
    const { data, error } = await supabase
      .from('ministry_members')
      .select(`
        *,
        ministries:ministry_id(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('joined_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Agregar miembro a ministerio
  async addMemberToMinistry(membership: MinistryMemberInsert) {
    const { data, error } = await supabase
      .from('ministry_members')
      .insert(membership)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar membresía
  async updateMembership(id: string, updates: MinistryMemberUpdate) {
    const { data, error } = await supabase
      .from('ministry_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remover miembro de ministerio
  async removeMemberFromMinistry(id: string) {
    const { error } = await supabase
      .from('ministry_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Verificar si usuario es miembro de ministerio
  async isMemberOfMinistry(userId: string, ministryId: string) {
    const { data, error } = await supabase
      .from('ministry_members')
      .select('id')
      .eq('user_id', userId)
      .eq('ministry_id', ministryId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// Servicios para Grupos de Edad
export const ageGroupService = {
  // Obtener todos los grupos de edad
  async getAgeGroups() {
    const { data, error } = await supabase
      .from('age_groups')
      .select('*')
      .order('min_age', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Obtener grupo de edad por ID
  async getAgeGroupById(id: string) {
    const { data, error } = await supabase
      .from('age_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener grupos de edad activos
  async getActiveAgeGroups() {
    const { data, error } = await supabase
      .from('age_groups')
      .select('*')
      .eq('is_active', true)
      .order('min_age', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Crear nuevo grupo de edad
  async createAgeGroup(ageGroup: AgeGroupInsert) {
    const { data, error } = await supabase
      .from('age_groups')
      .insert(ageGroup)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar grupo de edad
  async updateAgeGroup(id: string, updates: AgeGroupUpdate) {
    const { data, error } = await supabase
      .from('age_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar grupo de edad
  async deleteAgeGroup(id: string) {
    const { error } = await supabase
      .from('age_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Obtener grupo de edad por edad específica
  async getAgeGroupByAge(age: number) {
    const { data, error } = await supabase
      .from('age_groups')
      .select('*')
      .lte('min_age', age)
      .or(`max_age.gte.${age},max_age.is.null`)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

// Funciones auxiliares
export const memberUtils = {
  // Calcular edad a partir de fecha de nacimiento
  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Obtener nombre completo del perfil
  getFullName(profile: Profile): string {
    return profile.full_name || 'Sin nombre';
  },

  // Formatear teléfono
  formatPhone(phone: string): string {
    if (!phone) return '';
    // Remover caracteres no numéricos
    const cleaned = phone.replace(/\D/g, '');
    // Formatear como (XXX) XXX-XXXX si tiene 10 dígitos
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  // Validar email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};