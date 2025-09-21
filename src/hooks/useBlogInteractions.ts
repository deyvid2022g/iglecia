import { useState, useEffect, useCallback } from 'react';
import { blogService, type BlogInteraction, type BlogInteractionInsert } from '../services/blogService';

interface UseBlogInteractionsOptions {
  postId: string;
  userId?: string;
  type?: string;
  realtime?: boolean;
}

export const useBlogInteractions = (options: UseBlogInteractionsOptions) => {
  const [interactions, setInteractions] = useState<BlogInteraction[]>([]);
  const [userInteractions, setUserInteractions] = useState<Record<string, BlogInteraction>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogService.interactions.getByPostId(options.postId, options.type);
      setInteractions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching interactions');
    } finally {
      setLoading(false);
    }
  }, [options.postId, options.type]);

  const fetchUserInteractions = useCallback(async () => {
    if (!options.userId) return;

    try {
      const types = ['like', 'comment', 'view'];
      const userInteractionsMap: Record<string, BlogInteraction> = {};
      
      for (const type of types) {
        try {
          const interaction = await blogService.interactions.getUserInteraction(
            options.postId, 
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
  }, [options.postId, options.userId]);

  const createInteraction = useCallback(async (interaction: BlogInteractionInsert) => {
    try {
      setError(null);
      const newInteraction = await blogService.interactions.create(interaction);
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
      await blogService.interactions.delete(id);
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
      throw new Error('User must be logged in to like posts');
    }

    try {
      setError(null);
      const result = await blogService.interactions.toggleLike(options.postId, options.userId);
      
      if (result.liked) {
        // Fetch the new like interaction
        const likeInteraction = await blogService.interactions.getUserInteraction(
          options.postId, 
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
  }, [options.postId, options.userId]);

  const addComment = useCallback(async (content: string) => {
    if (!options.userId) {
      throw new Error('User must be logged in to comment');
    }

    try {
      setError(null);
      const comment = await blogService.interactions.addComment(
        options.postId, 
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
  }, [options.postId, options.userId]);

  const getComments = useCallback(() => {
    return interactions.filter(interaction => interaction.type === 'comment');
  }, [interactions]);

  const getLikes = useCallback(() => {
    return interactions.filter(interaction => interaction.type === 'like');
  }, [interactions]);

  const getLikeCount = useCallback(() => {
    return getLikes().length;
  }, [getLikes]);

  const getCommentCount = useCallback(() => {
    return getComments().length;
  }, [getComments]);

  const isLikedByUser = useCallback(() => {
    return !!userInteractions.like;
  }, [userInteractions.like]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  useEffect(() => {
    fetchUserInteractions();
  }, [fetchUserInteractions]);

  // Real-time subscription
  useEffect(() => {
    if (!options.realtime) return;

    const subscription = blogService.interactions.subscribe(options.postId, (payload) => {
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
  }, [options.realtime, options.postId, options.userId]);

  return {
    interactions,
    userInteractions,
    loading,
    error,
    refetch: fetchInteractions,
    createInteraction,
    deleteInteraction,
    toggleLike,
    addComment,
    getComments,
    getLikes,
    getLikeCount,
    getCommentCount,
    isLikedByUser
  };
};

export default useBlogInteractions;