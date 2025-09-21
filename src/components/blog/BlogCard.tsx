import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import { BlogPost } from '../../services/blogService';

interface BlogCardProps {
  post: BlogPost;
  showInteractions?: boolean;
  showExcerpt?: boolean;
  className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
  post, 
  showInteractions = true, 
  showExcerpt = true,
  className = '' 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min de lectura`;
  };

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {post.featured_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {post.is_featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Destacado
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        {/* Category */}
        {post.category_id && (
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              Categoría
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          <Link
            to={`/blog/${post.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {showExcerpt && post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          
          {post.author_id && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Autor</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{getReadingTime(post.content)}</span>
          </div>
        </div>

        {/* Interactions */}
        {showInteractions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.view_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.like_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comment_count || 0}</span>
              </div>
            </div>
            
            <Link
              to={`/blog/${post.slug}`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Leer más →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;