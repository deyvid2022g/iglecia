import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/SupabaseAuthContext'

export interface EventLike {
  id: string
  event_id: string
  user_id: string | null
  user_email?: string
  user_name?: string
  created_at: string
}

export interface EventComment {
  id: string
  event_id: string
  user_id: string | null
  user_email?: string
  user_name?: string
  comment: string
  created_at: string
  updated_at: string
}

export interface EventInteractionsState {
  likes: Record<string, EventLike[]>
  comments: Record<string, EventComment[]>
  loading: boolean
  error: string | null
}

export interface EventInteractionsActions {
  toggleLike: (eventId: string) => Promise<{ success: boolean; error?: string }>
  addComment: (eventId: string, comment: string) => Promise<{ success: boolean; error?: string }>
  deleteComment: (commentId: string) => Promise<{ success: boolean; error?: string }>
  getLikesCount: (eventId: string) => number
  getCommentsCount: (eventId: string) => number
  getComments: (eventId: string) => EventComment[]
  hasUserLiked: (eventId: string) => boolean
  refreshInteractions: () => Promise<void>
}

export const useEventInteractions = (): EventInteractionsState & EventInteractionsActions => {
  const [likes, setLikes] = useState<Record<string, EventLike[]>>({})
  const [comments, setComments] = useState<Record<string, EventComment[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Cargar interacciones desde localStorage
  const loadInteractions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar likes
      const storedLikes = localStorage.getItem('event_likes')
      if (storedLikes) {
        const parsedLikes = JSON.parse(storedLikes)
        setLikes(parsedLikes)
      }

      // Cargar comentarios
      const storedComments = localStorage.getItem('event_comments')
      if (storedComments) {
        const parsedComments = JSON.parse(storedComments)
        setComments(parsedComments)
      }
    } catch (error) {
      setError('Error al cargar interacciones')
      console.error('Error loading interactions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInteractions()
  }, [loadInteractions])

  // Función para alternar like
  const toggleLike = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes iniciar sesión para dar like' }
      }

      const currentLikes = likes[eventId] || []
      const existingLikeIndex = currentLikes.findIndex(like => 
        like.user_id === user.id || like.user_email === user.email
      )

      let updatedLikes: EventLike[]

      if (existingLikeIndex >= 0) {
        // Remover like existente
        updatedLikes = currentLikes.filter((_, index) => index !== existingLikeIndex)
      } else {
        // Agregar nuevo like
        const newLike: EventLike = {
          id: Date.now().toString(),
          event_id: eventId,
          user_id: user.id,
          user_email: user.email,
          user_name: user.full_name || user.email?.split('@')[0] || 'Usuario',
          created_at: new Date().toISOString()
        }
        updatedLikes = [...currentLikes, newLike]
      }

      // Actualizar estado
      const newLikesState = { ...likes, [eventId]: updatedLikes }
      setLikes(newLikesState)

      // Guardar en localStorage
      localStorage.setItem('event_likes', JSON.stringify(newLikesState))

      return { success: true }
    } catch (error) {
      console.error('Error toggling like:', error)
      return { success: false, error: 'Error al procesar el like' }
    }
  }

  // Función para agregar comentario
  const addComment = async (eventId: string, comment: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes iniciar sesión para comentar' }
      }

      if (!comment.trim()) {
        return { success: false, error: 'El comentario no puede estar vacío' }
      }

      const newComment: EventComment = {
        id: Date.now().toString(),
        event_id: eventId,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || user.email?.split('@')[0] || 'Usuario',
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const currentComments = comments[eventId] || []
      const updatedComments = [...currentComments, newComment]

      // Actualizar estado
      const newCommentsState = { ...comments, [eventId]: updatedComments }
      setComments(newCommentsState)

      // Guardar en localStorage
      localStorage.setItem('event_comments', JSON.stringify(newCommentsState))

      return { success: true }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: 'Error al agregar comentario' }
    }
  }

  // Función para eliminar comentario
  const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes iniciar sesión para eliminar comentarios' }
      }

      // Buscar el comentario en todos los eventos
      let eventId: string | null = null
      let commentToDelete: EventComment | null = null

      for (const [eId, eventComments] of Object.entries(comments)) {
        const comment = eventComments.find(c => c.id === commentId)
        if (comment) {
          eventId = eId
          commentToDelete = comment
          break
        }
      }

      if (!eventId || !commentToDelete) {
        return { success: false, error: 'Comentario no encontrado' }
      }

      // Verificar que el usuario puede eliminar el comentario
      if (commentToDelete.user_id !== user.id && commentToDelete.user_email !== user.email) {
        return { success: false, error: 'No tienes permisos para eliminar este comentario' }
      }

      // Eliminar comentario
      const updatedComments = comments[eventId].filter(c => c.id !== commentId)
      const newCommentsState = { ...comments, [eventId]: updatedComments }
      setComments(newCommentsState)

      // Guardar en localStorage
      localStorage.setItem('event_comments', JSON.stringify(newCommentsState))

      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: 'Error al eliminar comentario' }
    }
  }

  // Función para obtener cantidad de likes
  const getLikesCount = (eventId: string): number => {
    return likes[eventId]?.length || 0
  }

  // Función para obtener cantidad de comentarios
  const getCommentsCount = (eventId: string): number => {
    return comments[eventId]?.length || 0
  }

  // Función para obtener comentarios de un evento
  const getComments = (eventId: string): EventComment[] => {
    return comments[eventId] || []
  }

  // Función para verificar si el usuario ha dado like
  const hasUserLiked = (eventId: string): boolean => {
    if (!user) return false
    const eventLikes = likes[eventId] || []
    return eventLikes.some(like => 
      like.user_id === user.id || like.user_email === user.email
    )
  }

  // Función para refrescar interacciones
  const refreshInteractions = async (): Promise<void> => {
    await loadInteractions()
  }

  return {
    likes,
    comments,
    loading,
    error,
    toggleLike,
    addComment,
    deleteComment,
    getLikesCount,
    getCommentsCount,
    getComments,
    hasUserLiked,
    refreshInteractions
  }
}