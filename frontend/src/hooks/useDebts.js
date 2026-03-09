import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { debtsAPI, settlementsAPI } from '../services/api'

export const useDebts = () => {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const response = await debtsAPI.getAll()
      return response.data
    },
  })
}

export const useCreateSettlement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => settlementsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      queryClient.invalidateQueries({ queryKey: ['settlements'] })
    },
  })
}

export const useSettlements = () => {
  return useQuery({
    queryKey: ['settlements'],
    queryFn: async () => {
      const response = await settlementsAPI.getHistory()
      return response.data
    },
  })
}
