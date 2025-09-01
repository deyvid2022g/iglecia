import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Video, BookOpen, PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';
import { useSermons, type Sermon } from '../hooks/useSermons';

// Interfaces para los datos
interface Event {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  location: {
    name: string;
    address: string;
  };
  description: string;
  capacity: number;
  registrations: number;
  image: string;
  host: string;
  requiresRSVP: boolean;
}

// Interfaz Sermon removida - ahora se importa desde useSermons hook

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  featuredImage: string;
  views: number;
}

export function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [events, setEvents] = useState<Event[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const { createSermon, updateSermon, deleteSermon, refreshSermons } = useSermons();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para formularios
  const [showEventForm, setShowEventForm] = useState(false);
  const [showSermonForm, setShowSermonForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [currentBlogPost, setCurrentBlogPost] = useState<BlogPost | null>(null);
  
  // Cargar datos guardados o usar datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      // Cargar eventos desde localStorage o usar ejemplos
      const savedEvents = localStorage.getItem('churchEvents');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        // Usar datos de ejemplo si no hay datos guardados
        setEvents([
        {
          id: 1,
          title: 'Culto Dominical',
          date: '2025-02-02',
          startTime: '10:00',
          endTime: '12:00',
          type: 'Culto',
          location: {
            name: 'Lugar de Refugio',
            address: 'Barranquilla'
          },
          description: 'Culto dominical con alabanza, adoración y mensaje inspirador.',
          capacity: 300,
          registrations: 85,
          image: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
          host: 'Pastor Reynel Dueñas',
          requiresRSVP: false
        },
        {
          id: 2,
          title: 'Taller para Matrimonios',
          date: '2025-02-08',
          startTime: '15:00',
          endTime: '18:00',
          type: 'Evento Especial',
          location: {
            name: 'Salón de Eventos',
            address: 'Sede Norte - Salón A'
          },
          description: 'Taller intensivo para fortalecer las relaciones matrimoniales con bases bíblicas.',
          capacity: 50,
          registrations: 32,
          image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
          host: 'Pastor Reynel Dueñas',
          requiresRSVP: true
        }
      ]);
      }
      
      // Cargar predicas desde localStorage o usar ejemplos
      const savedSermons = localStorage.getItem('churchSermons');
      if (savedSermons) {
        setSermons(JSON.parse(savedSermons));
      } else {
        // Usar datos de ejemplo si no hay datos guardados
        setSermons([
        {
          id: '1',
          slug: 'disenados-para-la-gloria-de-dios',
          title: 'Diseñados para la Gloria de Dios',
          speaker_name: 'Pastor Reynel Dueñas',
          preached_date: '2025-01-06',
          duration: '38:20',
          thumbnail_url: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
          description: 'Descubre tu identidad divina y camina en la excelencia para la cual fuiste creado.',
          tags: ['identidad', 'propósito', 'gloria'],
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          audio_url: '/audio/sermon-001.mp3',
          transcript: undefined,
          has_transcript: true,
          view_count: 1204,
          like_count: 0,
          comment_count: 0,
          category_id: undefined,
          is_published: true,
          featured: false,
          created_by: undefined,
          created_at: '2025-01-06T00:00:00Z',
          updated_at: '2025-01-06T00:00:00Z'
        },
        {
          id: '2',
          slug: 'el-corazon-del-padre-revelado',
          title: 'El Corazón del Padre Revelado',
          speaker_name: 'Pastor Reynel Dueñas',
          preached_date: '2025-01-13',
          duration: '35:15',
          thumbnail_url: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
          description: 'Una revelación poderosa del amor incondicional del Padre celestial.',
          tags: ['amor paternal', 'servicio', 'revelación'],
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          audio_url: '/audio/sermon-002.mp3',
          transcript: undefined,
          has_transcript: true,
          view_count: 892,
          like_count: 0,
          comment_count: 0,
          category_id: undefined,
          is_published: true,
          featured: false,
          created_by: undefined,
          created_at: '2025-01-13T00:00:00Z',
          updated_at: '2025-01-13T00:00:00Z'
        }
      ]);
      }
      
      // Cargar blogs desde localStorage o usar ejemplos
      const savedBlogPosts = localStorage.getItem('churchBlogPosts');

      if (savedBlogPosts) {
        setBlogPosts(JSON.parse(savedBlogPosts));
      } else {
        // Usar datos de ejemplo si no hay datos guardados
        setBlogPosts([
        {
          id: 1,
          title: 'Reflexión semanal: La esperanza que no defrauda',
          excerpt: 'En tiempos de incertidumbre, la esperanza cristiana se convierte en nuestro ancla.',
          content: 'Contenido completo del post...',
          author: {
            name: 'Pastor Reynel Dueñas',
            avatar: '/pastor-reynel-duenas.jpg'
          },
          category: 'Fe',
          tags: ['esperanza', 'vida cristiana', 'reflexión'],
          publishedAt: '2025-01-25',
          readTime: 5,
          featuredImage: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
          views: 234
        },
        {
          id: 2,
          title: 'Cómo ser voluntario en la iglesia: Una guía práctica',
          excerpt: 'Servir es una de las formas más hermosas de expresar nuestro amor por Dios y por otros.',
          content: 'Contenido completo del post...',
          author: {
            name: 'Pastor Reynel Dueñas',
            avatar: '/pastor-reynel-duenas.jpg'
          },
          category: 'Comunidad',
          tags: ['voluntariado', 'servicio', 'comunidad'],
          publishedAt: '2025-01-22',
          readTime: 7,
          featuredImage: 'https://images.pexels.com/photos/6994925/pexels-photo-6994925.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
          views: 189
        }
      ]);
      }
      
      setIsLoading(false);
    }, 1000);

  }, []); // Empty dependency array since we only want to run this effect once on mount
  
  // Función para agregar un nuevo evento
  const handleAddEvent = (event: Event) => {
    let updatedEvents;
    if (currentEvent) {
      // Actualizar evento existente
      updatedEvents = events.map(e => e.id === currentEvent.id ? event : e);
      setEvents(updatedEvents);
    } else {
      // Agregar nuevo evento
      const newEvent = {
        ...event,
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1
      };
      updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
    }
    // Guardar en localStorage
    localStorage.setItem('churchEvents', JSON.stringify(updatedEvents));
    setShowEventForm(false);
    setCurrentEvent(null);
  };
  
  // Función para agregar una nueva predica
  const handleAddSermon = async (sermonData: {
    title: string;
    description: string;
    speaker: string;
    date: string;
    duration?: string;
    videoUrl?: string;
    audioUrl?: string;
    tags?: string;
    thumbnail?: string;
    hasTranscript?: boolean;
  }) => {
    try {
      if (currentSermon) {
        // Actualizar prédica existente
        const result = await updateSermon(currentSermon.id.toString(), {
          title: sermonData.title,
          description: sermonData.description,
          speaker_name: sermonData.speaker,
          preached_date: sermonData.date,
          duration: sermonData.duration || undefined,
          video_url: sermonData.videoUrl,
          thumbnail_url: sermonData.thumbnail,
          tags: sermonData.tags ? sermonData.tags.split(',').map((tag: string) => tag.trim()) : [],
          has_transcript: sermonData.hasTranscript || false
        });
        
        if (result.error) {
          throw new Error(result.error.message || 'Error al actualizar la prédica');
        }
      } else {
        // Crear nueva prédica
        const result = await createSermon({
          slug: sermonData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          title: sermonData.title,
          description: sermonData.description,
          speaker_name: sermonData.speaker,
          preached_date: sermonData.date,
          duration: sermonData.duration || undefined,
          video_url: sermonData.videoUrl,
          thumbnail_url: sermonData.thumbnail,
          tags: sermonData.tags ? sermonData.tags.split(',').map((tag: string) => tag.trim()) : [],
          has_transcript: sermonData.hasTranscript || false,
          is_published: true,
          featured: false
        });
        
        if (result.error) {
          throw new Error(result.error.message || 'Error al crear la prédica');
        }
      }
      // Refrescar la lista de prédicas para mostrar los cambios
      await refreshSermons();
      setShowSermonForm(false);
      setCurrentSermon(null);
    } catch (err) {
      console.error('Error al guardar prédica:', err);
      alert('Error al guardar la prédica. Por favor, intenta de nuevo.');
    }
  };
  
  // Función para agregar un nuevo blog
  const handleAddBlogPost = (blogPost: BlogPost) => {
    let updatedBlogPosts;
    if (currentBlogPost) {
      // Actualizar blog existente
      updatedBlogPosts = blogPosts.map(b => b.id === currentBlogPost.id ? blogPost : b);
      setBlogPosts(updatedBlogPosts);
    } else {
      // Agregar nuevo blog
      const newBlogPost = {
        ...blogPost,
        id: blogPosts.length > 0 ? Math.max(...blogPosts.map(b => b.id)) + 1 : 1
      };
      updatedBlogPosts = [...blogPosts, newBlogPost];
      setBlogPosts(updatedBlogPosts);
    }
    // Guardar en localStorage
    localStorage.setItem('churchBlogPosts', JSON.stringify(updatedBlogPosts));
    setShowBlogForm(false);
    setCurrentBlogPost(null);
  };
  
  // Función para eliminar un evento
  const handleDeleteEvent = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
      // Guardar en localStorage
      localStorage.setItem('churchEvents', JSON.stringify(updatedEvents));
    }
  };
  
  // Función para eliminar una predica
  const handleDeleteSermon = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta prédica?')) {
      try {
        await deleteSermon(id);
      } catch (err) {
        console.error('Error al eliminar prédica:', err);
        alert('Error al eliminar la prédica. Por favor, intenta de nuevo.');
      }
    }
  };
  
  // Función para eliminar un blog
  const handleDeleteBlogPost = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este blog?')) {
      const updatedBlogPosts = blogPosts.filter(post => post.id !== id);
      setBlogPosts(updatedBlogPosts);
      // Guardar en localStorage
      localStorage.setItem('churchBlogPosts', JSON.stringify(updatedBlogPosts));
    }
  };
  
  // Función para editar un evento
  const handleEditEvent = (event: Event) => {
    setCurrentEvent(event);
    setShowEventForm(true);
  };
  
  // Función para editar una predica
  const handleEditSermon = (sermon: Sermon) => {
    setCurrentSermon(sermon);
    setShowSermonForm(true);
  };
  
  // Función para editar un blog
  const handleEditBlogPost = (blogPost: BlogPost) => {
    setCurrentBlogPost(blogPost);
    setShowBlogForm(true);
  };

  // Verificar si el usuario está autenticado y tiene permisos
  console.log('Debug Dashboard - User:', user);
  console.log('Debug Dashboard - Profile:', profile);
  console.log('Debug Dashboard - Profile Role:', profile?.role);
  const isAdmin = profile?.role === 'admin' || profile?.role === 'pastor' || profile?.role === 'leader';
  console.log('Debug Dashboard - isAdmin:', isAdmin);

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Verificando autenticación...</p>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar mensaje
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6 text-red-600">Acceso Denegado</h1>
        <p className="text-lg mb-4">Debes iniciar sesión para acceder al panel de administración.</p>
        <p>Por favor, inicia sesión con una cuenta autorizada.</p>
      </div>
    );
  }

  // Si el usuario no tiene permisos, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6 text-red-600">Acceso Denegado</h1>
        <p className="text-lg mb-4">No tienes permisos para acceder al panel de administración.</p>
        <p>Tu rol actual: {profile?.role || 'Sin rol asignado'}</p>
        <p>Por favor, contacta al administrador si crees que deberías tener acceso.</p>
      </div>
    );
  }

  // Renderizar el panel de administración
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      {/* Tabs de navegación */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('events')}
        >
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Eventos
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'sermons' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sermons')}
        >
          <div className="flex items-center">
            <Video className="w-4 h-4 mr-1" />
            Predicas
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'blog' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('blog')}
        >
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            Blog
          </div>
        </button>
      </div>
      
      {/* Contenido según la pestaña activa */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {/* Perfil del usuario */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={profile?.avatar_url || '/trabajo.png'} 
                  alt={profile?.name || 'Usuario'}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/trabajo.png';
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold">{profile?.name}</h2>
                <p className="text-gray-600 capitalize">{profile?.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{profile?.email || user?.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p>{profile?.phone || 'No especificado'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Fecha de registro</p>
                  <p>{profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : 'No disponible'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Último acceso</p>
                  <p>{profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'No disponible'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Gestión de Eventos */}
          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Gestión de Eventos</h2>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setCurrentEvent(null);
                    setShowEventForm(true);
                  }}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Nuevo Evento
                </button>
              </div>
              
              {/* Lista de eventos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={event.image} alt={event.title} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.host}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{event.startTime} - {event.endTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {event.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.location.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Formulario de evento (modal) */}
              {showEventForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{currentEvent ? 'Editar Evento' : 'Nuevo Evento'}</h3>
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setShowEventForm(false);
                          setCurrentEvent(null);
                        }}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Título del evento"
                          defaultValue={currentEvent?.title}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentEvent?.date}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentEvent?.type}
                          >
                            <option value="Culto">Culto</option>
                            <option value="Evento Especial">Evento Especial</option>
                            <option value="Taller">Taller</option>
                            <option value="Conferencia">Conferencia</option>
                            <option value="Retiro">Retiro</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label>
                          <input 
                            type="time" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentEvent?.startTime}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de finalización</label>
                          <input 
                            type="time" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentEvent?.endTime}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anfitrión</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del anfitrión"
                          defaultValue={currentEvent?.host}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          placeholder="Nombre del lugar"
                          defaultValue={currentEvent?.location.name}
                        />
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Dirección"
                          defaultValue={currentEvent?.location.address}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Descripción del evento"
                          defaultValue={currentEvent?.description}
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Número de personas"
                            defaultValue={currentEvent?.capacity}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            defaultValue={currentEvent?.image}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="requiresRSVP" 
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          defaultChecked={currentEvent?.requiresRSVP}
                        />
                        <label htmlFor="requiresRSVP" className="ml-2 block text-sm text-gray-900">
                          Requiere confirmación de asistencia
                        </label>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button 
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            setShowEventForm(false);
                            setCurrentEvent(null);
                          }}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="button"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            // Aquí se procesaría el formulario y se llamaría a handleAddEvent
                            // Por simplicidad, usamos el evento actual o uno nuevo
                            const eventData = currentEvent || {
                              id: 0,
                              title: 'Nuevo Evento',
                              date: '2025-03-01',
                              startTime: '10:00',
                              endTime: '12:00',
                              type: 'Culto',
                              location: {
                                name: 'Iglesia Principal',
                                address: 'Dirección Principal'
                              },
                              description: 'Descripción del nuevo evento',
                              capacity: 100,
                              registrations: 0,
                              image: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
                              host: 'Pastor Reynel Dueñas',
                              requiresRSVP: false
                            };
                            handleAddEvent(eventData);
                          }}
                        >
                          <Save className="w-5 h-5 mr-1 inline" />
                          {currentEvent ? 'Actualizar' : 'Guardar'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Gestión de Predicas */}
          {activeTab === 'sermons' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Gestión de Predicas</h2>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setCurrentSermon(null);
                    setShowSermonForm(true);
                  }}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Nueva Predica
                </button>
              </div>
              
              {/* Lista de predicas */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sermons.map((sermon) => (
                      <tr key={sermon.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded object-cover" src={sermon.thumbnail_url || '/default-sermon.jpg'} alt={sermon.title} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{sermon.title}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                {sermon.view_count} visualizaciones
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sermon.speaker_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sermon.preached_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sermon.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => handleEditSermon(sermon)}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteSermon(sermon.id.toString())}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Formulario de predica (modal) */}
              {showSermonForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{currentSermon ? 'Editar Predica' : 'Nueva Predica'}</h3>
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setShowSermonForm(false);
                          setCurrentSermon(null);
                        }}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      const sermonData = {
                        title: formData.get('title') as string,
                        speaker: formData.get('speaker') as string,
                        date: formData.get('date') as string,
                        duration: formData.get('duration') as string,
                        videoUrl: formData.get('videoUrl') as string,
                        description: formData.get('description') as string,
                        tags: formData.get('tags') as string,
                        thumbnail: formData.get('thumbnail') as string,
                        has_transcript: formData.get('hasTranscript') === 'on'
                      };
                      handleAddSermon(sermonData);
                    }}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input 
                          type="text" 
                          name="title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Título de la predica"
                          defaultValue={currentSermon?.title}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Predicador</label>
                          <input 
                            type="text" 
                            name="speaker"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del predicador"
                            defaultValue={currentSermon?.speaker_name}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                          <input 
                            type="date" 
                            name="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentSermon?.preached_date}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                          <input 
                            type="text" 
                            name="duration"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="HH:MM:SS"
                            defaultValue={currentSermon?.duration}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL de YouTube</label>
                          <input 
                            type="url" 
                            name="videoUrl"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://www.youtube.com/embed/..."
                            defaultValue={currentSermon?.video_url}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea 
                          name="description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Descripción de la predica"
                          defaultValue={currentSermon?.description}
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                        <input 
                          type="text" 
                          name="tags"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="fe, esperanza, amor"
                          defaultValue={currentSermon?.tags?.join(', ')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de la miniatura</label>
                        <input 
                          type="url" 
                          name="thumbnail"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          defaultValue={currentSermon?.thumbnail_url}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="hasTranscript" 
                          name="hasTranscript"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          defaultChecked={currentSermon?.has_transcript}
                        />
                        <label htmlFor="hasTranscript" className="ml-2 block text-sm text-gray-900">
                          Incluye transcripción
                        </label>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button 
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            setShowSermonForm(false);
                            setCurrentSermon(null);
                          }}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Save className="w-5 h-5 mr-1 inline" />
                          {currentSermon ? 'Actualizar' : 'Guardar'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Gestión de Blog */}
          {activeTab === 'blog' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Gestión del Blog</h2>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setCurrentBlogPost(null);
                    setShowBlogForm(true);
                  }}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Nueva Entrada
                </button>
              </div>
              
              {/* Lista de entradas de blog */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blogPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded object-cover" src={post.featuredImage} alt={post.title} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{post.title}</div>
                              <div className="text-sm text-gray-500">{post.excerpt.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img className="h-6 w-6 rounded-full mr-2" src={post.author.avatar} alt={post.author.name} />
                            <span className="text-sm text-gray-900">{post.author.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => handleEditBlogPost(post)}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteBlogPost(post.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Formulario de blog (modal) */}
              {showBlogForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{currentBlogPost ? 'Editar Entrada' : 'Nueva Entrada'}</h3>
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setShowBlogForm(false);
                          setCurrentBlogPost(null);
                        }}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Título de la entrada"
                          defaultValue={currentBlogPost?.title}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Extracto</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Breve resumen de la entrada"
                          defaultValue={currentBlogPost?.excerpt}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={8}
                          placeholder="Contenido completo de la entrada"
                          defaultValue={currentBlogPost?.content}
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentBlogPost?.category}
                          >
                            <option value="Fe">Fe</option>
                            <option value="Comunidad">Comunidad</option>
                            <option value="Familia">Familia</option>
                            <option value="Liderazgo">Liderazgo</option>
                            <option value="Testimonios">Testimonios</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de publicación</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentBlogPost?.publishedAt}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="fe, esperanza, amor"
                          defaultValue={currentBlogPost?.tags.join(', ')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen destacada</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          defaultValue={currentBlogPost?.featuredImage}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de lectura (minutos)</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="5"
                            defaultValue={currentBlogPost?.readTime}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={currentBlogPost?.author.name}
                          >
                            <option value="Pastor Reynel Dueñas">Pastor Reynel Dueñas</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button 
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            setShowBlogForm(false);
                            setCurrentBlogPost(null);
                          }}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="button"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            // Aquí se procesaría el formulario y se llamaría a handleAddBlogPost
                            // Por simplicidad, usamos el post actual o uno nuevo
                            const blogData = currentBlogPost || {
                              id: 0,
                              title: 'Nueva Entrada de Blog',
                              excerpt: 'Extracto de la nueva entrada de blog',
                              content: 'Contenido completo de la nueva entrada de blog...',
                              author: {
                                name: 'Pastor Reynel Dueñas',
                                avatar: '/pastor-reynel-duenas.jpg'
                              },
                              category: 'Fe',
                              tags: ['fe', 'esperanza'],
                              publishedAt: '2025-03-01',
                              readTime: 5,
                              featuredImage: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
                              views: 0
                            };
                            handleAddBlogPost(blogData);
                          }}
                        >
                          <Save className="w-5 h-5 mr-1 inline" />
                          {currentBlogPost ? 'Actualizar' : 'Guardar'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}