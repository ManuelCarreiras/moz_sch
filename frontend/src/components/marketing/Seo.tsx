import { useEffect } from 'react'

type SeoProps = {
  title: string
  description?: string
  /** Path only, e.g. /features/financial-management */
  canonicalPath?: string
  ogImage?: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export function Seo({ title, description, canonicalPath, ogImage }: SeoProps) {
  useEffect(() => {
    const origin = window.location.origin
    document.title = title

    if (description) {
      upsertMeta('name', 'description', description)
    }

    const fullUrl = canonicalPath
      ? `${origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
      : origin

    if (canonicalPath) {
      upsertLink('canonical', fullUrl)
    }

    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', fullUrl)
    if (description) upsertMeta('property', 'og:description', description)
    if (ogImage) upsertMeta('property', 'og:image', ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    if (description) upsertMeta('name', 'twitter:description', description)
    if (ogImage) upsertMeta('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`)
  }, [title, description, canonicalPath, ogImage])

  return null
}
