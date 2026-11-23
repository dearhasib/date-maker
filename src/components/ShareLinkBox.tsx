import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Copy } from 'lucide-react'

interface ShareLinkBoxProps {
  value: string
  label: string
  hint?: string
  className?: string
}

export function ShareLinkBox({
  value,
  label,
  hint = 'Tap the link to select it, then copy. If tapping does not work, press and hold to select.',
  className = '',
}: ShareLinkBoxProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const resizeLinkBox = useCallback(() => {
    const area = areaRef.current
    if (!area) return

    // A two-row textarea clips long invite URLs. Grow it enough to show the
    // entire link so manual copying stays possible when the clipboard is
    // blocked in an in-app browser.
    area.style.height = 'auto'
    area.style.height = `${Math.max(area.scrollHeight, 58)}px`
  }, [])

  useLayoutEffect(() => {
    resizeLinkBox()
  }, [resizeLinkBox, value])

  useEffect(() => {
    let cancelled = false

    resizeLinkBox()
    window.addEventListener('resize', resizeLinkBox)

    const fontsReady = document.fonts?.ready
    if (fontsReady) {
      fontsReady
        .then(() => {
          if (!cancelled) resizeLinkBox()
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
      window.removeEventListener('resize', resizeLinkBox)
    }
  }, [resizeLinkBox, value])

  function selectLink() {
    const area = areaRef.current
    if (!area) return

    area.focus({ preventScroll: true })
    area.select()
    area.setSelectionRange(0, area.value.length)
  }

  return (
    <div
      className={`w-full rounded-2xl border border-line bg-cream/80 p-2 text-left ${className}`}
    >
      <div className="flex items-center justify-between gap-2 px-1.5 pb-1.5">
        <span className="eyebrow text-[9px]">{label}</span>
        <button
          type="button"
          onClick={selectLink}
          className="inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold text-muted transition-colors hover:text-coral"
        >
          <Copy size={11} strokeWidth={2.2} />
          Select
        </button>
      </div>

      <textarea
        ref={areaRef}
        readOnly
        rows={2}
        value={value}
        aria-label={label}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onClick={selectLink}
        onFocus={selectLink}
        className="block min-h-[58px] w-full resize-none overflow-hidden rounded-xl border border-line bg-white px-3 py-2 text-[16px] font-medium leading-relaxed text-ink outline-none [overflow-wrap:anywhere] focus:border-coral/60 focus:shadow-[0_0_0_4px_rgba(232,93,74,0.08)] sm:text-[12.5px]"
      />

      <p className="px-1.5 pb-0.5 pt-1.5 text-[10.5px] leading-relaxed text-muted/80">
        {hint}
      </p>
    </div>
  )
}
