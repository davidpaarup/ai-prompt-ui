'use client'

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { createAuthClient } from "better-auth/react"
import TopBar from "@/components/TopBar"
import SignIn from "@/components/SignIn"

export default function Home() {
  const authClient = createAuthClient()

  const [textareaValue, setTextareaValue] = useState('')
  const [apiResponse, setApiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userName, setUserName] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [hasApiToken, setHasApiToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await authClient.getSession()
        if (session.data) {
          setIsAuthenticated(true)
          setUserName(session.data.user.name || session.data.user.email || 'User')
          await checkApiTokenStatus()
        } else {
          setIsAuthenticated(false)
          setUserName('')
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuthStatus()
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkApiTokenStatus = async () => {
    setIsCheckingToken(true)
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
        setHasApiToken(data.hasToken)
      }
    } catch (error) {
      console.error('Error checking API key status:', error)
      setHasApiToken(false)
    } finally {
      setIsCheckingToken(false)
    }
  }


  const signOut = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      setIsAuthenticated(false)
      setUserName('')
      setApiResponse('')
      setTextareaValue('')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendToAPI = async () => {
    setIsLoading(true)
    setApiResponse('')
    try {
      const session = await authClient.getSession()

      if (!session.data?.session.token) {
        console.error('No access token found in session')
        setIsAuthenticated(false)
        return
      }

      const url = process.env.NEXT_PUBLIC_BACKEND_URL as string
      const endpoint = `${url}/prompt`

      const tokenResult = await fetch("/api/auth/token");
      const { token } = await tokenResult.json();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: textareaValue })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader();

      if (!reader) {
        return;
      }

      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const cleanedChunk = chunk.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
        
        accumulatedResponse += cleanedChunk;
        setApiResponse(accumulatedResponse);
      }
      
    } catch (error) {
      console.error('Error sending to API:', error)
    } finally {
      setIsLoading(false)
    }
  }


  if (isCheckingAuth) {
    return (
      <div>
        <TopBar />
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
    return (
      <div>
        <TopBar />
        <SignIn />
      </div>
    )
  }

  return (
      <div>
        <TopBar 
          userName={userName}
          isMobile={isMobile}
          onSignOut={signOut}
          showUserControls={true}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '120px' }}>
          <Textarea 
            value={textareaValue} 
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Ask me what I can do..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isLoading) {
                  sendToAPI()
                }
              }
            }}
            disabled={isLoading}
            style={{ width: isMobile ? '90%' : '50%' }}
          />
          <Tooltip 
            content="Please add your OpenAI API key in settings to send a prompt." 
            disabled={hasApiToken || isCheckingToken}
          >
            <Button 
              variant="outline" 
              onClick={sendToAPI} 
              disabled={isLoading || !hasApiToken || isCheckingToken} 
              style={{ 
                cursor: (isLoading || !hasApiToken || isCheckingToken) ? 'not-allowed' : 'pointer' 
              }}
            >
              {isLoading ? 'Loading...' : 'Send'}
            </Button>
          </Tooltip>
          {apiResponse && (
            <div style={{ marginTop: '20px', padding: '10px', width: isMobile ? '90%' : '50%', maxWidth: isMobile ? '90%' : '50%' }}>
              <ReactMarkdown>{apiResponse}</ReactMarkdown>
            </div>
          )}

        </div>
      </div>
  );
}