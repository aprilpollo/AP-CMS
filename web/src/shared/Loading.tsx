import { useTimeout } from "@/hooks"
import { useState } from "react"
import clsx from "clsx"

export type LoadingProps = {
  delay?: number
  className?: string
}

/**
 * Loading displays a moon-themed loading animation with an optional delay
 */
function Loading(props: LoadingProps) {
  const { delay = 0, className } = props
  const [showLoading, setShowLoading] = useState(!delay)

  useTimeout(() => {
    setShowLoading(true)
  }, delay)

  return (
    <div
      id="splash-screen"
      className={clsx(className, !showLoading ? "hidden" : "")}
    >
      <div
        className="moon-loader"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
         
        }}
      >
        <svg
          className="moon-svg"
          height="160"
          viewBox="-30 -20 260 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0a1020" />
              <stop offset="100%" stopColor="#050810" stopOpacity="0" />
            </radialGradient>

            {/* Moon gradient — stop colors driven by CSS vars */}
            <radialGradient id="moonGrad" cx="22%" cy="22%" r="78%">
              <stop offset="0%" style={{ stopColor: "var(--moon-0)" }} />
              <stop offset="30%" style={{ stopColor: "var(--moon-1)" }} />
              <stop offset="70%" style={{ stopColor: "var(--moon-2)" }} />
              <stop offset="100%" style={{ stopColor: "var(--moon-3)" }} />
            </radialGradient>

            <clipPath id="crescentClip">
              <circle cx="100" cy="100" r="48" />
            </clipPath>
            <clipPath id="orbitBack">
              <rect
                x="-20"
                y="-20"
                width="240"
                height="120"
                transform="rotate(-10 100 100)"
              />
            </clipPath>
            <clipPath id="orbitFront">
              <rect
                x="-20"
                y="100"
                width="240"
                height="130"
                transform="rotate(-10 100 100)"
              />
            </clipPath>
          </defs>

          {/* Background glow */}
          <circle
            cx="100"
            cy="100"
            r="96"
            style={{ opacity: "var(--bg-glow-opacity)" }}
          />

          {/* ── Orbit BACK line ── */}
          <g transform="rotate(-10 100 100)">
            <path
              d="M 210,100 A 110,42,0,0,0,-10,100"
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="9 6"
              style={{
                stroke: "var(--orbit-stroke)",
                opacity: "var(--orbit-back-op)",
              }}
            />
          </g>

          {/* ── Orbiting dots — BACK half ── */}
          <g clipPath="url(#orbitBack)">
            <circle r="9" style={{ fill: "var(--dot-yellow)" }}>
              <animateMotion dur="5s" repeatCount="indefinite">
                <mpath href="#orbitPath" />
              </animateMotion>
            </circle>
            <circle r="6" style={{ fill: "var(--dot-blue)" }}>
              <animateMotion dur="5s" repeatCount="indefinite" begin="-2.5s">
                <mpath href="#orbitPath" />
              </animateMotion>
            </circle>
          </g>

          {/* ── Crescent moon ── */}
          <g clipPath="url(#crescentClip)">
            <circle cx="100" cy="100" r="48" fill="url(#moonGrad)" />
            {/* <circle cx="121" cy="96"  r="42" style={{ fill: "var(--crescent-shadow)" }} /> */}
          </g>

          {/* Craters */}
          <circle cx="80" cy="96" r="6.5" fill="#484840" opacity="0.55" />
          <circle cx="88" cy="116" r="5" fill="#3c3c34" opacity="0.5" />
          <circle cx="73" cy="113" r="3.5" fill="#585850" opacity="0.6" />
          <circle cx="91" cy="80" r="4" fill="#404038" opacity="0.45" />

          {/* ── Orbit FRONT line ── */}
          <g transform="rotate(-10 100 100)">
            <path
              d="M -10,100 A 110,42,0,0,0,210,100"
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="9 6"
              style={{
                stroke: "var(--orbit-stroke)",
                opacity: "var(--orbit-front-op)",
              }}
            />
          </g>

          {/* ── Orbiting dots — FRONT half ── */}
          <g clipPath="url(#orbitFront)">
            <circle r="9" style={{ fill: "var(--dot-yellow)" }}>
              <animateMotion dur="5s" repeatCount="indefinite">
                <mpath href="#orbitPath" />
              </animateMotion>
            </circle>
            <circle r="6" style={{ fill: "var(--dot-blue)" }}>
              <animateMotion dur="5s" repeatCount="indefinite" begin="-2.5s">
                <mpath href="#orbitPath" />
              </animateMotion>
            </circle>
          </g>

          {/* Hidden orbit path */}
          <path
            id="orbitPath"
            d="M 210,100 A 110,42,0,1,1,-10,100 A 110,42,0,1,1,210,100"
            fill="none"
            stroke="none"
            transform="rotate(-10 100 100)"
          />

          {/* Twinkling stars */}
          <circle cx="130" cy="66" r="2.5" style={{ fill: "var(--star-a)" }}>
            <animate
              attributeName="opacity"
              values="1;0.15;1"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="140" cy="82" r="1.8" style={{ fill: "var(--star-b)" }}>
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur="2.3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="120" cy="56" r="1.4" style={{ fill: "var(--star-a)" }}>
            <animate
              attributeName="opacity"
              values="1;0.1;1"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="148" cy="98" r="1.2" style={{ fill: "var(--star-b)" }}>
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <span className="moon-loading-text" />
      </div>
    </div>
  )
}

export default Loading
