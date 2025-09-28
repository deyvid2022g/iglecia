import React from 'react'
import { 
  Users, 
  Calendar, 
  FileText, 
  UserCheck, 
  TrendingUp, 
  Eye, 
  Clock,
  RefreshCw,
  Activity,
  BarChart3
} from 'lucide-react'
import { useRealTimeDashboardStats } from '../../hooks/useRealTimeDashboardStats'

export const RealTimeStatsOverview: React.FC = () => {
  const { stats, activityLog, loading, error, refreshStats } = useRealTimeDashboardStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas en Tiempo Real</h2>
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar estadísticas</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={refreshStats}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'blue',
    trend,
    onClick 
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    trend?: { value: number; isPositive: boolean }
    onClick?: () => void
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    }

    return (
      <div 
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
        onClick={onClick}
      >
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
        case 'user_registration': return <Users className="w-4 h-4" />
        case 'event_created': return <Calendar className="w-4 h-4" />
        case 'sermon_published': return <FileText className="w-4 h-4" />
        case 'event_registration': return <UserCheck className="w-4 h-4" />
        default: return <Activity className="w-4 h-4" />
      }
    }

    const getColor = () => {
      switch (activity.type) {
        case 'user_registration': return 'text-blue-600 bg-blue-50'
        case 'event_created': return 'text-green-600 bg-green-50'
        case 'sermon_published': return 'text-purple-600 bg-purple-50'
        case 'event_registration': return 'text-orange-600 bg-orange-50'
        default: return 'text-gray-600 bg-gray-50'
      }
    }

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${getColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
          <p className="text-sm text-gray-500 truncate">{activity.description}</p>
          <div className="flex items-center mt-1 text-xs text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(activity.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas en Tiempo Real</h2>
          <p className="text-gray-600">Actualización automática cada 30 segundos</p>
        </div>
        <button
          onClick={refreshStats}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={stats.users.total}
          subtitle={`${stats.users.admins} admins, ${stats.users.regular} usuarios`}
          icon={Users}
          color="blue"
          trend={{ value: stats.users.newThisMonth, isPositive: true }}
        />
        
        <StatCard
          title="Eventos"
          value={stats.events.total}
          subtitle={`${stats.events.upcoming} próximos`}
          icon={Calendar}
          color="green"
          trend={{ value: stats.events.thisMonth, isPositive: true }}
        />
        
        <StatCard
          title="Sermones"
          value={stats.sermons.total}
          subtitle={`${stats.sermons.totalViews} vistas totales`}
          icon={FileText}
          color="purple"
          trend={{ value: stats.sermons.thisMonth, isPositive: true }}
        />
        
        <StatCard
          title="Inscripciones"
          value={stats.registrations.total}
          subtitle={`${stats.registrations.thisMonth} este mes`}
          icon={UserCheck}
          color="orange"
          trend={{ value: stats.registrations.thisMonth, isPositive: true }}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Usuarios Recientes</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            {stats.users.recentUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {activityLog.slice(0, 8).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Categories and Series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categorías de Eventos</h3>
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            {stats.events.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{category.name}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {category.count}
                </span>
              </div>
            ))}
            {stats.events.categories.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay categorías disponibles</p>
            )}
          </div>
        </div>

        {/* Sermon Series */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Series de Sermones</h3>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {stats.sermons.series.map((series, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{series.name}</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                  {series.count}
                </span>
              </div>
            ))}
            {stats.sermons.series.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay series disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}