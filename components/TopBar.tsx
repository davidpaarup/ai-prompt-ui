'use client'

import { Button } from "@/components/ui/button"
import { Settings, ArrowLeft, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/contexts/ThemeContext"

interface TopBarProps {
  userName?: string
  isMobile?: boolean
  onSignOut?: () => void
  showUserControls?: boolean
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}

export default function TopBar({
  userName,
  isMobile,
  onSignOut,
  showUserControls = false,
  title = "AI prompt",
  showBackButton = false,
  onBack
}: TopBarProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '0', 
      left: '0', 
      width: '100%', 
      zIndex: '1000', 
      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
      backdropFilter: 'blur(10px)', 
      WebkitBackdropFilter: 'blur(10px)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '20px', 
      borderBottom: '1px solid var(--border)', 
      boxSizing: 'border-box' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {showBackButton && (
          <Button variant="outline" onClick={handleBack} style={{ cursor: 'pointer', padding: '8px' }}>
            <ArrowLeft size={16} />
          </Button>
        )}
        <h1 style={{ margin: 0, fontSize: '24px' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {showUserControls && (
          <>
            {!isMobile && userName && <span>{userName}</span>}
            <Button variant="outline" onClick={toggleTheme} style={{ cursor: 'pointer', padding: '8px' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="outline" onClick={() => router.push('/settings')} style={{ cursor: 'pointer', padding: '8px' }}>
              <Settings size={16} />
            </Button>
            <Button variant="outline" onClick={onSignOut} style={{ cursor: 'pointer' }}>
              {'Sign Out'}
            </Button>
          </>
        )}
        {!showUserControls && (
          <>
            <Button variant="outline" onClick={toggleTheme} style={{ cursor: 'pointer', padding: '8px' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            {onSignOut && (
              <Button variant="outline" onClick={onSignOut} style={{ cursor: 'pointer' }}>
                Sign out
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}