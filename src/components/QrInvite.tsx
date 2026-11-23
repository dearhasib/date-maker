import { useEffect, useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { toCanvas, toDataURL } from 'qrcode'
import { copyToClipboard } from '../lib/clipboard'
import type { ToastData } from './Toast'

interface QrInviteProps {
  value: string
  notify: (message: string, tone?: ToastData['tone']) => void
}

interface QrAssets {
  displayUrl: string
  shareBlob: Blob
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + r, y)
  context.arcTo(x + width, y, x + width, y + height, r)
  context.arcTo(x + width, y + height, x, y + height, r)
  context.arcTo(x, y + height, x, y, r)
  context.arcTo(x, y, x + width, y, r)
  context.closePath()
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not export QR image'))
    }, 'image/png')
  })
}

async function buildFramedQr(value: string): Promise<Blob> {
  const qrCanvas = document.createElement('canvas')
  await toCanvas(qrCanvas, value, {
    width: 820,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#241A14',
      light: '#FFFFFF',
    },
  })

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1320
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')

  context.fillStyle = '#FAF6F0'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.strokeStyle = '#E85D4A'
  context.lineWidth = 10
  roundedRect(context, 32, 32, canvas.width - 64, canvas.height - 64, 52)
  context.stroke()

  context.textAlign = 'center'
  context.textBaseline = 'middle'

  context.fillStyle = '#B85A4C'
  context.font = '600 28px "DM Sans Variable", "DM Sans", system-ui, sans-serif'
  context.fillText('A  T I N Y  A S K', canvas.width / 2, 130)

  context.fillStyle = '#2C211A'
  context.font = '500 62px "Fraunces Variable", Fraunces, Georgia, serif'
  context.fillText('Scan me 💌', canvas.width / 2, 222)

  context.fillStyle = '#FFFFFF'
  roundedRect(context, 90, 300, 900, 900, 42)
  context.fill()

  context.strokeStyle = '#EFE2D4'
  context.lineWidth = 2
  roundedRect(context, 90, 300, 900, 900, 42)
  context.stroke()

  context.drawImage(qrCanvas, 130, 340, 820, 820)

  context.fillStyle = '#7A6F64'
  context.font = '500 28px "DM Sans Variable", "DM Sans", system-ui, sans-serif'
  context.fillText('Point your camera here', canvas.width / 2, 1260)

  return canvasToBlob(canvas)
}

export function QrInvite({ value, notify }: QrInviteProps) {
  const [assets, setAssets] = useState<QrAssets | null>(null)
  const [failed, setFailed] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function generate() {
      setAssets(null)
      setFailed(false)

      try {
        try {
          await Promise.race([
            document.fonts?.ready ?? Promise.resolve(),
            new Promise((resolve) => window.setTimeout(resolve, 1500)),
          ])
        } catch {
          // Canvas can still render with the platform fallback fonts.
        }

        const displayUrl = await toDataURL(value, {
          width: 512,
          margin: 4,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#241A14',
            light: '#FFFFFF',
          },
        })
        const shareBlob = await buildFramedQr(value)

        if (!cancelled) setAssets({ displayUrl, shareBlob })
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    void generate()
    return () => {
      cancelled = true
    }
  }, [value])

  function downloadQr() {
    if (!assets) return

    const href = URL.createObjectURL(assets.shareBlob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = 'a-tiny-ask-invite-qr.png'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(href), 1000)
    notify('QR image downloaded 📥')
  }

  async function shareQrOrLink() {
    if (!assets || sharing) return

    setSharing(true)
    try {
      let file: File | null = null
      try {
        file = new File([assets.shareBlob], 'a-tiny-ask-invite-qr.png', {
          type: 'image/png',
        })
      } catch {
        // Very old browsers can still share the URL or copy it below.
      }

      if (typeof navigator.share === 'function') {
        if (file) {
          let canShareFiles = false
          if (typeof navigator.canShare === 'function') {
            try {
              canShareFiles = navigator.canShare({ files: [file] })
            } catch {
              canShareFiles = false
            }
          }

          if (canShareFiles) {
            try {
              await navigator.share({
                files: [file],
                title: 'A tiny ask 💌',
                text: 'Scan this QR code for my tiny question.',
              })
              return
            } catch (error) {
              if (isAbortError(error)) return
            }
          }
        }

        try {
          await navigator.share({
            title: 'A tiny ask 💌',
            text: 'I have a tiny question for you…',
            url: value,
          })
          return
        } catch (error) {
          if (isAbortError(error)) return
        }
      }

      const copied = await copyToClipboard(value)
      notify(
        copied
          ? 'Invite link copied — share it anywhere 💌'
          : 'Sharing was blocked — use the link below instead.',
        copied ? 'success' : 'error',
      )
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-[22px] border border-line bg-cream/80 p-2">
        <div className="rounded-[17px] border border-white bg-white px-2 py-3 sm:px-4">
          <p className="eyebrow text-center text-[9px] text-muted">Scan me 💌</p>

          {assets ? (
            <img
              src={assets.displayUrl}
              alt="QR code for your proposal invite link"
              width={512}
              height={512}
              className="mx-auto mt-2 h-auto w-full max-w-[230px]"
            />
          ) : failed ? (
            <p
              role="status"
              className="mx-auto flex min-h-[180px] max-w-[260px] items-center justify-center text-center text-[11.5px] leading-relaxed text-muted"
            >
              QR code could not be generated. You can still share the link
              below.
            </p>
          ) : (
            <div
              aria-label="Generating QR code"
              className="mx-auto mt-2 aspect-square w-full max-w-[230px] animate-pulse rounded-xl bg-cream"
            />
          )}

          <p className="mt-2 text-center text-[10px] leading-relaxed text-muted/75">
            Point a phone camera here — no app or typing needed.
          </p>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={downloadQr}
          disabled={!assets}
          className="secondary-button px-3 text-[12px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={13} strokeWidth={2.1} />
          <span>Download QR Image</span>
          <span aria-hidden="true">📥</span>
        </button>
        <button
          type="button"
          onClick={shareQrOrLink}
          disabled={!assets || sharing}
          className="secondary-button px-3 text-[12px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 size={13} strokeWidth={2.1} />
          <span>{sharing ? 'Opening share…' : 'Share QR / Link'}</span>
        </button>
      </div>
    </div>
  )
}
