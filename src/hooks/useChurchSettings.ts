import { useState, useEffect } from 'react';
import { supabase, type ChurchSetting, type ServiceSchedule, type OfficeHours, type SpecialDate, type ChurchFacility, type FacilityBooking } from '../lib/supabase';

// Definición del tipo SystemNotification
type SystemNotification = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

// Hook principal para configuraciones de la iglesia
export function useChurchSettings() {
  const [settings, setSettings] = useState<ChurchSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('church_settings')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('church_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
      await fetchSettings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar configuración');
    }
  };

  const getSetting = (key: string): string | null => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value || null;
  };

  const getPublicSettings = () => {
    return settings.filter(s => s.is_public);
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
    getPublicSettings,
    getSettingsByCategory,
    refetch: fetchSettings
  };
}

// Hook para horarios de servicios
export function useServiceSchedules() {
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_schedules')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (schedule: Omit<ServiceSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('service_schedules')
        .insert([schedule]);

      if (error) throw error;
      await fetchSchedules();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear horario');
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ServiceSchedule>) => {
    try {
      const { error } = await supabase
        .from('service_schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchSchedules();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar horario');
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSchedules();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar horario');
    }
  };

  const getSchedulesByDay = (dayOfWeek: number) => {
    return schedules.filter(s => s.day_of_week === dayOfWeek);
  };

  const getSchedulesByType = (serviceType: string) => {
    return schedules.filter(s => s.service_type === serviceType);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDay,
    getSchedulesByType,
    refetch: fetchSchedules
  };
}

// Hook para horarios de atención
export function useOfficeHours() {
  const [officeHours, setOfficeHours] = useState<OfficeHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOfficeHours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('office_hours')
        .select('*')
        .eq('is_active', true)
        .order('department')
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setOfficeHours(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar horarios de atención');
    } finally {
      setLoading(false);
    }
  };

  const getHoursByDepartment = (department: string) => {
    return officeHours.filter(h => h.department === department);
  };

  const getHoursByDay = (dayOfWeek: number) => {
    return officeHours.filter(h => h.day_of_week === dayOfWeek);
  };

  useEffect(() => {
    fetchOfficeHours();
  }, []);

  return {
    officeHours,
    loading,
    error,
    getHoursByDepartment,
    getHoursByDay,
    refetch: fetchOfficeHours
  };
}

// Hook para fechas especiales
export function useSpecialDates() {
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialDates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('special_dates')
        .select('*')
        .eq('is_active', true)
        .order('date');

      if (error) throw error;
      setSpecialDates(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar fechas especiales');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingDates = (limit: number = 5) => {
    const today = new Date().toISOString().split('T')[0];
    return specialDates
      .filter(d => d.date >= today)
      .slice(0, limit);
  };

  const getDatesByType = (dateType: string) => {
    return specialDates.filter(d => d.date_type === dateType);
  };

  useEffect(() => {
    fetchSpecialDates();
  }, []);

  return {
    specialDates,
    loading,
    error,
    getUpcomingDates,
    getDatesByType,
    refetch: fetchSpecialDates
  };
}

// Hook para instalaciones de la iglesia
export function useChurchFacilities() {
  const [facilities, setFacilities] = useState<ChurchFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('church_facilities')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setFacilities(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar instalaciones');
    } finally {
      setLoading(false);
    }
  };

  const getFacilitiesByType = (facilityType: string) => {
    return facilities.filter(f => f.facility_type === facilityType);
  };

  const getPublicFacilities = () => {
    return facilities.filter(f => f.is_public);
  };

  const getFacilitiesByFloor = (floorLevel: number) => {
    return facilities.filter(f => f.floor_level === floorLevel);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return {
    facilities,
    loading,
    error,
    getFacilitiesByType,
    getPublicFacilities,
    getFacilitiesByFloor,
    refetch: fetchFacilities
  };
}

// Hook para reservas de instalaciones
export function useFacilityBookings() {
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('facility_bookings')
        .select(`
          *,
          facility:church_facilities(*),
          booked_by_profile:profiles(*)
        `)
        .order('start_datetime');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (booking: Omit<FacilityBooking, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('facility_bookings')
        .insert([booking]);

      if (error) throw error;
      await fetchBookings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear reserva');
    }
  };

  const updateBookingStatus = async (id: string, status: string, approvedBy?: string, rejectionReason?: string) => {
    try {
      const updates: Record<string, unknown> = { status };
      if (status === 'approved' && approvedBy) {
        updates.approved_by = approvedBy;
        updates.approved_at = new Date().toISOString();
      }
      if (status === 'rejected' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('facility_bookings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchBookings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar reserva');
    }
  };

  const getBookingsByFacility = (facilityId: string) => {
    return bookings.filter(b => b.facility_id === facilityId);
  };

  const getBookingsByStatus = (status: string) => {
    return bookings.filter(b => b.status === status);
  };

  const getUpcomingBookings = () => {
    const now = new Date().toISOString();
    return bookings.filter(b => b.start_datetime >= now && b.status === 'approved');
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    getBookingsByFacility,
    getBookingsByStatus,
    getUpcomingBookings,
    refetch: fetchBookings
  };
}

// Hook para notificaciones del sistema
export function useSystemNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notification: Omit<SystemNotification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .insert([notification]);

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear notificación');
    }
  };

  const markAsRead = async (notificationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('notification_reads')
        .upsert([
          {
            notification_id: notificationId,
            user_id: userId,
            read_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al marcar como leída');
    }
  };

  const dismissNotification = async (notificationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('notification_reads')
        .upsert([
          {
            notification_id: notificationId,
            user_id: userId,
            read_at: new Date().toISOString(),
            dismissed_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al descartar notificación');
    }
  };

  const getNotificationsByPriority = (priority: string) => {
    return notifications.filter(n => n.priority === priority);
  };

  const getNotificationsByType = (notificationType: string) => {
    return notifications.filter(n => n.notification_type === notificationType);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    createNotification,
    markAsRead,
    dismissNotification,
    getNotificationsByPriority,
    getNotificationsByType,
    refetch: fetchNotifications
  };
}

// Hook para obtener configuración específica de la iglesia
export function useChurchInfo() {
  const { getSetting, loading, error } = useChurchSettings();

  const churchInfo = {
    name: getSetting('church_name') || 'Iglesia Cristiana',
    tagline: getSetting('church_tagline') || '',
    vision: getSetting('church_vision') || '',
    mission: getSetting('church_mission') || '',
    address: getSetting('church_address') || '',
    phone: getSetting('church_phone') || '',
    whatsapp: getSetting('church_whatsapp') || '',
    email: getSetting('church_email') || '',
    website: getSetting('church_website') || '',
    facebook: getSetting('facebook_url') || '',
    instagram: getSetting('instagram_url') || '',
    youtube: getSetting('youtube_url') || '',
    logo: getSetting('logo_url') || '/Pastor Reynel Dueñas P n g.png',
    primaryColor: getSetting('primary_color') || '#2563eb',
    secondaryColor: getSetting('secondary_color') || '#64748b'
  };

  return {
    churchInfo,
    loading,
    error
  };
}