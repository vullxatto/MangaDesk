import { useState } from 'react'
import type { CSSProperties } from 'react'

type SparkleKind = 'star1' | 'star2' | 'plus'

type SparkleDef = {
  kind: SparkleKind
  top: string
  left: string
  width: number
  opacity: number
  rotate: number
}

const SPARKLE_KINDS: SparkleKind[] = ['star1', 'star2', 'plus']
const SPARKLE_COUNT = 15
const SPARKLE_GAP_PCT = 2.2
const PLACE_MAX_ATTEMPTS = 5000

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function approxRadiusPct(widthPx: number): number {
  return 2.4 + widthPx * 0.1
}

function approxCenter(leftPct: number, topPct: number, widthPx: number): [number, number] {
  return [leftPct + widthPx * 0.045, topPct + widthPx * 0.052]
}

function isWithinHero(leftPct: number, topPct: number, widthPx: number): boolean {
  const r = approxRadiusPct(widthPx)
  const [cx, cy] = approxCenter(leftPct, topPct, widthPx)
  const pad = 2
  return cx >= r + pad && cx <= 100 - r - pad && cy >= r + pad && cy <= 100 - r - pad
}

function isFarFromOthers(
  leftPct: number,
  topPct: number,
  widthPx: number,
  others: ReadonlyArray<{ left: number; top: number; width: number }>,
): boolean {
  const r0 = approxRadiusPct(widthPx)
  const [cx, cy] = approxCenter(leftPct, topPct, widthPx)
  for (const o of others) {
    const r1 = approxRadiusPct(o.width)
    const [ox, oy] = approxCenter(o.left, o.top, o.width)
    const need = r0 + r1 + SPARKLE_GAP_PCT
    if (Math.hypot(cx - ox, cy - oy) < need) return false
  }
  return true
}

function createRandomSparkles(): SparkleDef[] {
  const placed: { left: number; top: number; width: number; kind: SparkleKind; opacity: number; rotate: number }[] = []
  let attempts = 0

  while (placed.length < SPARKLE_COUNT && attempts < PLACE_MAX_ATTEMPTS) {
    attempts++
    const width = Math.round(rand(16, 48))
    const left = rand(3, 90)
    const top = rand(3, 90)

    if (!isWithinHero(left, top, width)) continue
    if (!isFarFromOthers(left, top, width, placed)) continue

    placed.push({
      left,
      top,
      width,
      kind: SPARKLE_KINDS[Math.floor(Math.random() * SPARKLE_KINDS.length)]!,
      opacity: Number(rand(0.22, 0.56).toFixed(2)),
      rotate: Math.round(rand(-40, 40)),
    })
  }

  return placed.map((p) => ({
    kind: p.kind,
    top: `${p.top.toFixed(1)}%`,
    left: `${p.left.toFixed(1)}%`,
    width: p.width,
    opacity: p.opacity,
    rotate: p.rotate,
  }))
}

function Star1Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 92 99"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M45.8874 95.2771C45.8874 54.265 50.6527 49.1385 88.7749 49.1385C50.6527 49.1385 45.8874 44.0121 45.8874 3C45.8874 44.0121 41.1221 49.1385 2.99996 49.1385C41.1221 49.1385 45.8874 54.265 45.8874 95.2771Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeMiterlimit="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Star2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 159 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M79.3654 180.037C79.3654 112.96 60.8671 91.5183 3 91.5183C60.8671 91.5183 79.3654 70.0761 79.3654 3C79.3654 70.0761 97.8645 91.5183 155.732 91.5183C97.8645 91.5183 79.3654 112.96 79.3654 180.037Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeMiterlimit="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M30.3892 16.6946H3.00021"
        stroke="currentColor"
        strokeWidth="6"
        strokeMiterlimit="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6987 3V30.3886"
        stroke="currentColor"
        strokeWidth="6"
        strokeMiterlimit="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function renderIcon(kind: SparkleKind) {
  switch (kind) {
    case 'star1':
      return <Star1Icon className="hero-sparkle__svg" />
    case 'star2':
      return <Star2Icon className="hero-sparkle__svg" />
    default:
      return <PlusIcon className="hero-sparkle__svg" />
  }
}

export function HeroSparkles() {
  const [sparkles] = useState(createRandomSparkles)

  return (
    <div className="landing-hero__sparkles" aria-hidden>
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="hero-sparkle"
          style={
            {
              top: s.top,
              left: s.left,
              width: s.width,
              opacity: s.opacity,
              '--sparkle-r': `${s.rotate}deg`,
              '--sparkle-dur': `${5.2 + (i % 5) * 0.55}s`,
              '--sparkle-delay': `${-((i * 1.9) % 9)}s`,
            } as CSSProperties
          }
        >
          {renderIcon(s.kind)}
        </span>
      ))}
    </div>
  )
}
