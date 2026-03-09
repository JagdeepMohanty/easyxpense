import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/apiClient'
import toast from 'react-hot-toast'

export const useExpenses = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['expenses', page, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/expenses?page=${page}&limit=${limit}`)
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      toast.success('Expense added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add expense')
    },
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/api/v1/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      toast.success('Expense deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete expense')
    },
  })
}
