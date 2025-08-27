'use client'

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { createAuthClient } from "better-auth/react"

export default function Home() {
  const authClient = createAuthClient()

  const [textareaValue, setTextareaValue] = useState('')
  const [apiResponse, setApiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await authClient.getSession()
        if (session.data) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
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

  const signIn = async () => {
    try {

      await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: "/",
      })

    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const sendToAPI = async () => {
    setIsLoading(true)
    try {
      const session = await authClient.getSession()

      if (!session.data?.session.token) {
        console.error('No access token found in session')
        setIsAuthenticated(false)
        return
      }

      const url = 'https://app-250827175950.azurewebsites.net/prompt'

      const result = await authClient.getAccessToken({
        providerId: "microsoft", // or any other provider id
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.data.accessToken}`
        },
        body: JSON.stringify({ prompt: textareaValue })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.text()
      const cleanedResponse = responseData.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
      setApiResponse(cleanedResponse)
    } catch (error) {
      console.error('Error sending to API:', error)
    } finally {
      setIsLoading(false)
    }
  }


  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Checking authentication...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
        <h1>Please sign in to continue</h1>
        <Button onClick={signIn}>
          Sign in with Microsoft
        </Button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '40px' }}>

      <Textarea 
        value={textareaValue} 
        onChange={(e) => setTextareaValue(e.target.value)} 
        disabled={isLoading}
        style={{ width: '50%' }}
      />
      <Button variant="outline" onClick={sendToAPI} disabled={isLoading} style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}>
        {isLoading ? 'Loading...' : 'Send'}
      </Button>
      {apiResponse && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <ReactMarkdown>{apiResponse}</ReactMarkdown>
        </div>
      )}

    </div>
  );
}
