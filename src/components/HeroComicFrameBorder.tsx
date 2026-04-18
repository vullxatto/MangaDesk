const FRAME_PATH =
  'M0.500987 0.617771L41.2945 1.37961L59.2723 0.617771L129.975 0.921042L153.748 0.250244L175.422 0.617771H200.25L200.75 27.2502L200.25 53.6045V78.0475V95.9724L200.051 109.422V112.639L200.25 127.906V200.566H179.75H156.57L127.25 201.25L96.25 200.248H58.75H21.25L0.500987 200.566L1.25 171.677L0.500987 98.4167L0.25 49.7503L0.75 25.3126L0.500987 0.617771Z'

const frameSvgProps = {
  viewBox: '0 0 201 202',
  fill: 'none' as const,
  xmlns: 'http://www.w3.org/2000/svg',
  preserveAspectRatio: 'none' as const,
}

export function HeroComicFrameBorder() {
  return (
    <div className="hero-section-frame__comic-stack" aria-hidden>
      <svg className="hero-section-frame__comic-shadow" {...frameSvgProps}>
        <path
          d={FRAME_PATH}
          stroke="currentColor"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </svg>
      <svg className="hero-section-frame__comic-border" {...frameSvgProps}>
        <path
          d={FRAME_PATH}
          stroke="currentColor"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
