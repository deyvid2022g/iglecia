import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Search, Play, Download } from 'lucide-react';
import { Database } from '../../types/database';
import { sermonsService } from '../../services/sermonService';
import { SermonForm } from '../sermons/SermonForm';

type Sermon = Database['public']['Tables']['sermons']['Row'];

interface SermonsAdminProps {
  className?: string;
  onClose?: () => void;
}

export const SermonsAdmin: React.FC<SermonsAdminProps> = ({ className = '' }) => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSermonForm, setShowSermonForm] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const data = await sermonsService.getAll(1, 100); // Get more sermons for admin
      setSermons(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sermones');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSermon = async (sermonId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este sermón?')) {
      try {
        await sermonsService.delete(sermonId);
        fetchSermons(); // Refresh the list
      } catch (error) {
        console.error('Error deleting sermon:', error);
        alert('Error al eliminar el sermón');
      }
    }
  };

  const handleTogglePublished = async (sermon: Sermon) => {
    try {
      await sermonsService.update(sermon.id, { is_published: !sermon.is_published });
      fetchSermons(); // Refresh the list
    } catch (error) {
      console.error('Error updating sermon:', error);
      alert('Error al actualizar el sermón');
    }
  };

  const handleToggleFeatured = async (sermon: Sermon) => {
    try {
      await sermonsService.update(sermon.id, { is_featured: !sermon.is_featured });
      fetchSermons(); // Refresh the list
    } catch (error) {
      console.error('Error updating sermon:', error);
      alert('Error al actualizar el sermón');
    }
  };

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sermon.description && sermon.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && sermon.is_published) ||
                         (filterStatus === 'draft' && !sermon.is_published);
    
    return matchesSearch && matchesStatus;
  });

  const handleEditSermon = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setShowSermonForm(true);
  };

  const handleCloseForm = () => {
    setShowSermonForm(false);
    setEditingSermon(null);
    fetchSermons(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (showSermonForm) {
    return (
      <SermonForm
        sermonId={editingSermon?.id}
        onClose={handleCloseForm}
        onSave={handleCloseForm}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administración de Sermones</h2>
          <p className="text-gray-600">Gestiona los sermones de la iglesia</p>
        </div>
        <button
          onClick={() => setShowSermonForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Sermón
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar sermones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>

          {/* Stats */}
          <div className="flex items-center justify-end space-x-4 text-sm text-gray-600">
            <span>Total: {filteredSermons.length}</span>
            <span>Publicados: {filteredSermons.filter(s => s.is_published).length}</span>
          </div>
        </div>
      </div>

      {/* Sermons List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredSermons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron sermones</p>
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
                    Vistas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSermons.map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {sermon.thumbnail_url && (
                          <img
                            src={sermon.thumbnail_url}
                            alt={sermon.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {sermon.title}
                          </p>
                          {sermon.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {sermon.description.substring(0, 100)}...
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            {sermon.audio_url && (
                              <div title="Tiene audio">
                                <Play className="w-4 h-4 text-green-500" />
                              </div>
                            )}
                            {sermon.video_url && (
                              <div title="Tiene video">
                                <Eye className="w-4 h-4 text-blue-500" />
                              </div>
                            )}
                            {sermon.has_transcript && (
                              <div title="Tiene transcripción">
                                <Download className="w-4 h-4 text-purple-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sermon.speaker}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(sermon.sermon_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sermon.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sermon.is_published ? 'Publicado' : 'Borrador'}
                        </span>
                        {sermon.is_featured && (
                          <div title="Destacado">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sermon.view_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSermon(sermon)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar sermón"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublished(sermon)}
                          className={`${sermon.is_published ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          title={sermon.is_published ? 'Despublicar' : 'Publicar'}
                        >
                          {sermon.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(sermon)}
                          className={`${sermon.is_featured ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-400 hover:text-yellow-600'}`}
                          title={sermon.is_featured ? 'Quitar destacado' : 'Destacar'}
                        >
                          {sermon.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSermon(sermon.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar sermón"
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
  );
};