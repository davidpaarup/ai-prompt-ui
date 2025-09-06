'use client'

import React, { useState } from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  disabled?: boolean
}

export function Tooltip({ children, content, disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '5px',
            whiteSpace: 'nowrap',
            animation: 'tooltipFadeIn 0.2s ease-out'
          }}
        >
          {content}
          <div
            className="tooltip-arrow"
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              marginLeft: '-5px',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#1f2937 transparent transparent transparent'
            }}
          />
          <style jsx>{`
            @keyframes tooltipFadeIn {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}