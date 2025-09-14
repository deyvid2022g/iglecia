import React, { useState } from 'react';
import { Send, MessageCircle, User, LogIn } from 'lucide-react';
import { commentService } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

interface CommentFormProps {
  postType: 'blog' | 'sermon' | 'event';
  postId: string;
  parentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({ 
  postType, 
  postId, 
  parentId, 
  onCommentAdded, 
  onCancel,
  placeholder = "Escribe tu comentario..."
}: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Debes iniciar sesión para comentar');
      return;
    }

    if (!content.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    if (content.length > 1000) {
      setError('El comentario no puede exceder los 1000 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await commentService.createComment({
        content: content.trim(),
        author_id: user.id,
        author_name: user.user_metadata?.name || user.email || 'Usuario',
        author_email: user.email || '',
        post_type: postType,
        post_id: postId,
        parent_id: parentId
      });

      setContent('');
      onCommentAdded();
      onCancel?.();
    } catch (err) {
      console.error('Error al crear comentario:', err);
      setError('Error al enviar el comentario. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError(null);
    onCancel?.();
  };



  // Si el usuario no está autenticado, mostrar mensaje de login
  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
        <LogIn className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Inicia sesión para comentar
        </h3>
        <p className="text-gray-600 mb-4">
          Necesitas una cuenta para participar en la conversación
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="mb-3 text-sm text-gray-600">
              Comentando como <span className="font-medium">{user?.user_metadata?.name || user?.email}</span>
            </div>
            
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {content.length}/1000
              </div>
            </div>
            
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {parentId ? 'Respondiendo a un comentario' : 'Nuevo comentario'}
              </div>
              
              <div className="flex items-center space-x-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {parentId ? 'Responder' : 'Comentar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CommentForm;