import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, auth, realtime, healthCheck } from './supabaseClient.js'

// Create the Supabase context
const SupabaseContext = createContext({
  // Authentication state
  user: null,
  session: null,
  loading: true,
  
  // Connection state
  isConnected: false,
  connectionStatus: 'disconnected',
  lastError: null,
  
  // Auth methods
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  
  // Connection methods
  checkHealth: () => {},
  reconnect: () => {},
  
  // Supabase client access
  supabase: null,
})

// Custom hook to use the Supabase context
export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

// Connection status constants
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting'
}

// Supabase Provider component
export const SupabaseProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATES.DISCONNECTED)
  const [lastError, setLastError] = useState(null)
  
  // Retry mechanism state
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(5)

  // Initialize authentication state
  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const currentSession = await auth.getSession()
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLastError(error)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    return () => {
      mounted = false
    }
  }, [])

  // Listen to authentication state changes
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Clear any auth-related errors on successful auth
        if (session && lastError?.message?.includes('auth')) {
          setLastError(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [lastError])

  // Monitor real-time connection status
  useEffect(() => {
    const unsubscribe = realtime.onConnectionChange(({ status, error }) => {
      setIsConnected(status === 'connected')
      setConnectionStatus(status)
      
      if (error) {
        setLastError(error)
        console.error('Real-time connection error:', error)
      } else if (status === 'connected') {
        setLastError(null)
        setRetryCount(0)
        console.log(' Real-time connection established')
      }
    })

    // Check initial connection status
    setIsConnected(realtime.isConnected())
    setConnectionStatus(realtime.isConnected() ? CONNECTION_STATES.CONNECTED : CONNECTION_STATES.DISCONNECTED)

    return unsubscribe
  }, [])

  // Auto-retry connection on failure
  useEffect(() => {
    if (!isConnected && connectionStatus === CONNECTION_STATES.ERROR && retryCount < maxRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000) // Exponential backoff, max 30s
      
      console.log(`Retrying connection in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`)
      setConnectionStatus(CONNECTION_STATES.RECONNECTING)
      
      const retryTimer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        reconnect()
      }, retryDelay)

      return () => clearTimeout(retryTimer)
    }
  }, [isConnected, connectionStatus, retryCount, maxRetries])

  // Authentication methods
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true)
      setLastError(null)
      
      const result = await auth.signIn(email, password)
      return result
    } catch (error) {
      setLastError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      setLastError(null)
      
      const result = await auth.signUp(email, password, metadata)
      return result
    } catch (error) {
      setLastError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setLastError(null)
      
      await auth.signOut()
    } catch (error) {
      setLastError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Connection methods
  const checkHealth = useCallback(async () => {
    try {
      const health = await healthCheck()
      return health
    } catch (error) {
      setLastError(error)
      throw error
    }
  }, [])

  const reconnect = useCallback(() => {
    try {
      setConnectionStatus(CONNECTION_STATES.CONNECTING)
      setLastError(null)
      
      // Force reconnect by removing and re-adding channels
      const channels = supabase.getChannels()
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
      
      // Reconnect will happen automatically
      console.log('= Attempting to reconnect to Supabase...')
    } catch (error) {
      setLastError(error)
      setConnectionStatus(CONNECTION_STATES.ERROR)
    }
  }, [])

  // Error boundary for Supabase operations
  const withErrorHandling = useCallback((operation) => {
    return async (...args) => {
      try {
        return await operation(...args)
      } catch (error) {
        setLastError(error)
        console.error('Supabase operation error:', error)
        throw error
      }
    }
  }, [])

  // Enhanced Supabase client with error handling
  const enhancedSupabase = {
    ...supabase,
    // Wrap database operations with error handling
    from: (table) => {
      const originalFrom = supabase.from(table)
      return {
        ...originalFrom,
        select: withErrorHandling(originalFrom.select.bind(originalFrom)),
        insert: withErrorHandling(originalFrom.insert.bind(originalFrom)),
        update: withErrorHandling(originalFrom.update.bind(originalFrom)),
        upsert: withErrorHandling(originalFrom.upsert.bind(originalFrom)),
        delete: withErrorHandling(originalFrom.delete.bind(originalFrom))
      }
    }
  }

  // Context value
  const value = {
    // Authentication state
    user,
    session,
    loading,
    
    // Connection state
    isConnected,
    connectionStatus,
    lastError,
    retryCount,
    maxRetries,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    
    // Connection methods
    checkHealth,
    reconnect,
    
    // Supabase client access
    supabase: enhancedSupabase,
    
    // Helper methods
    clearError: () => setLastError(null),
    isAuthenticated: !!user,
    isHealthy: isConnected && !lastError,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Connection status indicator component
export const ConnectionStatus = ({ className = '', showDetails = false }) => {
  const { isConnected, connectionStatus, lastError, retryCount, maxRetries, reconnect } = useSupabase()
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case CONNECTION_STATES.CONNECTED:
        return 'text-green-600'
      case CONNECTION_STATES.CONNECTING:
      case CONNECTION_STATES.RECONNECTING:
        return 'text-yellow-600'
      case CONNECTION_STATES.ERROR:
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case CONNECTION_STATES.CONNECTED:
        return 'Connected'
      case CONNECTION_STATES.CONNECTING:
        return 'Connecting...'
      case CONNECTION_STATES.RECONNECTING:
        return `Reconnecting... (${retryCount}/${maxRetries})`
      case CONNECTION_STATES.ERROR:
        return 'Connection Error'
      default:
        return 'Disconnected'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case CONNECTION_STATES.CONNECTED:
        return '=â'
      case CONNECTION_STATES.CONNECTING:
      case CONNECTION_STATES.RECONNECTING:
        return '=á'
      case CONNECTION_STATES.ERROR:
        return '=4'
      default:
        return '«'
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm">
        {getStatusIcon()} <span className={getStatusColor()}>{getStatusText()}</span>
      </span>
      
      {showDetails && lastError && (
        <div className="text-xs text-red-500 max-w-xs truncate" title={lastError.message}>
          {lastError.message}
        </div>
      )}
      
      {showDetails && connectionStatus === CONNECTION_STATES.ERROR && retryCount < maxRetries && (
        <button
          onClick={reconnect}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
        >
          Retry Now
        </button>
      )}
    </div>
  )
}

// Authentication status component
export const AuthStatus = ({ className = '' }) => {
  const { user, loading, isAuthenticated } = useSupabase()
  
  if (loading) {
    return <div className={`text-sm text-gray-500 ${className}`}>Loading...</div>
  }
  
  return (
    <div className={`text-sm ${className}`}>
      {isAuthenticated ? (
        <span className="text-green-600">
          =d {user.email || 'Authenticated'}
        </span>
      ) : (
        <span className="text-gray-600">
          = Not authenticated
        </span>
      )}
    </div>
  )
}

export default SupabaseContext