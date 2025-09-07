// Servicio de datos locales para reemplazar Supabase
// Utiliza localStorage para persistir datos

// Interfaces de datos
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  author_name: string;
  published: boolean;
  featured_image?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  category: 'service' | 'conference' | 'workshop' | 'social' | 'other';
  max_attendees?: number;
  current_attendees: number;
  created_at: string;
  updated_at: string;
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  leader_name: string;
  leader_contact?: string;
  image_url?: string;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  description: string;
  pastor_name: string;
  date: string;
  audio_url?: string;
  video_url?: string;
  scripture_reference?: string;
  series?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Testimony {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_email?: string;
  approved: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

class LocalDataService {
  private readonly BLOG_KEY = 'iglesia_blog_posts';
  private readonly EVENTS_KEY = 'iglesia_events';
  private readonly MINISTRIES_KEY = 'iglesia_ministries';
  private readonly SERMONS_KEY = 'iglesia_sermons';
  private readonly TESTIMONIES_KEY = 'iglesia_testimonies';

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Inicializar datos por defecto si no existen
    if (!localStorage.getItem(this.BLOG_KEY)) {
      this.initializeBlogPosts();
    }
    if (!localStorage.getItem(this.EVENTS_KEY)) {
      this.initializeEvents();
    }
    if (!localStorage.getItem(this.MINISTRIES_KEY)) {
      this.initializeMinistries();
    }
    if (!localStorage.getItem(this.SERMONS_KEY)) {
      this.initializeSermons();
    }
    if (!localStorage.getItem(this.TESTIMONIES_KEY)) {
      this.initializeTestimonies();
    }
  }

  private initializeBlogPosts() {
    const defaultPosts: BlogPost[] = [
      {
        id: 'blog-001',
        title: 'Bienvenidos a Lugar de Refugio',
        content: 'Nos complace darles la bienvenida a nuestra comunidad de fe. Aquí encontrarán un lugar donde crecer espiritualmente y formar parte de una familia que se ama y se apoya mutuamente.',
        excerpt: 'Bienvenidos a nuestra comunidad de fe donde encontrarán amor y apoyo.',
        author_id: 'pastor-001',
        author_name: 'Pastor Principal',
        published: true,
        tags: ['bienvenida', 'comunidad', 'fe'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString()
      },
      {
        id: 'blog-002',
        title: 'La Importancia de la Oración',
        content: 'La oración es el medio por el cual nos comunicamos con Dios. Es un tiempo sagrado donde podemos expresar nuestras necesidades, agradecimientos y adoración.',
        excerpt: 'Descubre el poder transformador de la oración en tu vida diaria.',
        author_id: 'pastor-001',
        author_name: 'Pastor Principal',
        published: true,
        tags: ['oración', 'espiritualidad', 'crecimiento'],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        published_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    localStorage.setItem(this.BLOG_KEY, JSON.stringify(defaultPosts));
  }

  private initializeEvents() {
    const defaultEvents: Event[] = [
      {
        id: 'event-001',
        title: 'Servicio Dominical',
        description: 'Únete a nosotros para un tiempo de adoración, enseñanza y comunión.',
        date: this.getNextSunday(),
        time: '10:00',
        location: 'Santuario Principal',
        category: 'service',
        current_attendees: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'event-002',
        title: 'Estudio Bíblico Semanal',
        description: 'Profundiza en la Palabra de Dios con nuestro estudio bíblico interactivo.',
        date: this.getNextWednesday(),
        time: '19:00',
        location: 'Sala de Conferencias',
        category: 'workshop',
        current_attendees: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(defaultEvents));
  }

  private initializeMinistries() {
    const defaultMinistries: Ministry[] = [
      {
        id: 'ministry-001',
        name: 'Ministerio de Jóvenes',
        description: 'Un espacio para que los jóvenes crezcan en su fe y desarrollen liderazgo.',
        leader_name: 'Pastor de Jóvenes',
        meeting_day: 'Viernes',
        meeting_time: '19:00',
        location: 'Sala de Jóvenes',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'ministry-002',
        name: 'Ministerio de Niños',
        description: 'Enseñanza bíblica adaptada para los más pequeños de la congregación.',
        leader_name: 'Coordinadora de Niños',
        meeting_day: 'Domingo',
        meeting_time: '10:00',
        location: 'Aula Infantil',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(this.MINISTRIES_KEY, JSON.stringify(defaultMinistries));
  }

  private initializeSermons() {
    const defaultSermons: Sermon[] = [
      {
        id: 'sermon-001',
        title: 'El Amor de Dios',
        description: 'Una reflexión sobre el amor incondicional de Dios hacia la humanidad.',
        pastor_name: 'Pastor Principal',
        date: new Date().toISOString().split('T')[0],
        scripture_reference: 'Juan 3:16',
        series: 'Fundamentos de la Fe',
        duration: 35,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(this.SERMONS_KEY, JSON.stringify(defaultSermons));
  }

  private initializeTestimonies() {
    const defaultTestimonies: Testimony[] = [
      {
        id: 'testimony-001',
        title: 'Dios cambió mi vida',
        content: 'Quiero compartir cómo Dios transformó mi vida cuando más lo necesitaba. Su amor y gracia me dieron una nueva esperanza.',
        author_name: 'María González',
        approved: true,
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(this.TESTIMONIES_KEY, JSON.stringify(defaultTestimonies));
  }

  private getNextSunday(): string {
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()));
    return nextSunday.toISOString().split('T')[0];
  }

  private getNextWednesday(): string {
    const today = new Date();
    const nextWednesday = new Date(today);
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
    nextWednesday.setDate(today.getDate() + (daysUntilWednesday === 0 ? 7 : daysUntilWednesday));
    return nextWednesday.toISOString().split('T')[0];
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Métodos para Blog Posts
  async getBlogPosts(options?: { published?: boolean; limit?: number }): Promise<BlogPost[]> {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simular delay
    
    const posts: BlogPost[] = JSON.parse(localStorage.getItem(this.BLOG_KEY) || '[]');
    let filteredPosts = posts;

    if (options?.published !== undefined) {
      filteredPosts = posts.filter(post => post.published === options.published);
    }

    filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (options?.limit) {
      filteredPosts = filteredPosts.slice(0, options.limit);
    }

    return filteredPosts;
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const posts: BlogPost[] = JSON.parse(localStorage.getItem(this.BLOG_KEY) || '[]');
    return posts.find(post => post.id === id) || null;
  }

  async createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const posts: BlogPost[] = JSON.parse(localStorage.getItem(this.BLOG_KEY) || '[]');
    const newPost: BlogPost = {
      ...post,
      id: this.generateId('blog'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    posts.push(newPost);
    localStorage.setItem(this.BLOG_KEY, JSON.stringify(posts));
    
    return newPost;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const posts: BlogPost[] = JSON.parse(localStorage.getItem(this.BLOG_KEY) || '[]');
    const postIndex = posts.findIndex(post => post.id === id);
    
    if (postIndex === -1) return null;
    
    posts[postIndex] = {
      ...posts[postIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(this.BLOG_KEY, JSON.stringify(posts));
    return posts[postIndex];
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const posts: BlogPost[] = JSON.parse(localStorage.getItem(this.BLOG_KEY) || '[]');
    const filteredPosts = posts.filter(post => post.id !== id);
    
    if (filteredPosts.length === posts.length) return false;
    
    localStorage.setItem(this.BLOG_KEY, JSON.stringify(filteredPosts));
    return true;
  }

  // Métodos para Events
  async getEvents(options?: { upcoming?: boolean; limit?: number }): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const events: Event[] = JSON.parse(localStorage.getItem(this.EVENTS_KEY) || '[]');
    let filteredEvents = events;

    if (options?.upcoming) {
      const now = new Date();
      filteredEvents = events.filter(event => new Date(event.date) >= now);
    }

    filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (options?.limit) {
      filteredEvents = filteredEvents.slice(0, options.limit);
    }

    return filteredEvents;
  }

  async getEvent(id: string): Promise<Event | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const events: Event[] = JSON.parse(localStorage.getItem(this.EVENTS_KEY) || '[]');
    return events.find(event => event.id === id) || null;
  }

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const events: Event[] = JSON.parse(localStorage.getItem(this.EVENTS_KEY) || '[]');
    const newEvent: Event = {
      ...event,
      id: this.generateId('event'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    events.push(newEvent);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const events: Event[] = JSON.parse(localStorage.getItem(this.EVENTS_KEY) || '[]');
    const eventIndex = events.findIndex(event => event.id === id);
    
    if (eventIndex === -1) return null;
    
    events[eventIndex] = {
      ...events[eventIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    return events[eventIndex];
  }

  async deleteEvent(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const events: Event[] = JSON.parse(localStorage.getItem(this.EVENTS_KEY) || '[]');
    const filteredEvents = events.filter(event => event.id !== id);
    
    if (filteredEvents.length === events.length) return false;
    
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(filteredEvents));
    return true;
  }

  // Métodos similares para Ministries, Sermons y Testimonies...
  // (Por brevedad, implementaré solo los métodos básicos)

  async getMinistries(): Promise<Ministry[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return JSON.parse(localStorage.getItem(this.MINISTRIES_KEY) || '[]');
  }

  async getSermons(limit?: number): Promise<Sermon[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const sermons: Sermon[] = JSON.parse(localStorage.getItem(this.SERMONS_KEY) || '[]');
    sermons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return limit ? sermons.slice(0, limit) : sermons;
  }

  async getTestimonies(approved?: boolean): Promise<Testimony[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const testimonies: Testimony[] = JSON.parse(localStorage.getItem(this.TESTIMONIES_KEY) || '[]');
    return approved !== undefined ? testimonies.filter(t => t.approved === approved) : testimonies;
  }

  // Método para limpiar todos los datos
  clearAllData(): void {
    localStorage.removeItem(this.BLOG_KEY);
    localStorage.removeItem(this.EVENTS_KEY);
    localStorage.removeItem(this.MINISTRIES_KEY);
    localStorage.removeItem(this.SERMONS_KEY);
    localStorage.removeItem(this.TESTIMONIES_KEY);
    this.initializeDefaultData();
  }
}

// Instancia singleton
export const localData = new LocalDataService();

// Tipos exportados para compatibilidad
export type {
  BlogPost as Post,
  Event,
  Ministry,
  Sermon,
  Testimony
};