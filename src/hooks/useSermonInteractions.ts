import { useState, useEffect, useCallback } from 'react';
import { sermonService, type SermonInteraction, type SermonInteractionInsert } from '../services/sermonService';

interface UseSermonInteractionsOptions {
  sermonId: string;
  userId?: string;
  type?: string;
  realtime?: boolean;
}

export const useSermonInteractions = (options: UseSermonInteractionsOptions) => {
  const [interactions, setInteractions] = useState<SermonInteraction[]>([]);
  const [userInteractions, setUserInteractions] = useState<Record<string, SermonInteraction>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sermonService.interactions.getBySermonId(options.sermonId, options.type);
      setInteractions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching interactions');
    } finally {
      setLoading(false);
    }
  }, [options.sermonId, options.type]);

  const fetchUserInteractions = useCallback(async () => {
    if (!options.userId) return;

    try {
      const types = ['like', 'comment', 'view', 'favorite', 'share'];
      const userInteractionsMap: Record<string, SermonInteraction> = {};
      
      for (const type of types) {
        try {
          const interaction = await sermonService.interactions.getUserInteraction(
            options.sermonId, 
            options.userId, 
            type
          );
          if (interaction) {
            userInteractionsMap[type] = interaction;
          }
        } catch (err) {
          // Ignore errors for individual interactions
        }
      }
      
      setUserInteractions(userInteractionsMap);
    } catch (err) {
      console.error('Error fetching user interactions:', err);
    }
  }, [options.sermonId, options.userId]);

  const createInteraction = useCallback(async (interaction: SermonInteractionInsert) => {
    try {
      setError(null);
      const newInteraction = await sermonService.interactions.create(interaction);
      setInteractions(prev => [newInteraction, ...prev]);
      
      // Update user interactions if it's for the current user
      if (options.userId && interaction.user_id === options.userId) {
        setUserInteractions(prev => ({
          ...prev,
          [interaction.type]: newInteraction
        }));
      }
      
      return newInteraction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating interaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [options.userId]);

  const deleteInteraction = useCallback(async (id: string, type: string) => {
    try {
      setError(null);
      await sermonService.interactions.delete(id);
      setInteractions(prev => prev.filter(interaction => interaction.id !== id));
      
      // Update user interactions if it's for the current user
      if (options.userId) {
        setUserInteractions(prev => {
          const updated = { ...prev };
          delete updated[type];
          return updated;
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting interaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [options.userId]);

  const toggleLike = useCallback(async () => {
    if (!options.userId) {
      throw new Error('User must be logged in to like sermons');
    }

    try {
      setError(null);
      const result = await sermonService.interactions.toggleLike(options.sermonId, options.userId);
      
      if (result.liked) {
        // Fetch the new like interaction
        const likeInteraction = await sermonService.interactions.getUserInteraction(
          options.sermonId, 
          options.userId, 
          'like'
        );
        if (likeInteraction) {
          setUserInteractions(prev => ({
            ...prev,
            like: likeInteraction
          }));
          setInteractions(prev => [likeInteraction, ...prev]);
        }
      } else {
        // Remove like from user interactions and interactions list
        setUserInteractions(prev => {
          const updated = { ...prev };
          delete updated.like;
          return updated;
        });
        setInteractions(prev => 
          prev.filter(interaction => 
            !(interaction.type === 'like' && interaction.user_id === options.userId)
          )
        );
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error toggling like';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [options.sermonId, options.userId]);

  const toggleFavorite = useCallback(async () => {
    if (!options.userId) {
      throw new Error('User must be logged in to favorite sermons');
    }

    try {
      setError(null);
      const result = await sermonService.interactions.toggleFavorite(options.sermonId, options.userId);
      
      if (result.favorited) {
        // Fetch the new favorite interaction
        const favoriteInteraction = await sermonService.interactions.getUserInteraction(
          options.sermonId, 
          options.userId, 
          'favorite'
        );
        if (favoriteInteraction) {
          setUserInteractions(prev => ({
            ...prev,
            favorite: favoriteInteraction
          }));
          setInteractions(prev => [favoriteInteraction, ...prev]);
        }
      } else {
        // Remove favorite from user interactions and interactions list
        setUserInteractions(prev => {
          const updated = { ...prev };
          delete updated.favorite;
          return updated;
        });
        setInteractions(prev => 
          prev.filter(interaction => 
            !(interaction.type === 'favorite' && interaction.user_id === options.userId)
          )
        );
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error toggling favorite';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [options.sermonId, options.userId]);

  const addComment = useCallback(async (content: string) => {
    if (!options.userId) {
      throw new Error('User must be logged in to comment');
    }

    try {
      setError(null);
      const comment = await sermonService.interactions.addComment(
        options.sermonId, 
        options.userId, 
        content
      );
      setInteractions(prev => [comment, ...prev]);
      return comment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding comment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [options.sermonId, options.userId]);

  const shareSermon = useCallback(async (platform?: string) => {
    if (!options.userId) {
      throw new Error('User must be logged in to share sermons');
    }

    try {
      setError(null);
      // Create a share interaction directly since shareSermon method doesn't exist
      const share = await sermonService.interactions.create({
        sermon_id: options.sermonId,
        user_id: options.userId,
        type: 'share',
        content: platform || 'general'
      });
      setInteractions(prev => [share, ...prev]);
      return share;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sharing sermon';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [options.sermonId, options.userId]);

  const getComments = useCallback(() => {
    return interactions.filter(interaction => interaction.type === 'comment');
  }, [interactions]);

  const getLikes = useCallback(() => {
    return interactions.filter(interaction => interaction.type === 'like');
  }, [interactions]);

  const getFavorites = useCallback(() => {
    return interactions.filter(interaction => interaction.type === 'favorite');
  }, [interactions]);

  const getShares = useCallback(() => {
    return interactions.filter(interaction => interaction.type === 'share');
  }, [interactions]);

  const getLikeCount = useCallback(() => {
    return getLikes().length;
  }, [getLikes]);

  const getCommentCount = useCallback(() => {
    return getComments().length;
  }, [getComments]);

  const getFavoriteCount = useCallback(() => {
    return getFavorites().length;
  }, [getFavorites]);

  const getShareCount = useCallback(() => {
    return getShares().length;
  }, [getShares]);

  const isLikedByUser = useCallback(() => {
    return !!userInteractions.like;
  }, [userInteractions.like]);

  const isFavoritedByUser = useCallback(() => {
    return !!userInteractions.favorite;
  }, [userInteractions.favorite]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  useEffect(() => {
    fetchUserInteractions();
  }, [fetchUserInteractions]);

  // Real-time subscription
  useEffect(() => {
    if (!options.realtime) return;

    const subscription = sermonService.interactions.subscribe(options.sermonId, (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          if (newRecord) {
            setInteractions(prev => [newRecord, ...prev]);
            
            // Update user interactions if it's for the current user
            if (options.userId && newRecord.user_id === options.userId) {
              setUserInteractions(prev => ({
                ...prev,
                [newRecord.type]: newRecord
              }));
            }
          }
          break;
        case 'UPDATE':
          if (newRecord) {
            setInteractions(prev => 
              prev.map(interaction => 
                interaction.id === newRecord.id ? newRecord : interaction
              )
            );
            
            // Update user interactions if it's for the current user
            if (options.userId && newRecord.user_id === options.userId) {
              setUserInteractions(prev => ({
                ...prev,
                [newRecord.type]: newRecord
              }));
            }
          }
          break;
        case 'DELETE':
          if (oldRecord) {
            setInteractions(prev => 
              prev.filter(interaction => interaction.id !== oldRecord.id)
            );
            
            // Update user interactions if it's for the current user
            if (options.userId && oldRecord.user_id === options.userId) {
              setUserInteractions(prev => {
                const updated = { ...prev };
                delete updated[oldRecord.type];
                return updated;
              });
            }
          }
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [options.realtime, options.sermonId, options.userId]);

  return {
    interactions,
    userInteractions,
    loading,
    error,
    refetch: fetchInteractions,
    createInteraction,
    deleteInteraction,
    toggleLike,
    toggleFavorite,
    addComment,
    shareSermon,
    getComments,
    getLikes,
    getFavorites,
    getShares,
    getLikeCount,
    getCommentCount,
    getFavoriteCount,
    getShareCount,
    isLikedByUser,
    isFavoritedByUser
  };
};

export default useSermonInteractions;