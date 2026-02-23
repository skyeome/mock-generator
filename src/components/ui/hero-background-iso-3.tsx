"use client";

import { useId } from "react";

export function HeroBackgroundIsoLayers() {
  const rawId = useId();
  const idStr = rawId.replace(/:/g, "");

  // Layers mapping architectural/tech stack concepts overlapping in 3D
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">
      {/* Central glow */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-blue-600/10 blur-[130px]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`mask-grad-${idStr}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id={`mask-${idStr}`}>
            <rect
              width="1000"
              height="1000"
              fill={`url(#mask-grad-${idStr})`}
            />
          </mask>

          {/* Tech Grid Pattern */}
          <pattern
            id={`layer-grid-${idStr}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 L 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/20"
            />
          </pattern>
        </defs>

        <g mask={`url(#mask-${idStr})`}>
          <g transform="translate(500, 500) scale(1, 0.5) rotate(45)">
            {/* Layer 1: Base Data Layer (Bottom) */}
            <g transform="translate(0, 0)">
              <rect
                x="-300"
                y="-300"
                width="600"
                height="600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="10 10"
                className="text-white/20"
              />
              <rect
                x="-300"
                y="-300"
                width="600"
                height="600"
                fill={`url(#layer-grid-${idStr})`}
              />
              {/* Animated scanning bar on layer 1 */}
              <line
                x1="-300"
                y1="-300"
                x2="300"
                y2="-300"
                stroke="currentColor"
                strokeWidth="3"
                className="text-blue-500 opacity-40"
              >
                <animate
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,600; 0,0"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </line>
            </g>

            {/* Connecting abstract pillars between layer 1 and 2 */}
            <g>
              {[-300, 300].map((x) =>
                [-300, 300].map((y) => (
                  <line
                    key={`p1-${x}-${y}`}
                    x1={x}
                    y1={y}
                    x2={x + 150}
                    y2={y + 150}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-blue-500/30"
                  />
                )),
              )}
            </g>

            {/* Layer 2: API / Logic Layer (Middle) */}
            <g transform="translate(0, 0)">
              {/* Translate Y in 2D space maps to moving UP in the isometric projection after the transform, but we must use SVG transform matrix to do it right. 
                  However, shifting x and y identically moves straight UP in the isometric view! */}
              <g transform="translate(150, 150)">
                <rect
                  x="-250"
                  y="-250"
                  width="500"
                  height="500"
                  fill="black"
                  fillOpacity="0.6"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-blue-500"
                />
                <rect
                  x="-200"
                  y="-200"
                  width="400"
                  height="400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-white/40"
                />
                {/* Circuit logic shapes */}
                <path
                  d="M -150 -150 L 0 -150 L 0 0 L 150 0 L 150 150"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-blue-500"
                >
                  <animate
                    attributeName="opacity"
                    values="0.3;1;0.3"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
                <path
                  d="M 150 -150 L 0 -150 L 0 50 L -150 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white/60"
                >
                  <animate
                    attributeName="opacity"
                    values="0.2;0.8;0.2"
                    dur="4s"
                    repeatCount="indefinite"
                    begin="1s"
                  />
                </path>
              </g>
            </g>

            {/* Connecting abstract pillars between layer 2 and 3 */}
            <g>
              {[-100, 400].map((x) =>
                [-100, 400].map((y) => (
                  <line
                    key={`p2-${x}-${y}`}
                    x1={x}
                    y1={y}
                    x2={x + 150}
                    y2={y + 150}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-white/20"
                  />
                )),
              )}
            </g>

            {/* Layer 3: Presentation UI Layer (Top) */}
            <g transform="translate(300, 300)">
              <rect
                x="-200"
                y="-200"
                width="400"
                height="400"
                fill="black"
                fillOpacity="0.8"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              />
              {/* Topographic/UI lines inside top layer */}
              <rect
                x="-180"
                y="-180"
                width="360"
                height="40"
                fill="currentColor"
                className="text-blue-500/20"
              />
              <rect
                x="-180"
                y="-120"
                width="100"
                height="10"
                fill="currentColor"
                className="text-white/80"
              />
              <rect
                x="-180"
                y="-90"
                width="200"
                height="10"
                fill="currentColor"
                className="text-white/40"
              />
              <rect
                x="-180"
                y="-60"
                width="150"
                height="10"
                fill="currentColor"
                className="text-white/40"
              />

              <rect
                x="0"
                y="-120"
                width="160"
                height="160"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-500"
              />
              <rect
                x="20"
                y="-100"
                width="120"
                height="120"
                fill="currentColor"
                className="text-blue-500/10"
              />

              {/* Floating cursor/pointer */}
              <g transform="translate(-100, 50)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="-100,50; 50, -50; -100,50"
                  dur="5s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                />
                <path
                  d="M 0 0 L 15 30 L 20 20 L 30 15 Z"
                  fill="currentColor"
                  stroke="black"
                  strokeWidth="1"
                  className="text-white"
                />
              </g>
            </g>

            {/* Floating particles around the structure */}
            <g fill="currentColor" className="text-blue-500">
              <circle cx="-100" cy="200" r="4">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -50,-50; 0,0"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="400" cy="-50" r="3">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 30,30; 0,0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="200" cy="500" r="5">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 40,-20; 0,0"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        </g>
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-background to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[20%] bg-linear-to-b from-background to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[20%] bg-linear-to-r from-background to-transparent" />
    </div>
  );
}
