import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesAPI } from '../services/api'

export const useExpenses = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['expenses', page, limit],
    queryFn: async () => {
      const response = await expensesAPI.getAll('', page, limit)
      return response.data
    },
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => expensesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    },
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => expensesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    },
  })
}
