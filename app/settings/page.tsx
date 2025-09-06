'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react'
import { createAuthClient } from "better-auth/react"
import { ArrowLeft, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast'

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
  const [hasGoogleAccount, setHasGoogleAccount] = useState(false)

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
        setHasGoogleAccount(data.hasGoogleAccount || false)
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
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', zIndex: '1000', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e0e0e0', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Button variant="outline" onClick={() => router.back()} style={{ cursor: 'pointer', padding: '8px' }}>
              <ArrowLeft size={16} />
            </Button>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Settings</h1>
          </div>
        </div>
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
      <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', zIndex: '1000', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e0e0e0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Button variant="outline" onClick={() => router.back()} style={{ cursor: 'pointer', padding: '8px' }}>
            <ArrowLeft size={16} />
          </Button>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Settings</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={signOut} 
          style={{ cursor: 'pointer' }}
        >
          Sign out
        </Button>
      </div>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', paddingTop: '120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <Settings size={24} />
          <h2 style={{ margin: 0, fontSize: '20px' }}>Settings</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>User information</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>Name: {userName}</p>
            {(hasMicrosoftAccount || hasGoogleAccount) && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Linked accounts</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '15px 0' }}>
                  {hasMicrosoftAccount && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="16" height="16" viewBox="0 0 23 23" fill="none">
                        <rect x="1" y="1" width="10" height="10" fill="#000"/>
                        <rect x="12" y="1" width="10" height="10" fill="#000"/>
                        <rect x="1" y="12" width="10" height="10" fill="#000"/>
                        <rect x="12" y="12" width="10" height="10" fill="#000"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#666' }}>Microsoft</span>
                    </div>
                  )}
                  {hasGoogleAccount && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#000"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#666' }}>Google</span>
                    </div>
                  )}
                </div>
              </>
            )}
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