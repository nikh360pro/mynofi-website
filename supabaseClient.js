import { createClient } from '@supabase/supabase-js'

// Supabase configuration with environment variables and fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mizniptrapkrykarqaha.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pem5pcHRyYXBrcnlrYXJxYWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc2MzUsImV4cCI6MjA2NDU5MzYzNX0.A6xmnfudPmPfnxeidJFQbJYRb96u06sDEQ0AdBpXz8s'

// Validate required configuration
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Enhanced Supabase client configuration for optimal WebSocket performance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Real-time configuration for WebSocket connections
  realtime: {
    params: {
      eventsPerSecond: 10,
      heartbeatIntervalMs: 30000,
      reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000), // Exponential backoff up to 30s
    },
    transport: 'websocket',
    timeout: 20000,
  },
  
  // Authentication configuration
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: globalThis.localStorage,
  },
  
  // Database configuration
  db: {
    schema: 'public',
  },
  
  // Global configuration
  global: {
    headers: {
      'x-application-name': 'mynofi-website',
    },
  },
})

// Connection status tracking
let isConnected = false
let connectionListeners = []

// WebSocket connection monitoring
supabase.realtime.onOpen(() => {
  console.log(' Supabase WebSocket connected successfully')
  isConnected = true
  connectionListeners.forEach(listener => listener({ status: 'connected' }))
})

supabase.realtime.onClose(() => {
  console.warn('  Supabase WebSocket connection closed')
  isConnected = false
  connectionListeners.forEach(listener => listener({ status: 'disconnected' }))
})

supabase.realtime.onError((error) => {
  console.error('L Supabase WebSocket error:', error)
  connectionListeners.forEach(listener => listener({ status: 'error', error }))
})

// Enhanced authentication state helpers
export const auth = {
  // Get current session
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  // Sign up with email and password
  signUp: async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers with error handling
export const db = {
  // Generic select with error handling
  select: async (table, query = '*', filters = {}) => {
    try {
      let dbQuery = supabase.from(table).select(query)
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        dbQuery = dbQuery.eq(key, value)
      })
      
      const { data, error } = await dbQuery
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error selecting from ${table}:`, error)
      throw error
    }
  },

  // Generic insert with error handling
  insert: async (table, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
      
      if (error) throw error
      return result
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error)
      throw error
    }
  },

  // Generic update with error handling
  update: async (table, data, filters = {}) => {
    try {
      let dbQuery = supabase.from(table).update(data)
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        dbQuery = dbQuery.eq(key, value)
      })
      
      const { data: result, error } = await dbQuery.select()
      if (error) throw error
      return result
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      throw error
    }
  },

  // Generic delete with error handling
  delete: async (table, filters = {}) => {
    try {
      let dbQuery = supabase.from(table)
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        dbQuery = dbQuery.delete().eq(key, value)
      })
      
      const { error } = await dbQuery
      if (error) throw error
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error)
      throw error
    }
  }
}

// Real-time helpers
export const realtime = {
  // Subscribe to table changes
  subscribe: (table, callback, filters = {}) => {
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...filters
        },
        callback
      )
      .subscribe()

    return channel
  },

  // Unsubscribe from channel
  unsubscribe: (channel) => {
    return supabase.removeChannel(channel)
  },

  // Check connection status
  isConnected: () => isConnected,

  // Listen to connection status changes
  onConnectionChange: (callback) => {
    connectionListeners.push(callback)
    return () => {
      connectionListeners = connectionListeners.filter(listener => listener !== callback)
    }
  }
}

// Health check function
export const healthCheck = async () => {
  try {
    // Test basic connectivity
    const { data, error } = await supabase.from('_health').select('*').limit(1)
    
    return {
      status: 'healthy',
      connected: isConnected,
      timestamp: new Date().toISOString(),
      url: supabaseUrl
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: isConnected,
      error: error.message,
      timestamp: new Date().toISOString(),
      url: supabaseUrl
    }
  }
}

// Debug helpers (only in development)
if (import.meta.env.DEV) {
  // Global access for debugging
  globalThis.supabase = supabase
  globalThis.supabaseAuth = auth
  globalThis.supabaseDb = db
  globalThis.supabaseRealtime = realtime
  globalThis.supabaseHealthCheck = healthCheck

  console.log('=' Supabase client initialized in development mode')
  console.log('< Supabase URL:', supabaseUrl)
  console.log('= Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')
  console.log('=á WebSocket Status:', isConnected ? 'Connected' : 'Disconnected')
}

export default supabase