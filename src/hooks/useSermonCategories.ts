import { useState, useEffect, useCallback } from 'react';
import { sermonService, type SermonCategory, type SermonCategoryInsert, type SermonCategoryUpdate } from '../services/sermonService';

interface UseSermonCategoriesOptions {
  realtime?: boolean;
}

export const useSermonCategories = (options: UseSermonCategoriesOptions = {}) => {
  const [categories, setCategories] = useState<SermonCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sermonService.categories.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching sermon categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (category: SermonCategoryInsert) => {
    try {
      setError(null);
      const newCategory = await sermonService.categories.create(category);
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: SermonCategoryUpdate) => {
    try {
      setError(null);
      const updatedCategory = await sermonService.categories.update(id, updates);
      setCategories(prev => 
        prev.map(category => category.id === id ? updatedCategory : category)
      );
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await sermonService.categories.delete(id);
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getCategoryById = useCallback(async (id: string) => {
    try {
      setError(null);
      return await sermonService.categories.getById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getCategoryBySlug = useCallback(async (slug: string) => {
    try {
      setError(null);
      return await sermonService.categories.getBySlug(slug);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getCategoriesWithSermonCount = useCallback(() => {
    // This would require a join query or separate count queries
    // For now, return categories as-is
    return categories;
  }, [categories]);

  const getActiveCategories = useCallback(() => {
    return categories.filter(category => category.is_active);
  }, [categories]);

  const getCategoriesByParent = useCallback((parentId: string | null) => {
    return categories.filter(category => (category as any).parent_id === parentId);
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Real-time subscription
  useEffect(() => {
    if (!options.realtime) return;

    const subscription = sermonService.categories.subscribe((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          if (newRecord) {
            setCategories(prev => [newRecord, ...prev]);
          }
          break;
        case 'UPDATE':
          if (newRecord) {
            setCategories(prev => 
              prev.map(category => category.id === newRecord.id ? newRecord : category)
            );
          }
          break;
        case 'DELETE':
          if (oldRecord) {
            setCategories(prev => prev.filter(category => category.id !== oldRecord.id));
          }
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [options.realtime]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryBySlug,
    getCategoriesWithSermonCount,
    getActiveCategories,
    getCategoriesByParent
  };
};

export default useSermonCategories;