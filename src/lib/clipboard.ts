export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // Fall through to the legacy copy path.
  }

  try {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    area.style.pointerEvents = 'none'
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    area.remove()
    return copied
  } catch {
    return false
  }
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

export async function shareOrCopy(options: {
  title: string
  text: string
  url: string
}): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(options)
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled'
      }
    }
  }

  const copied = await copyToClipboard(options.url)
  return copied ? 'copied' : 'failed'
}
