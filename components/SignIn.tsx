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

  const isAnyLoading = isMicrosoftLoading

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