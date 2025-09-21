import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Edit, Settings, Home, Users, BarChart3, MessageSquare, Bell, Search, Clock, User, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useBlog, useBlogCategories } from '../hooks/useBlog';
import { useSermons } from '../hooks/useSermons';
import { EventList } from '../components/events/EventList';
import { SermonList } from '../components/sermons/SermonList';
import { BlogList } from '../components/blog/BlogList';

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { events } = useEvents();
  const { posts } = useBlog();
  const { categories } = useBlogCategories();
  const { sermons } = useSermons();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'analytics' | 'events' | 'sermons' | 'blog' | 'members' | 'messages' | 'settings'>('dashboard');
  
  // Cargar datos guardados o usar datos de ejemplo
  useEffect(() => {
    // Los datos ahora se cargan automáticamente desde los hooks
    console.log('Dashboard loaded with real data');
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', active: true },
    { id: 'analytics', icon: BarChart3, label: 'Dashboard Analytics' },
    { id: 'events', icon: Calendar, label: 'Eventos' },
    { id: 'sermons', icon: BookOpen, label: 'Sermones' },
    { id: 'blog', icon: Edit, label: 'Blog' },
    { id: 'members', icon: Users, label: 'Miembros' },
    { id: 'messages', icon: MessageSquare, label: 'Mensajes' },
    { id: 'settings', icon: Settings, label: 'Configuración' },
  ];

  const projects = [
    { 
      id: 1, 
      name: 'Próximo Evento', 
      role: events?.[0]?.title || 'Sin eventos programados', 
      date: events?.[0]?.event_date ? new Date(events[0].event_date).toLocaleDateString() : 'N/A', 
      priority: 'High', 
      avatar: '/default-avatar.svg' 
    },
    { 
      id: 2, 
      name: 'Último Sermón', 
      role: sermons?.[0]?.title || 'Sin sermones disponibles', 
      date: sermons?.[0]?.preached_at ? new Date(sermons[0].preached_at).toLocaleDateString() : 'N/A', 
      priority: 'Medium', 
      avatar: '/default-avatar.svg' 
    },
    { 
      id: 3, 
      name: 'Último Post', 
      role: posts?.[0]?.title || 'Sin posts del blog', 
      date: posts?.[0]?.created_at ? new Date(posts[0].created_at).toLocaleDateString() : 'N/A', 
      priority: 'Medium', 
      avatar: '/default-avatar.svg' 
    },
    { 
      id: 4, 
      name: 'Categorías Blog', 
      role: `${categories?.length || 0} categorías activas`, 
      date: 'Actualizado', 
      priority: 'Low', 
      avatar: '/default-avatar.svg' 
    },
  ];

  const recentUpdates = [
    { 
      id: 1, 
      user: 'Sistema', 
      action: `${events?.length || 0} eventos programados`, 
      time: '2 min ago', 
      type: 'events' 
    },
    { 
      id: 2, 
      user: 'Blog', 
      action: `${posts?.length || 0} posts publicados`, 
      time: '5 min ago', 
      type: 'posts' 
    },
    { 
      id: 3, 
      user: 'Sermones', 
      action: `${sermons?.length || 0} sermones disponibles`, 
      time: '10 min ago', 
      type: 'sermons' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold">Able Pro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-500 text-white'
                        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-blue-500">
          <div className="flex items-center">
            <img
              src="/default-avatar.svg"
              alt="User"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-blue-200">UI Designer</p>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === 'dashboard' && 'Dashboard Analytics'}
                {activeSection === 'analytics' && 'Analytics Avanzado'}
                {activeSection === 'events' && 'Gestión de Eventos'}
                {activeSection === 'sermons' && 'Gestión de Sermones'}
                {activeSection === 'blog' && 'Gestión del Blog'}
                {activeSection === 'members' && 'Gestión de Miembros'}
                {activeSection === 'messages' && 'Centro de Mensajes'}
                {activeSection === 'settings' && 'Configuración'}
              </h1>
              <p className="text-gray-600">
                {activeSection === 'dashboard' && 'Panel principal con estadísticas generales'}
                {activeSection === 'analytics' && 'Análisis detallado de métricas'}
                {activeSection === 'events' && 'Administra eventos de la iglesia'}
                {activeSection === 'sermons' && 'Administra sermones y prédicas'}
                {activeSection === 'blog' && 'Administra posts y categorías del blog'}
                {activeSection === 'members' && 'Gestiona miembros de la congregación'}
                {activeSection === 'messages' && 'Comunicación y mensajería'}
                {activeSection === 'settings' && 'Configuración del sistema'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {activeSection === 'dashboard' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Stats Cards */}
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Support Requests */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{events?.length || 0}</p>
                        <p className="text-sm text-gray-500">Eventos Programados</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Total de eventos programados en el sistema.
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">
                        {events?.filter(e => e.is_published).length || 0} Publicados
                      </div>
                      <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium">
                        {events?.filter(e => !e.is_published).length || 0} Borradores
                      </div>
                    </div>
                  </div>

                  {/* Blog Posts */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{posts?.length || 0}</p>
                        <p className="text-sm text-gray-500">Posts del Blog</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Edit className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Total de artículos publicados en el blog.
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium">
                        {posts?.filter(p => p.is_published).length || 0} Publicados
                      </div>
                      <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium">
                        {posts?.filter(p => !p.is_published).length || 0} Borradores
                      </div>
                    </div>
                  </div>

                  {/* Sermons */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{sermons?.length || 0}</p>
                        <p className="text-sm text-gray-500">Sermones</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Total de sermones disponibles en la plataforma.
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium">
                        {sermons?.filter(s => s.is_published).length || 0} Publicados
                      </div>
                      <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium">
                        {sermons?.filter(s => !s.is_published).length || 0} Borradores
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold text-orange-500">{categories?.length || 0}</p>
                        <p className="text-sm text-gray-500">Categorías</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Categorías activas para organizar el contenido.
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium">
                        {categories?.filter(c => c.is_active).length || 0} Activas
                      </div>
                    </div>
                  </div>
                </div>

              {/* Projects Table */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Contenido Reciente</h3>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      Ver Todo
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              project.name === 'Próximo Evento' ? 'bg-blue-100' :
                              project.name === 'Último Sermón' ? 'bg-green-100' :
                              project.name === 'Último Post' ? 'bg-purple-100' : 'bg-orange-100'
                            }`}>
                              {project.name === 'Próximo Evento' ? <Calendar className="w-4 h-4 text-blue-600" /> :
                               project.name === 'Último Sermón' ? <BookOpen className="w-4 h-4 text-green-600" /> :
                               project.name === 'Último Post' ? <Edit className="w-4 h-4 text-purple-600" /> :
                               <Settings className="w-4 h-4 text-orange-600" />}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{project.name}</div>
                              <div className="text-sm text-gray-500">{project.role}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              project.priority === 'High' 
                                ? 'bg-green-100 text-green-800'
                                : project.priority === 'Medium'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {project.priority === 'High' ? 'Activo' : 
                               project.priority === 'Medium' ? 'Disponible' : 'Configurado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Latest Updates */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Latest Updates</h3>
                </div>
                <div className="p-6 space-y-4">
                  {recentUpdates.map((update) => (
                    <div key={update.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        update.type === 'events' ? 'bg-blue-500' :
                        update.type === 'posts' ? 'bg-purple-500' : 
                        update.type === 'sermons' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{update.action}</p>
                        <p className="text-xs text-gray-500">{update.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eventos</span>
                    <span className="text-lg font-semibold text-gray-900">{events?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Posts del Blog</span>
                    <span className="text-lg font-semibold text-gray-900">{posts?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sermones</span>
                    <span className="text-lg font-semibold text-gray-900">{sermons?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categorías</span>
                    <span className="text-lg font-semibold text-gray-900">{categories?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Events Section */}
          {activeSection === 'events' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <EventList showSearch={true} showFilters={true} showViewToggle={true} />
            </div>
          )}

          {/* Sermons Section */}
          {activeSection === 'sermons' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <SermonList showSearch={true} showFilters={true} showViewToggle={true} />
            </div>
          )}

          {/* Blog Section */}
          {activeSection === 'blog' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <BlogList showSearch={true} showFilters={true} showViewToggle={true} />
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Analytics Avanzado</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Eventos Más Populares</h3>
                  <p className="text-3xl font-bold">{events?.length || 0}</p>
                  <p className="text-blue-100">Total de eventos</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Sermones Más Vistos</h3>
                  <p className="text-3xl font-bold">{sermons?.length || 0}</p>
                  <p className="text-green-100">Total de sermones</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Posts Más Leídos</h3>
                  <p className="text-3xl font-bold">{posts?.length || 0}</p>
                  <p className="text-purple-100">Total de posts</p>
                </div>
              </div>
            </div>
          )}

          {/* Members Section */}
          {activeSection === 'members' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Gestión de Miembros</h2>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
                <p className="text-gray-500">La gestión de miembros estará disponible pronto.</p>
              </div>
            </div>
          )}

          {/* Messages Section */}
          {activeSection === 'messages' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Centro de Mensajes</h2>
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
                <p className="text-gray-500">El centro de mensajes estará disponible pronto.</p>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Configuración del Sistema</h2>
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración General</h3>
                  <p className="text-gray-600">Ajustes básicos del sistema</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de Supabase</h3>
                  <p className="text-gray-600">Conexión y configuración de la base de datos</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Permisos y Roles</h3>
                  <p className="text-gray-600">Gestión de usuarios y permisos</p>
                </div>
                <div className="text-center py-8">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración Avanzada</h3>
                  <p className="text-gray-500">Las opciones de configuración estarán disponibles pronto.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}