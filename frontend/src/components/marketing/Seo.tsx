import { useEffect } from 'react'

type SeoProps = {
  title: string
  description?: string
  /** Path only, e.g. /features/financial-management — full URL built with window.location.origin */
  canonicalPath?: string
}

function upsertMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function Seo({ title, description, canonicalPath }: SeoProps) {
  useEffect(() => {
    document.title = title
    if (description) upsertMeta('description', description)
    if (canonicalPath) {
      const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
      const href = `${window.location.origin}${path}`
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', href)
    }
  }, [title, description, canonicalPath])

  return null
}

