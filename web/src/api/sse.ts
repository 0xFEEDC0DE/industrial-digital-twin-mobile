type EventHandler = (evt: MessageEvent) => void

export function subscribeRuntimeEvents(onMessage: EventHandler, onError?: (err: any) => void) {
  // Prefer SSE on /api/runtime/events
  try {
    const es = new EventSource('/api/runtime/events')
    es.onmessage = onMessage
    es.onerror = (e) => {
      es.close()
      onError?.(e)
    }
    return () => es.close()
  } catch (err) {
    // Fallback: no-op, caller should poll
    onError?.(err)
    return () => {}
  }
}
