import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Eye } from 'lucide-react';

interface InteractionButtonsProps {
  itemId: string;
  itemType: 'blog' | 'event' | 'sermon';
  likes: number;
  comments: number;
  views?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  isInterested?: boolean;
  isGoing?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
  onInterested?: () => void;
  onGoing?: () => void;
  showViews?: boolean;
  showFavorite?: boolean;
  showEventActions?: boolean;
  className?: string;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  itemId,
  itemType,
  likes,
  comments,
  views,
  isLiked = false,
  isFavorited = false,
  isInterested = false,
  isGoing = false,
  onLike,
  onComment,
  onShare,
  onFavorite,
  onInterested,
  onGoing,
  showViews = true,
  showFavorite = false,
  showEventActions = false,
  className = ''
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    setIsSharing(true);
    
    try {
      const url = window.location.href;
      const title = document.title;
      
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        // You might want to show a toast notification here
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Views */}
      {showViews && views !== undefined && (
        <div className="flex items-center gap-1 text-gray-500">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{views}</span>
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={onLike}
        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
          isLiked
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
        }`}
        disabled={!onLike}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm">{likes}</span>
      </button>

      {/* Comment Button */}
      <button
        onClick={onComment}
        className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        disabled={!onComment}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">{comments}</span>
      </button>

      {/* Event-specific actions */}
      {showEventActions && itemType === 'event' && (
        <>
          {/* Interested Button */}
          <button
            onClick={onInterested}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              isInterested
                ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
            }`}
            disabled={!onInterested}
          >
            Interesado
          </button>

          {/* Going Button */}
          <button
            onClick={onGoing}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              isGoing
                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
            disabled={!onGoing}
          >
            Asistiré
          </button>
        </>
      )}

      {/* Favorite Button */}
      {showFavorite && (
        <button
          onClick={onFavorite}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
            isFavorited
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          }`}
          disabled={!onFavorite}
        >
          <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm">{isSharing ? 'Compartiendo...' : 'Compartir'}</span>
      </button>
    </div>
  );
};

export default InteractionButtons;