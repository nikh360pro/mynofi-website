import React, { useState, useEffect } from 'react'
import { useSupabase, ConnectionStatus, AuthStatus } from './SupabaseContext.js'

// Main navigation component
const Navigation = () => {
  const { isAuthenticated, user, signOut } = useSupabase()
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/Mynofi_Logo.png" 
              alt="Mynofi Logo" 
              className="h-8 w-auto"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'block'
              }}
            />
            <span 
              className="hidden text-xl font-bold text-gray-900 ml-2"
              style={{ display: 'none' }}
            >
              Mynofi
            </span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </a>
              <a href="#download" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Download
              </a>
              <a href="#support" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Support
              </a>
            </div>
          </div>
          
          {/* Auth Status & Connection */}
          <div className="flex items-center space-x-4">
            <ConnectionStatus showDetails={true} />
            <AuthStatus />
            {isAuthenticated && (
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Hero section component
const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Monitor Your Content Creation
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Real-time notifications for OBS Studio, Audacity, and NVIDIA tools
          </p>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-blue-100">
            Mynofi keeps you informed about your recording sessions, streaming status, 
            and system events with intelligent notifications and monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#download"
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Download Now
            </a>
            <a
              href="#features"
              className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Features section component
const FeaturesSection = () => {
  const features = [
    {
      icon: '<¥',
      title: 'OBS Studio Monitoring',
      description: 'Track recording and streaming sessions, detect frame drops, and monitor system performance.'
    },
    {
      icon: '<µ',
      title: 'Audacity Integration',
      description: 'Get notified when voice recordings start or stop, with audio level monitoring.'
    },
    {
      icon: '<®',
      title: 'NVIDIA Tools Support',
      description: 'Monitor GPU-accelerated recording and streaming with NVIDIA software integration.'
    },
    {
      icon: '=',
      title: 'Smart Notifications',
      description: 'Customizable alerts for important events with visual and audio notifications.'
    },
    {
      icon: '=Ê',
      title: 'Real-time Analytics',
      description: 'Live performance metrics and statistics for your content creation workflow.'
    },
    {
      icon: '=',
      title: 'Secure & Private',
      description: 'Your data stays on your device with encrypted cloud sync for settings.'
    }
  ]

  return (
    <div id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Monitoring Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to stay on top of your content creation workflow
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Download section component
const DownloadSection = () => {
  const { checkHealth, isConnected } = useSupabase()
  const [downloadInfo, setDownloadInfo] = useState({
    version: 'v2.2.0',
    size: '45.2 MB',
    url: '/api/version.json'
  })

  return (
    <div id="download" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Download Mynofi
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Get started with Mynofi monitoring tool for Windows
        </p>
        
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="text-6xl">=»</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Mynofi for Windows</h3>
          <p className="text-gray-600 mb-4">
            {downloadInfo.version} " {downloadInfo.size} " Windows 10/11 compatible
          </p>
          
          <button
            onClick={() => window.open(downloadInfo.url, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Now
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            Free download " No registration required
          </div>
        </div>
        
        <div className="text-left max-w-2xl mx-auto">
          <h4 className="text-lg font-bold text-gray-900 mb-4">System Requirements</h4>
          <ul className="text-gray-600 space-y-2">
            <li>" Windows 10 or Windows 11</li>
            <li>" 4GB RAM minimum (8GB recommended)</li>
            <li>" 100MB available disk space</li>
            <li>" .NET Framework 4.8 or later</li>
            <li>" Administrator privileges for monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Connection diagnostics component
const ConnectionDiagnostics = () => {
  const { checkHealth, isConnected, connectionStatus, lastError, isAuthenticated } = useSupabase()
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const health = await checkHealth()
      setDiagnostics({
        ...health,
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
        connectionStatus,
        isAuthenticated
      })
    } catch (error) {
      setDiagnostics({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
        connectionStatus,
        isAuthenticated
      })
    } finally {
      setLoading(false)
    }
  }

  // Show diagnostics in development or when there are connection issues
  if (!import.meta.env.DEV && isConnected && !lastError) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Connection Diagnostics
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            {isConnected ? 
              'Connection established successfully.' : 
              'There may be connectivity issues. Click to run diagnostics.'
            }
          </p>
          
          <div className="mt-3">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Diagnostics'}
            </button>
          </div>
          
          {diagnostics && (
            <div className="mt-4 p-3 bg-white rounded border text-xs font-mono">
              <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main App component
const App = () => {
  const { loading, isConnected, connectionStatus, lastError } = useSupabase()
  const [mounted, setMounted] = useState(false)

  // Track when component is mounted
  useEffect(() => {
    setMounted(true)
    
    // Log successful mount in development
    if (import.meta.env.DEV) {
      console.log('<‰ App component mounted successfully')
      console.log('=á Supabase connection status:', connectionStatus)
    }
  }, [connectionStatus])

  // Show loading screen while initializing
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Mynofi</h2>
          <p className="text-sm text-gray-600">
            {loading ? 'Initializing services...' : 'Starting application...'}
          </p>
          <ConnectionStatus className="mt-4 justify-center" showDetails={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />
      
      {/* Connection Diagnostics (conditional) */}
      <ConnectionDiagnostics />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <DownloadSection />
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Mynofi</h3>
              <p className="text-gray-400">
                Professional monitoring tool for content creators and streamers.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Connection Status</h4>
              <ConnectionStatus showDetails={true} />
              {lastError && (
                <p className="text-red-400 text-xs mt-2">
                  {lastError.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Mynofi. All rights reserved.</p>
            <p className="text-xs mt-2">
              Built with React, Supabase, and deployed on Netlify
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App