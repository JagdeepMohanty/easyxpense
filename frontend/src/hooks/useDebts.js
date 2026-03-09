import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/apiClient'
import toast from 'react-hot-toast'

export const useDebts = () => {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/debts')
      return response.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useCreateSettlement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/settlements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      queryClient.invalidateQueries({ queryKey: ['settlements'] })
      toast.success('Settlement completed successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to complete settlement')
    },
  })
}

export const useSettlements = () => {
  return useQuery({
    queryKey: ['settlements'],
    queryFn: async () => {
      const response = await apiClient.get('/api/settlements')
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}
