import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Heart, MessageCircle, Play, Clock, BookOpen } from 'lucide-react';
import { Sermon } from '../../services/sermonService';

interface SermonCardProps {
  sermon: Sermon;
  showInteractions?: boolean;
  showDescription?: boolean;
  className?: string;
}

export const SermonCard: React.FC<SermonCardProps> = ({ 
  sermon, 
  showInteractions = true, 
  showDescription = true,
  className = '' 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMediaIcon = () => {
    if (sermon.video_url) return <Play className="w-4 h-4" />;
    if (sermon.audio_url) return <Play className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  const getMediaType = () => {
    if (sermon.video_url) return 'Video';
    if (sermon.audio_url) return 'Audio';
    return 'Texto';
  };

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {sermon.thumbnail_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={sermon.thumbnail_url}
            alt={sermon.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              {getMediaIcon()}
            </div>
          </div>
          {sermon.is_featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Destacado
              </span>
            </div>
          )}
          {sermon.duration && (
            <div className="absolute bottom-4 right-4">
              <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {formatDuration(sermon.duration)}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        {/* Category */}
        {sermon.category_id && (
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              Categoría
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          <Link
            to={`/sermones/${sermon.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {sermon.title}
          </Link>
        </h2>

        {/* Description */}
        {showDescription && sermon.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {sermon.description}
          </p>
        )}

        {/* Scripture Reference */}
        {sermon.scripture_references && sermon.scripture_references.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">{sermon.scripture_references.join(', ')}</span>
            </div>
          </div>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(sermon.sermon_date || sermon.created_at)}</span>
          </div>
          
          {sermon.speaker && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{sermon.speaker}</span>
              </div>
            )}
          
          <div className="flex items-center gap-1">
            {getMediaIcon()}
            <span>{getMediaType()}</span>
          </div>

          {sermon.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(sermon.duration)}</span>
            </div>
          )}
        </div>

        {/* Series Information */}
        {sermon.tags && sermon.tags.length > 0 && (
          <div className="mb-4">
            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Serie: {sermon.tags[0]}
            </span>
          </div>
        )}

        {/* Interactions */}
        {showInteractions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{sermon.view_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{sermon.like_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{sermon.comment_count || 0}</span>
              </div>
            </div>
            
            <Link
              to={`/sermones/${sermon.slug}`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              {sermon.video_url || sermon.audio_url ? 'Ver/Escuchar' : 'Leer'} →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default SermonCard;