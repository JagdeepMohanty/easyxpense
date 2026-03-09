import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/apiClient'
import toast from 'react-hot-toast'

export const useFriends = (search = '', page = 1, limit = 100) => {
  return useQuery({
    queryKey: ['friends', search, page, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/friends?search=${search}&page=${page}&limit=${limit}`)
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useCreateFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/friends', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      toast.success('Friend added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add friend')
    },
  })
}

export const useUpdateFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/api/v1/friends/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      toast.success('Friend updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update friend')
    },
  })
}

export const useDeleteFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/api/v1/friends/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      toast.success('Friend deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete friend')
    },
  })
}
