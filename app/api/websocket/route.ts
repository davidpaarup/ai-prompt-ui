import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Use dynamic import for WebSocket in Node.js environment
          const WebSocket = (await import('ws')).default
          const wsUrl = 'wss://app-250827175950.azurewebsites.net/ws/prompt'
          const ws = new WebSocket(wsUrl, {
            headers: {
              'Authorization': request.headers.get('authorization') ?? ''
            }
          })

          ws.on('open', () => {
            ws.send(prompt)
          })

          ws.on('message', (data: any) => {
            const message = data.toString()
            if (message === '[DONE]') {
              controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`)
              controller.close()
              ws.close()
              return
            }
            
            try {
              const parsed = JSON.parse(message)
              if (parsed.content) {
                controller.enqueue(`data: ${JSON.stringify({ content: parsed.content })}\n\n`)
              } else if (parsed.error) {
                controller.enqueue(`data: ${JSON.stringify({ error: parsed.error })}\n\n`)
                controller.close()
                ws.close()
              }
            } catch {
              controller.enqueue(`data: ${JSON.stringify({ content: message })}\n\n`)
            }
          })

          ws.on('error', (error: any) => {
            console.error('WebSocket error:', error)
            controller.enqueue(`data: ${JSON.stringify({ error: 'WebSocket connection error' })}\n\n`)
            controller.close()
          })

          ws.on('close', () => {
            controller.close()
          })
        } catch (error) {
          console.error('Failed to create WebSocket:', error)
          controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to establish connection' })}\n\n`)
          controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}