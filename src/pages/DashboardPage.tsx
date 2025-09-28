import React, { useState } from 'react'
import { 
  Calendar, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Menu,
  X,
  TrendingUp,
  Eye,
  ChevronRight
} from 'lucide-react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useAuth } from '../contexts/SupabaseAuthContext'

import UserManagement from '../components/admin/UserManagement'
import EventManagement from '../components/admin/EventManagement'
import SermonManagement from '../components/admin/SermonManagement'
import BlogManagement from '../components/admin/BlogManagement'
import { RealTimeStatsOverview } from '../components/dashboard/RealTimeStatsOverview'

type SectionType = 'overview' | 'events' | 'sermons' | 'blog' | 'analytics' | 'members' | 'messages' | 'settings'

export const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { stats, recentActivity, loading, error, refreshStats } = useDashboardStats()

  const sidebarItems = [
    { id: 'overview', icon: BarChart3, label: 'Resumen', active: true },
    { id: 'events', icon: Calendar, label: 'Eventos', active: true },
    { id: 'sermons', icon: FileText, label: 'Prédicas', active: true },
    { id: 'blog', icon: FileText, label: 'Blog', active: true },
    { id: 'analytics', icon: BarChart3, label: 'Analíticas', active: false },
    { id: 'members', icon: Users, label: 'Miembros', active: true },
    { id: 'messages', icon: MessageSquare, label: 'Mensajes', active: false },
    { id: 'settings', icon: Settings, label: 'Configuración', active: false }
  ]

  const getSectionTitle = () => {
    const titles = {
      overview: 'Resumen del Dashboard',
      events: 'Gestión de Eventos',
      sermons: 'Gestión de Prédicas',
      blog: 'Gestión del Blog',
      analytics: 'Analíticas',
      members: 'Gestión de Miembros',
      messages: 'Centro de Mensajes',
      settings: 'Configuración'
    }
    return titles[activeSection]
  }

  const getSectionDescription = () => {
    const descriptions = {
      overview: 'Vista general de las actividades y estadísticas de la iglesia',
      events: 'Administra eventos, conferencias y actividades especiales',
      sermons: 'Gestiona prédicas, series y recursos multimedia',
      blog: 'Administra publicaciones del blog y contenido editorial',
      analytics: 'Análisis detallado de métricas y rendimiento',
      members: 'Gestión de la membresía y perfiles de usuarios',
      messages: 'Centro de comunicación y mensajes',
      settings: 'Configuración del sistema y preferencias'
    }
    return descriptions[activeSection]
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    trend?: { value: number; isPositive: boolean }
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
                {trend.value}% este mes
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    )
  }

  const ActivityItem = ({ activity }: { activity: any }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'event': return <Calendar className="w-4 h-4" />
        case 'sermon': return <FileText className="w-4 h-4" />
        case 'blog': return <FileText className="w-4 h-4" />
        default: return <Users className="w-4 h-4" />
      }
    }

    const getColor = () => {
      switch (activity.type) {
        case 'event': return 'text-blue-600 bg-blue-50'
        case 'sermon': return 'text-green-600 bg-green-50'
        case 'blog': return 'text-purple-600 bg-purple-50'
        default: return 'text-gray-600 bg-gray-50'
      }
    }

    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${getColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          <p className="text-sm text-gray-500 truncate">{activity.description}</p>
        </div>
        <div className="text-xs text-gray-400">
          {new Date(activity.date).toLocaleDateString()}
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Eventos"
          value={stats.events.total}
          subtitle={`${stats.events.upcoming} próximos`}
          icon={Calendar}
          trend={{ value: Math.round((stats.events.thisMonth / Math.max(stats.events.total, 1)) * 100), isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Prédicas"
          value={stats.sermons.total}
          subtitle={`${stats.sermons.totalViews} visualizaciones`}
          icon={FileText}
          trend={{ value: Math.round((stats.sermons.thisMonth / Math.max(stats.sermons.total, 1)) * 100), isPositive: true }}
          color="green"
        />
        <StatCard
          title="Posts del Blog"
          value={stats.blogPosts.published}
          subtitle={`${stats.blogPosts.total} total`}
          icon={FileText}
          trend={{ value: Math.round((stats.blogPosts.thisMonth / Math.max(stats.blogPosts.total, 1)) * 100), isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Miembros"
          value={stats.members.active}
          subtitle={`${stats.members.total} registrados`}
          icon={Users}
          trend={{ value: Math.round((stats.members.newThisMonth / Math.max(stats.members.total, 1)) * 100), isPositive: true }}
          color="orange"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                <button 
                  onClick={refreshStats}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Actualizar
                </button>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-1">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveSection('events')}
                className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Nuevo Evento</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </button>
              <button 
                onClick={() => setActiveSection('sermons')}
                className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Nueva Prédica</span>
                </div>
                <ChevronRight className="w-4 h-4 text-green-600" />
              </button>
              <button 
                onClick={() => setActiveSection('blog')}
                className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Nuevo Post</span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Rendimiento</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Visualizaciones</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.sermons.totalViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Eventos este mes</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.events.thisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Nuevos miembros</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.members.newThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Time Stats Overview */}
      <div className="mt-8">
        <RealTimeStatsOverview />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'events':
        return <EventManagement />
      case 'sermons':
        return <SermonManagement />
      case 'blog':
        return <BlogManagement />
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analíticas Avanzadas</h3>
            <p className="text-gray-600 mb-4">Esta sección estará disponible próximamente</p>
            <p className="text-sm text-gray-500">Incluirá métricas detalladas, gráficos interactivos y reportes personalizados</p>
          </div>
        )
      case 'members':
        return <UserManagement />
      case 'messages':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Centro de Mensajes</h3>
            <p className="text-gray-600 mb-4">Sistema de comunicación en desarrollo</p>
            <p className="text-sm text-gray-500">Incluirá mensajería, notificaciones y comunicación masiva</p>
          </div>
        )
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración del Sistema</h3>
            <p className="text-gray-600 mb-4">Panel de configuración en desarrollo</p>
            <p className="text-sm text-gray-500">Permitirá personalizar la aplicación y gestionar configuraciones globales</p>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center max-w-md">
          <div className="text-red-600 mb-4">
            <X className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshStats}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IR</span>
              </div>
              <span className="font-semibold text-gray-900">Iglesia Refugio</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as SectionType)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {!item.active && (
                    <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role || 'Miembro'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{getSectionTitle()}</h1>
                <p className="text-sm text-gray-600 hidden sm:block">{getSectionDescription()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {loading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Cargando...</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}