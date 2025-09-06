'use client'

import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { createAuthClient } from "better-auth/react"

interface SignInProps {
  className?: string
}

export default function SignIn({ className }: SignInProps) {
  const authClient = createAuthClient()
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const signInWithMicrosoft = async () => {
    setIsMicrosoftLoading(true)
    try {
      await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: "/",
      })
    } catch (error) {
      console.error('Error signing in with Microsoft:', error)
      setIsMicrosoftLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        scopes: [
          "https://www.googleapis.com/auth/gmail.readonly",
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/drive"
        ]
      })
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setIsGoogleLoading(false)
    }
  }

  const isAnyLoading = isMicrosoftLoading || isGoogleLoading

  return (
    <div className={`${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '32px', 
      padding: '48px 32px',
      maxWidth: '400px',
      margin: '0 auto',
      marginTop: '120px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '28px', 
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Welcome back
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: '16px', 
          color: '#6b7280'
        }}>
          Sign in to your account to continue
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        width: '100%'
      }}>
        <Button 
          onClick={signInWithMicrosoft} 
          disabled={isAnyLoading} 
          variant="outline" 
          style={{ 
            cursor: isAnyLoading ? 'not-allowed' : 'pointer', 
            height: '48px',
            fontSize: '15px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center',
            border: '1.5px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isAnyLoading) {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.backgroundColor = '#f9fafb'
            }
          }}
          onMouseLeave={(e) => {
            if (!isAnyLoading) {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.backgroundColor = '#ffffff'
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 23 23" fill="none">
            <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
            <rect x="12" y="1" width="10" height="10" fill="#00a4ef"/>
            <rect x="1" y="12" width="10" height="10" fill="#ffb900"/>
            <rect x="12" y="12" width="10" height="10" fill="#7fba00"/>
          </svg>
          {isMicrosoftLoading ? 'Signing in...' : 'Continue with Microsoft'}
        </Button>

        <Button 
          onClick={signInWithGoogle} 
          disabled={isAnyLoading} 
          variant="outline" 
          style={{ 
            cursor: isAnyLoading ? 'not-allowed' : 'pointer', 
            height: '48px',
            fontSize: '15px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center',
            border: '1.5px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isAnyLoading) {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.backgroundColor = '#f9fafb'
            }
          }}
          onMouseLeave={(e) => {
            if (!isAnyLoading) {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.backgroundColor = '#ffffff'
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285f4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fbbc05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>
          </svg>
          {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </div>

      <div style={{ 
        fontSize: '13px', 
        color: '#9ca3af', 
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        By signing in, you agree to our terms of service and privacy policy
      </div>
    </div>
  )
}