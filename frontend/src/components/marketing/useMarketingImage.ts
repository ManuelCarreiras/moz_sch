import { useEffect, useState } from 'react'

export type MarketingImageState = 'loading' | 'ok' | 'missing'

export function useMarketingImage(src: string): MarketingImageState {
  const [state, setState] = useState<MarketingImageState>('loading')

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setState('ok')
    }
    img.onerror = () => {
      if (!cancelled) setState('missing')
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return state
}
