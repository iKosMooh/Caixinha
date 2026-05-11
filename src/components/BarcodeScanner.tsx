'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Web Audio not available
  }
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const scannedRef  = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stopped = false
    const reader = new BrowserMultiFormatReader()

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        // Continuously try to decode from canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        function tick() {
          if (stopped || scannedRef.current) return
          const video = videoRef.current
          if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width  = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            try {
              const result = reader.decodeFromCanvas(canvas)
              if (result && !scannedRef.current) {
                scannedRef.current = true
                beep()
                stop()
                onScan(result.getText())
                return
              }
            } catch {
              // NotFoundException thrown on each frame with no barcode — normal
            }
          }
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao acessar câmera')
      }
    }

    function stop() {
      stopped = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }

    start()
    return () => stop()
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-sm aspect-square">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-xl"
          playsInline
          muted
          aria-label="Câmera para leitura de código de barras"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-1/3 border-4 border-white rounded-lg opacity-70" />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-red-400 text-center px-4">{error}</p>
      )}

      <p className="mt-4 text-white text-lg text-center px-4">
        Aponte a câmera para o código de barras
      </p>

      <button
        onClick={onClose}
        className="mt-6 bg-white text-black font-bold rounded-xl px-8 py-3 text-lg
          focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none min-h-[52px]"
      >
        Cancelar
      </button>
    </div>
  )
}
