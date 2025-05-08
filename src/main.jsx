import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx'
import './index.css' // Make sure Tailwind directives are in here

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Typically for localStorage, data doesn't become stale automatically
      // unless we change it. Adjust based on need.
      staleTime: Infinity,
      cacheTime: Infinity, // Keep data in cache indefinitely
      refetchOnWindowFocus: false, // Don't refetch just because window got focus
      retry: false, // Don't retry automatically on error for localStorage reads
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
