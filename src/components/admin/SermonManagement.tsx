import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Play, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  BookOpen, 
  Star,
  FileText,
  Video,
  Music,
  Link,
  Image,
  Upload,
  X,
  Save,
  Loader2
} from 'lucide-react'
import { useSermonManagement, Sermon, SermonSeries, SermonResource } from '../../hooks/useSermonManagement'

const SermonManagement: React.FC = () => {
  const {
    sermons,
    categories,
    series,
    resources,
    stats,
    filters,
    loading,
    error,
    createSermon,
    updateSermon,
    deleteSermon,
    createSeries,
    updateSeries,
    deleteSeries,
    createResource,
    updateResource,
    deleteResource,
    fetchResources,
    setFilters,
    clearError
  } = useSermonManagement()

  const [showSermonModal, setShowSermonModal] = useState(false)
  const [showSeriesModal, setShowSeriesModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null)
  const [editingSeries, setEditingSeries] = useState<SermonSeries | null>(null)
  const [editingResource, setEditingResource] = useState<SermonResource | null>(null)
  const [selectedSermon, setSelectedSermon] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'sermons' | 'series' | 'resources'>('sermons')

  // Form states
  const [sermonForm, setSermonForm] = useState({
    title: '',
    description: '',
    content: '',
    scripture_references: '',
    speaker: '',
    speaker_bio: '',
    sermon_date: '',
    duration: '',
    audio_url: '',
    video_url: '',
    transcript: '',
    notes: '',
    thumbnail_url: '',
    category_id: '',
    series_id: '',
    tags: '',
    is_published: false,
    is_featured: false
  })

  const [seriesForm, setSeriesForm] = useState({
    title: '',
    description: '',
    image_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    display_order: 0
  })

  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    resource_type: 'pdf' as 'pdf' | 'audio' | 'video' | 'link' | 'image' | 'document',
    file_url: '',
    file_size: '',
    is_public: true
  })

  // Handle sermon form
  const handleSermonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const sermonData = {
        ...sermonForm,
        scripture_references: sermonForm.scripture_references ? sermonForm.scripture_references.split(',').map(ref => ref.trim()) : [],
        tags: sermonForm.tags ? sermonForm.tags.split(',').map(tag => tag.trim()) : [],
        slug: sermonForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }

      if (editingSermon) {
        await updateSermon(editingSermon.id, sermonData)
      } else {
        await createSermon(sermonData)
      }

      setShowSermonModal(false)
      setEditingSermon(null)
      resetSermonForm()
    } catch (err) {
      console.error('Error saving sermon:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle series form
  const handleSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const seriesData = {
        ...seriesForm,
        slug: seriesForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }

      if (editingSeries) {
        await updateSeries(editingSeries.id, seriesData)
      } else {
        await createSeries(seriesData)
      }

      setShowSeriesModal(false)
      setEditingSeries(null)
      resetSeriesForm()
    } catch (err) {
      console.error('Error saving series:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle resource form
  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSermon) return

    setSubmitting(true)

    try {
      const resourceData = {
        ...resourceForm,
        sermon_id: selectedSermon,
        file_size: resourceForm.file_size ? parseInt(resourceForm.file_size) : undefined
      }

      if (editingResource) {
        await updateResource(editingResource.id, resourceData)
      } else {
        await createResource(resourceData)
      }

      setShowResourceModal(false)
      setEditingResource(null)
      resetResourceForm()
    } catch (err) {
      console.error('Error saving resource:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Reset forms
  const resetSermonForm = () => {
    setSermonForm({
      title: '',
      description: '',
      content: '',
      scripture_references: '',
      speaker: '',
      speaker_bio: '',
      sermon_date: '',
      duration: '',
      audio_url: '',
      video_url: '',
      transcript: '',
      notes: '',
      thumbnail_url: '',
      category_id: '',
      series_id: '',
      tags: '',
      is_published: false,
      is_featured: false
    })
  }

  const resetSeriesForm = () => {
    setSeriesForm({
      title: '',
      description: '',
      image_url: '',
      start_date: '',
      end_date: '',
      is_active: true,
      display_order: 0
    })
  }

  const resetResourceForm = () => {
    setResourceForm({
      title: '',
      description: '',
      resource_type: 'pdf',
      file_url: '',
      file_size: '',
      is_public: true
    })
  }

  // Handle edit
  const handleEditSermon = (sermon: Sermon) => {
    setEditingSermon(sermon)
    setSermonForm({
      title: sermon.title,
      description: sermon.description,
      content: sermon.content || '',
      scripture_references: sermon.scripture_references?.join(', ') || '',
      speaker: sermon.speaker,
      speaker_bio: sermon.speaker_bio || '',
      sermon_date: sermon.sermon_date.split('T')[0],
      duration: sermon.duration || '',
      audio_url: sermon.audio_url || '',
      video_url: sermon.video_url || '',
      transcript: sermon.transcript || '',
      notes: sermon.notes || '',
      thumbnail_url: sermon.thumbnail_url || '',
      category_id: sermon.category_id || '',
      series_id: sermon.series_id || '',
      tags: sermon.tags?.join(', ') || '',
      is_published: sermon.is_published,
      is_featured: sermon.is_featured
    })
    setShowSermonModal(true)
  }

  const handleEditSeries = (seriesItem: SermonSeries) => {
    setEditingSeries(seriesItem)
    setSeriesForm({
      title: seriesItem.title,
      description: seriesItem.description,
      image_url: seriesItem.image_url || '',
      start_date: seriesItem.start_date.split('T')[0],
      end_date: seriesItem.end_date?.split('T')[0] || '',
      is_active: seriesItem.is_active,
      display_order: seriesItem.display_order
    })
    setShowSeriesModal(true)
  }

  const handleEditResource = (resource: SermonResource) => {
    setEditingResource(resource)
    setResourceForm({
      title: resource.title,
      description: resource.description || '',
      resource_type: resource.resource_type,
      file_url: resource.file_url,
      file_size: resource.file_size?.toString() || '',
      is_public: resource.is_public
    })
    setShowResourceModal(true)
  }

  // Handle delete
  const handleDeleteSermon = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este sermón?')) {
      await deleteSermon(id)
    }
  }

  const handleDeleteSeries = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta serie?')) {
      await deleteSeries(id)
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este recurso?')) {
      await deleteResource(id)
    }
  }

  // Handle view resources
  const handleViewResources = (sermonId: string) => {
    setSelectedSermon(sermonId)
    fetchResources(sermonId)
    setActiveTab('resources')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'pdf': return <FileText className="w-4 h-4" />
      case 'link': return <Link className="w-4 h-4" />
      case 'image': return <Image className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Sermones</h1>
          <p className="text-gray-600">Administra sermones, series y recursos</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSeriesModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Serie</span>
          </button>
          <button
            onClick={() => setShowSermonModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Sermón</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">⚠️</div>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sermones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSermons}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedSermons}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sermonsThisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vistas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Play className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sermons')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sermons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sermones
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'series'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Series
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recursos {selectedSermon && `(${resources.length})`}
          </button>
        </nav>
      </div>

      {/* Sermons Tab */}
      {activeTab === 'sermons' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar sermones..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.series}
                onChange={(e) => setFilters({ ...filters, series: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las series</option>
                {series.map(seriesItem => (
                  <option key={seriesItem.id} value={seriesItem.id}>
                    {seriesItem.title}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="published">Publicados</option>
                <option value="draft">Borradores</option>
              </select>
            </div>
          </div>

          {/* Sermons List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Cargando sermones...</span>
              </div>
            ) : sermons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sermones</h3>
                <p className="text-gray-600 mb-4">Comienza creando tu primer sermón</p>
                <button
                  onClick={() => setShowSermonModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Sermón
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sermón
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predicador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estadísticas
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sermons.map((sermon) => (
                      <tr key={sermon.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {sermon.thumbnail_url ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={sermon.thumbnail_url}
                                  alt={sermon.title}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {sermon.title}
                                {sermon.is_featured && (
                                  <Star className="inline w-4 h-4 text-yellow-500 ml-1" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {sermon.scripture_references?.join(', ')}
                              </div>
                              {sermon.series && (
                                <div className="text-xs text-blue-600">
                                  Serie: {sermon.series.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{sermon.speaker}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatDate(sermon.sermon_date)}
                            </span>
                          </div>
                          {sermon.duration && (
                            <div className="flex items-center mt-1">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-xs text-gray-500">
                                {sermon.duration}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sermon.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sermon.is_published ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {sermon.view_count}
                            </div>
                            <div className="flex items-center">
                              <Download className="w-4 h-4 mr-1" />
                              {sermon.download_count}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewResources(sermon.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver recursos"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditSermon(sermon)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSermon(sermon.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Series Tab */}
      {activeTab === 'series' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Cargando series...</span>
              </div>
            ) : series.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay series</h3>
                <p className="text-gray-600 mb-4">Comienza creando tu primera serie</p>
                <button
                  onClick={() => setShowSeriesModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Serie
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {series.map((seriesItem) => (
                  <div key={seriesItem.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {seriesItem.image_url && (
                      <img
                        src={seriesItem.image_url}
                        alt={seriesItem.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{seriesItem.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          seriesItem.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {seriesItem.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{seriesItem.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Inicio: {formatDate(seriesItem.start_date)}</span>
                        {seriesItem.end_date && (
                          <span>Fin: {formatDate(seriesItem.end_date)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditSeries(seriesItem)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSeries(seriesItem.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recursos del Sermón</h2>
              {selectedSermon && (
                <p className="text-sm text-gray-600">
                  {sermons.find(s => s.id === selectedSermon)?.title || 'Sermón seleccionado'}
                </p>
              )}
            </div>
            {selectedSermon && (
              <button
                onClick={() => setShowResourceModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Recurso</span>
              </button>
            )}
          </div>

          {!selectedSermon ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un sermón</h3>
              <p className="text-gray-600">Ve a la pestaña de sermones y haz clic en el ícono de recursos</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {resources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recursos</h3>
                  <p className="text-gray-600 mb-4">Agrega recursos para este sermón</p>
                  <button
                    onClick={() => setShowResourceModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Agregar Recurso
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recurso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tamaño
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descargas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resources.map((resource) => (
                        <tr key={resource.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {getResourceIcon(resource.resource_type)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {resource.title}
                                </div>
                                {resource.description && (
                                  <div className="text-sm text-gray-500">
                                    {resource.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {resource.resource_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resource.file_size ? `${(resource.file_size / 1024 / 1024).toFixed(1)} MB` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resource.download_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              resource.is_public
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {resource.is_public ? 'Público' : 'Privado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <a
                                href={resource.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver/Descargar"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleEditResource(resource)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResource(resource.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sermon Modal */}
      {showSermonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSermon ? 'Editar Sermón' : 'Nuevo Sermón'}
                </h2>
                <button
                  onClick={() => {
                    setShowSermonModal(false)
                    setEditingSermon(null)
                    resetSermonForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSermonSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={sermonForm.title}
                      onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencia Bíblica *
                    </label>
                    <input
                      type="text"
                      required
                      value={sermonForm.scripture_references}
                      onChange={(e) => setSermonForm({ ...sermonForm, scripture_references: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Juan 3:16, Mateo 5:1-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Predicador *
                    </label>
                    <input
                      type="text"
                      required
                      value={sermonForm.speaker}
                      onChange={(e) => setSermonForm({ ...sermonForm, speaker: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del Sermón *
                    </label>
                    <input
                      type="date"
                      required
                      value={sermonForm.sermon_date}
                      onChange={(e) => setSermonForm({ ...sermonForm, sermon_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={sermonForm.category_id}
                      onChange={(e) => setSermonForm({ ...sermonForm, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serie
                    </label>
                    <select
                      value={sermonForm.series_id}
                      onChange={(e) => setSermonForm({ ...sermonForm, series_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar serie</option>
                      {series.map(seriesItem => (
                        <option key={seriesItem.id} value={seriesItem.id}>
                          {seriesItem.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (minutos)
                    </label>
                    <input
                      type="text"
                      value={sermonForm.duration}
                      onChange={(e) => setSermonForm({ ...sermonForm, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Audio
                    </label>
                    <input
                      type="url"
                      value={sermonForm.audio_url}
                      onChange={(e) => setSermonForm({ ...sermonForm, audio_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Video
                    </label>
                    <input
                      type="url"
                      value={sermonForm.video_url}
                      onChange={(e) => setSermonForm({ ...sermonForm, video_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Miniatura
                    </label>
                    <input
                      type="url"
                      value={sermonForm.thumbnail_url}
                      onChange={(e) => setSermonForm({ ...sermonForm, thumbnail_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={sermonForm.description}
                    onChange={(e) => setSermonForm({ ...sermonForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido del Sermón
                  </label>
                  <textarea
                    value={sermonForm.content}
                    onChange={(e) => setSermonForm({ ...sermonForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía del Predicador
                  </label>
                  <textarea
                    value={sermonForm.speaker_bio}
                    onChange={(e) => setSermonForm({ ...sermonForm, speaker_bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={sermonForm.tags}
                    onChange={(e) => setSermonForm({ ...sermonForm, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="fe, esperanza, amor"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sermonForm.is_published}
                      onChange={(e) => setSermonForm({ ...sermonForm, is_published: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Publicar sermón</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sermonForm.is_featured}
                      onChange={(e) => setSermonForm({ ...sermonForm, is_featured: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sermón destacado</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSermonModal(false)
                      setEditingSermon(null)
                      resetSermonForm()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    <span>{editingSermon ? 'Actualizar' : 'Crear'} Sermón</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Series Modal */}
      {showSeriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSeries ? 'Editar Serie' : 'Nueva Serie'}
                </h2>
                <button
                  onClick={() => {
                    setShowSeriesModal(false)
                    setEditingSeries(null)
                    resetSeriesForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSeriesSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={seriesForm.title}
                    onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    required
                    value={seriesForm.description}
                    onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={seriesForm.image_url}
                    onChange={(e) => setSeriesForm({ ...seriesForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      required
                      value={seriesForm.start_date}
                      onChange={(e) => setSeriesForm({ ...seriesForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={seriesForm.end_date}
                      onChange={(e) => setSeriesForm({ ...seriesForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orden de Visualización
                    </label>
                    <input
                      type="number"
                      value={seriesForm.display_order}
                      onChange={(e) => setSeriesForm({ ...seriesForm, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={seriesForm.is_active}
                        onChange={(e) => setSeriesForm({ ...seriesForm, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Serie activa</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSeriesModal(false)
                      setEditingSeries(null)
                      resetSeriesForm()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    <span>{editingSeries ? 'Actualizar' : 'Crear'} Serie</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}
                </h2>
                <button
                  onClick={() => {
                    setShowResourceModal(false)
                    setEditingResource(null)
                    resetResourceForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleResourceSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Recurso *
                    </label>
                    <select
                      required
                      value={resourceForm.resource_type}
                      onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pdf">PDF</option>
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                      <option value="link">Enlace</option>
                      <option value="image">Imagen</option>
                      <option value="document">Documento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaño del Archivo (bytes)
                    </label>
                    <input
                      type="number"
                      value={resourceForm.file_size}
                      onChange={(e) => setResourceForm({ ...resourceForm, file_size: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del Archivo *
                  </label>
                  <input
                    type="url"
                    required
                    value={resourceForm.file_url}
                    onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={resourceForm.is_public}
                      onChange={(e) => setResourceForm({ ...resourceForm, is_public: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recurso público</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResourceModal(false)
                      setEditingResource(null)
                      resetResourceForm()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    <span>{editingResource ? 'Actualizar' : 'Agregar'} Recurso</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SermonManagement