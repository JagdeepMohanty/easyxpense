import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function ErrorFallback({ error }) {
  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-6">
      <div className="bg-card rounded-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
        <p className="text-text-muted mb-6">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary hover:bg-accent text-white rounded-lg font-medium transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0F172A',
              color: '#E2E8F0',
              border: '1px solid #1E293B',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#E2E8F0',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#E2E8F0',
              },
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)