import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/apiClient'

export const useMonthlySummary = (months = 6) => {
  return useQuery({
    queryKey: ['analytics', 'monthly', months],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/analytics/monthly?months=${months}`)
      return response.data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export const useCategoryBreakdown = () => {
  return useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/analytics/categories')
      return response.data
    },
    staleTime: 1000 * 60 * 10,
  })
}
