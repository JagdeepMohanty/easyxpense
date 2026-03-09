import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

export const useMonthlySummary = (months = 6) => {
  return useQuery({
    queryKey: ['analytics', 'monthly', months],
    queryFn: async () => {
      const response = await analyticsAPI.getMonthlySummary(months)
      return response.data
    },
  })
}

export const useCategoryBreakdown = () => {
  return useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: async () => {
      const response = await analyticsAPI.getCategoryBreakdown()
      return response.data
    },
  })
}
