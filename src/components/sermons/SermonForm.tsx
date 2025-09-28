import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, Tag, Image, Globe, BookOpen, Clock } from 'lucide-react';
import { sermonService, type SermonInsert, type SermonCategory } from '../../services/sermonService';

interface SermonFormProps {
  onClose: () => void;
  onSave?: (sermon: any) => void;
  sermonId?: string;
}

export const SermonForm: React.FC<SermonFormProps> = ({ onClose, onSave, sermonId }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<SermonCategory[]>([]);
  const [formData, setFormData] = useState<SermonInsert>({
    title: '',
    description: '',
    speaker: '',
    sermon_date: '',
    duration: 30,
    scripture_references: [],
    series_id: '',
    audio_url: '',
    video_url: '',
    transcript: '',
    notes: '',
    is_featured: false,
    is_published: true,
    tags: []
  });

  useEffect(() => {
    loadCategories();
    if (sermonId) {
      loadSermon();
    }
  }, [sermonId]);

  const loadCategories = async () => {
    try {
      const categoriesData = await sermonService.categories.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSermon = async () => {
    if (!sermonId) return;
    
    try {
      setLoading(true);
      const { data: sermon, error } = await sermonService.sermons.getById(sermonId);
      
      if (error) {
        console.error('Error loading sermon:', error);
        return;
      }

      if (sermon) {
        setFormData({
          title: sermon.title,
          description: sermon.description || '',
          speaker: sermon.speaker,
          sermon_date: sermon.sermon_date,
          duration: sermon.duration || 30,
          scripture_references: sermon.scripture_references || [],
          category_id: sermon.category_id || '',
          audio_url: sermon.audio_url || '',
          video_url: sermon.video_url || '',
          transcript: sermon.transcript || '',
          notes: sermon.notes || '',
          is_featured: sermon.is_featured || false,
          is_published: sermon.is_published || true,
          tags: sermon.tags || []
        });
      }
    } catch (error) {
      console.error('Error loading sermon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Generar slug automáticamente
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const sermonData = {
        ...formData,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let result;
      if (sermonId) {
        result = await sermonService.sermons.update(sermonId, sermonData);
      } else {
        result = await sermonService.sermons.create(sermonData);
      }

      if (result.error) {
        console.error('Error saving sermon:', result.error);
        alert('Error al guardar el sermón. Por favor, intenta de nuevo.');
        return;
      }

      if (onSave && result.data) {
        onSave(result.data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving sermon:', error);
      alert('Error al guardar el sermón. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {sermonId ? 'Editar Sermón' : 'Agregar Nuevo Sermón'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Título del Sermón *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: El Amor de Dios, La Fe que Mueve Montañas..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve descripción del sermón, tema principal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Predicador *
              </label>
              <input
                type="text"
                name="speaker"
                value={formData.speaker}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del predicador"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha del Sermón *
              </label>
              <input
                type="date"
                name="sermon_date"
                value={formData.sermon_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duración (minutos)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Referencia Bíblica
              </label>
              <input
                type="text"
                name="scripture_references"
                value={Array.isArray(formData.scripture_references) ? formData.scripture_references.join(', ') : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scripture_references: e.target.value.split(',').map(ref => ref.trim()).filter(ref => ref)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Juan 3:16, Salmos 23, Mateo 5:1-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                URL de Audio
              </label>
              <input
                type="url"
                name="audio_url"
                value={formData.audio_url || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/audio.mp3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                URL de Video
              </label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas (separadas por comas)
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={handleTagsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="fe, esperanza, amor, salvación"
              />
            </div>
          </div>

          {/* Contenido adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contenido Adicional</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transcripción
              </label>
              <textarea
                name="transcript"
                value={formData.transcript || ''}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transcripción completa del sermón..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Sermón
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Puntos principales, aplicaciones, referencias adicionales..."
              />
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Opciones del Sermón</h3>
            
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Sermón destacado</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Publicar sermón</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (sermonId ? 'Actualizar Sermón' : 'Agregar Sermón')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};