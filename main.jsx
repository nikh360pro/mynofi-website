import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SupabaseProvider } from './SupabaseContext.js'
import './index.css'

// Error boundary component for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4"> </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                The application encountered an unexpected error. Please refresh the page to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Refresh Page
              </button>
              
              {/* Development error details */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 rounded text-xs text-red-800 font-mono overflow-auto">
                    <div className="font-bold">Error:</div>
                    <div className="mb-2">{this.state.error && this.state.error.toString()}</div>
                    <div className="font-bold">Stack Trace:</div>
                    <div>{this.state.errorInfo.componentStack}</div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading component for initial app load
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Mynofi</h2>
      <p className="text-sm text-gray-600">Connecting to services...</p>
    </div>
  </div>
)

// Main app initialization with proper error handling and providers
const initializeApp = () => {
  try {
    // Get the root element
    const rootElement = document.getElementById('root')
    
    if (!rootElement) {
      throw new Error('Root element not found. Please ensure the HTML contains a div with id="root".')
    }

    // Create React root
    const root = ReactDOM.createRoot(rootElement)

    // Render the app with all providers
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <SupabaseProvider>
            <React.Suspense fallback={<LoadingScreen />}>
              <App />
            </React.Suspense>
          </SupabaseProvider>
        </ErrorBoundary>
      </React.StrictMode>
    )

    // Development logging
    if (import.meta.env.DEV) {
      console.log('=€ Mynofi application initialized successfully')
      console.log('=' Environment:', import.meta.env.MODE)
      console.log('< Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Using fallback URL')
      console.log('= Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Using fallback key')
    }

  } catch (error) {
    console.error('Failed to initialize application:', error)
    
    // Fallback error display if React fails to mount
    document.getElementById('root').innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 400px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">=¥</div>
          <h1 style="font-size: 1.25rem; font-weight: bold; color: #111827; margin-bottom: 0.5rem;">
            Application Failed to Start
          </h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            There was a critical error initializing the application. Please check the console for details and refresh the page.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;"
          >
            Refresh Page
          </button>
          <div style="margin-top: 1rem; padding: 0.75rem; background: #fef2f2; border-radius: 4px; text-align: left; font-family: monospace; font-size: 0.75rem; color: #dc2626;">
            <strong>Error:</strong> ${error.message}
          </div>
        </div>
      </div>
    `
  }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

// Global error handlers for additional safety
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  // In development, show more details
  if (import.meta.env.DEV) {
    console.error('Promise that was rejected:', event.promise)
  }
})

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  
  // Track specific Supabase-related errors
  if (event.error && event.error.message) {
    const message = event.error.message.toLowerCase()
    if (message.includes('supabase') || message.includes('websocket') || message.includes('realtime')) {
      console.error('=4 Supabase-related error detected:', event.error)
    }
  }
})

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}