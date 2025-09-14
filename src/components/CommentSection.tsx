import { useState, useEffect } from 'react';
import { MessageCircle, Reply, Edit, Trash2, Clock, User } from 'lucide-react';
import { commentService } from '../services/supabaseService';
import { Database } from '../types/supabase';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentSectionProps {
  postType: 'blog' | 'sermon' | 'event';
  postId: string;
  postTitle?: string;
  onCommentAdded?: () => void;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
}

function CommentItem({ comment, onReply, onEdit, onDelete }: CommentItemProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{comment.author_name}</h4>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatDate(comment.created_at)}</span>
                {comment.updated_at !== comment.created_at && (
                  <span className="ml-2 text-gray-400">(editado)</span>
                )}
              </div>
            </div>
            
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                {showActions && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    {canEdit && (
                      <button
                        onClick={() => {
                          onEdit(comment);
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
          
          <div className="mt-3 flex items-center space-x-4">
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Reply className="w-3 h-3 mr-1" />
              Responder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ postType, postId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    loadComments();
  }, [postType, postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentService.getCommentsByPost(postType, postId);
      setComments(data || []);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setError('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (commentId: string) => {
    // Implementación futura para responder a comentarios
  };

  const handleEdit = (comment: Comment) => {
    // Implementación futura para editar comentarios
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      setError('Error al eliminar el comentario');
    }
  };

  const handleCommentAdded = () => {
    loadComments();
    onCommentAdded?.();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando comentarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comentarios ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aún no hay comentarios. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;