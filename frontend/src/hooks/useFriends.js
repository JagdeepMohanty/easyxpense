import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { friendsAPI } from '../services/api'

export const useFriends = (search = '', page = 1, limit = 100) => {
  return useQuery({
    queryKey: ['friends', search, page, limit],
    queryFn: async () => {
      const response = await friendsAPI.getAll(search, page, limit)
      return response.data
    },
  })
}

export const useCreateFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => friendsAPI.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export const useUpdateFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => friendsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export const useDeleteFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => friendsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}
