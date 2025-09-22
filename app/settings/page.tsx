'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react'
import { createAuthClient } from "better-auth/react"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast'
import TopBar from "@/components/TopBar"

export default function SettingsPage() {
  const authClient = createAuthClient()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userName, setUserName] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [maskedToken, setMaskedToken] = useState('')
  const [hasStoredToken, setHasStoredToken] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasMicrosoftAccount, setHasMicrosoftAccount] = useState(false)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await authClient.getSession()
        if (session.data) {
          setIsAuthenticated(true)
          setUserName(session.data.user.name || session.data.user.email || 'User')
          await fetchStoredToken()
        } else {
          setIsAuthenticated(false)
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
        router.push('/')
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuthStatus()
  }, [router])

  const fetchStoredToken = async () => {
    try {
      const tokenResult = await fetch("/api/auth/token");
      const { token } = await tokenResult.json();

      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHasStoredToken(data.hasToken)
        setMaskedToken(data.maskedToken || '')
        setHasMicrosoftAccount(data.hasMicrosoftAccount || false)
      }
    } catch (error) {
      console.error('Error fetching stored token:', error)
    }
  }

  const signOut = async () => {
    try {
      await authClient.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const saveApiToken = async () => {
    if (!apiToken.trim()) {
      alert('Please enter an API token')
      return
    }

    setIsSaving(true)
    try {
      const session = await authClient.getSession()
      if (!session.data?.session.token) {
        console.error('No access token found in session')
        return
      }

      const tokenResult = await fetch("/api/auth/token");
      const { token } = await tokenResult.json();

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiToken })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setApiToken('')
      await fetchStoredToken()
      toast.success('API token saved successfully!')
    } catch (error) {
      console.error('Error saving API token:', error)
      toast.error('Error saving API token. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }


  if (isCheckingAuth) {
    return (
      <div>
        <TopBar title="Settings" showBackButton={true} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', paddingTop: '80px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div>
      <Toaster position="bottom-right" />
      <TopBar title="Settings" showBackButton={true} onSignOut={signOut} />

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', paddingTop: '120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <Settings size={24} />
          <h2 style={{ margin: 0, fontSize: '20px' }}>Settings</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>User information</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>Name: {userName}</p>
          </div>

          <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>OpenAI API token</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {hasStoredToken && (
                <div style={{ padding: '12px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#6c757d' }}>Current:</p>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px' }}>{maskedToken}</p>
                </div>
              )}
              <Input
                type="password"
                placeholder={hasStoredToken ? "Enter new token" : "Enter your token"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                disabled={isSaving}
              />
              <Button 
                onClick={saveApiToken} 
                disabled={isSaving || !apiToken.trim()}
                style={{ cursor: isSaving || !apiToken.trim() ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}
              >
                {isSaving ? 'Saving...' : (hasStoredToken ? 'Update token' : 'Save token')}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}