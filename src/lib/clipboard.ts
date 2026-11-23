function focusWithoutScroll(element: HTMLElement | null): void {
  if (!element) return
  try {
    element.focus({ preventScroll: true })
  } catch {
    // Older browsers do not support FocusOptions.
    element.focus()
  }
}

function copyWithTextarea(value: string): boolean {
  const previousFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  const area = document.createElement('textarea')

  try {
    area.value = value
    area.setAttribute('readonly', '')
    area.setAttribute('aria-hidden', 'true')
    area.tabIndex = -1
    area.style.position = 'fixed'
    area.style.top = '0'
    area.style.left = '0'
    area.style.width = '2em'
    area.style.height = '2em'
    area.style.padding = '0'
    area.style.border = '0'
    area.style.outline = 'none'
    area.style.boxShadow = 'none'
    area.style.background = 'transparent'
    area.style.opacity = '0'
    area.style.fontSize = '16px'
    area.style.pointerEvents = 'none'

    document.body.appendChild(area)
    focusWithoutScroll(area)
    area.select()
    area.setSelectionRange(0, value.length)

    const copied = document.execCommand('copy')
    area.remove()
    focusWithoutScroll(previousFocus)
    return copied
  } catch {
    area.remove()
    focusWithoutScroll(previousFocus)
    return false
  }
}

function copyWithContentEditable(value: string): boolean {
  const previousFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  const holder = document.createElement('div')

  try {
    holder.contentEditable = 'true'
    holder.setAttribute('aria-hidden', 'true')
    holder.textContent = value
    holder.style.position = 'fixed'
    holder.style.top = '0'
    holder.style.left = '0'
    holder.style.width = '1px'
    holder.style.height = '1px'
    holder.style.padding = '0'
    holder.style.border = '0'
    holder.style.opacity = '0.01'
    holder.style.overflow = 'hidden'
    holder.style.fontSize = '16px'
    holder.style.pointerEvents = 'none'

    document.body.appendChild(holder)
    focusWithoutScroll(holder)

    const range = document.createRange()
    range.selectNodeContents(holder)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    const copied = document.execCommand('copy')
    selection?.removeAllRanges()
    holder.remove()
    focusWithoutScroll(previousFocus)
    return copied
  } catch {
    holder.remove()
    focusWithoutScroll(previousFocus)
    return false
  }
}

export async function copyToClipboard(value: string): Promise<boolean> {
  const text = String(value)

  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Clipboard permissions can be blocked in private mode and in-app browsers.
  }

  // iOS Safari and some Android webviews still support the legacy command.
  if (copyWithTextarea(text)) return true
  return copyWithContentEditable(text)
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
      // Some in-app browsers expose Web Share but reject every request.
      // Fall through to the clipboard fallback instead of dead-ending.
    }
  }

  const copied = await copyToClipboard(options.url)
  return copied ? 'copied' : 'failed'
}
