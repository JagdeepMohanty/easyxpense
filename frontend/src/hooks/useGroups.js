import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsAPI } from '../services/api'

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await groupsAPI.getAll()
      return response.data
    },
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => groupsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => groupsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
