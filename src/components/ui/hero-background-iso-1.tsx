"use client";

import { useId } from "react";

export function HeroBackgroundIsometricBlocks() {
  const rawId = useId();
  const idStr = rawId.replace(/:/g, "");

  // Generate isometric grid lines
  const gridLines = [];
  for (let i = -1000; i <= 2000; i += 60) {
    // Top-left to bottom-right
    gridLines.push(
      <path
        key={`tl-${i}`}
        d={`M ${i} 0 L ${i + 1000} 1000`}
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-white/10"
      />,
    );
    // Top-right to bottom-left
    gridLines.push(
      <path
        key={`tr-${i}`}
        d={`M ${i} 0 L ${i - 1000} 1000`}
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-white/10"
      />,
    );
  }

  // Define data for floating isometric "server" blocks
  const blocks = [
    {
      x: 300,
      y: 200,
      w: 60,
      h: 40,
      d: 80,
      delay: "0s",
      color: "text-blue-500",
    },
    { x: 500, y: 400, w: 120, h: 60, d: 40, delay: "2s", color: "text-white" },
    {
      x: 700,
      y: 150,
      w: 40,
      h: 40,
      d: 120,
      delay: "1s",
      color: "text-blue-500",
    },
    { x: 200, y: 600, w: 80, h: 80, d: 60, delay: "3s", color: "text-white" },
    {
      x: 800,
      y: 650,
      w: 60,
      h: 60,
      d: 80,
      delay: "1.5s",
      color: "text-blue-500",
    },
  ];

  // Helper to draw an isometric block (cube/prism)
  const renderIsometricBlock = (b: (typeof blocks)[0], index: number) => {
    // Iso angles are roughly 30 degrees. Path math:
    // Left face: Move to bottom center, line up-left, up, down-right, down
    // Right face: Move to bottom center, line up-right, up, down-left, down
    // Top face: Move to top center, line down-left, up-left, up-right, down-right
    return (
      <g
        key={`block-${index}`}
        className={`${b.color} opacity-80`}
        transform={`translate(${b.x}, ${b.y})`}
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`${b.x},${b.y}; ${b.x},${b.y - 15}; ${b.x},${b.y}`}
          dur="6s"
          begin={b.delay}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
        {/* Left Face (Darker) */}
        <path
          d={`M 0 0 L -${b.w} -${b.w * 0.58} L -${b.w} -${b.w * 0.58 + b.h} L 0 -${b.h} Z`}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Right Face (Medium) */}
        <path
          d={`M 0 0 L ${b.d} -${b.d * 0.58} L ${b.d} -${b.d * 0.58 + b.h} L 0 -${b.h} Z`}
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Top Face (Lighter) */}
        <path
          d={`M 0 -${b.h} L -${b.w} -${b.w * 0.58 + b.h} L ${b.d - b.w} -${(b.w + b.d) * 0.58 + b.h} L ${b.d} -${b.d * 0.58 + b.h} Z`}
          fill="currentColor"
          fillOpacity="0.4"
          stroke="currentColor"
          strokeWidth="1"
        />
      </g>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#050505]">
      {/* Soft Blue Center Glow */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`mask-grad-${idStr}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id={`mask-${idStr}`}>
            <rect
              width="1000"
              height="1000"
              fill={`url(#mask-grad-${idStr})`}
            />
          </mask>
        </defs>

        <g mask={`url(#mask-${idStr})`}>
          {/* Isometric Transform Group for Grid */}
          <g transform="translate(500, -200) scale(1, 0.58) rotate(45)">
            <g className="opacity-40">{gridLines}</g>

            {/* Animated Pulses on Grid */}
            <g fill="none" strokeWidth="2" className="text-blue-500 opacity-60">
              <path
                d="M 0 500 L 1000 500"
                stroke="currentColor"
                strokeDasharray="50 1500"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="1550;0"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M 500 0 L 500 1000"
                stroke="currentColor"
                strokeDasharray="80 1500"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;1580"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M 200 0 L 200 1000"
                stroke="currentColor"
                strokeDasharray="30 1500"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;1530"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>

          {/* Floating Isometric Objects (Drawn directly in SVG space without rotate/scale to keep crisp edges and control Z-index visually by Y position) */}
          {blocks.map(renderIsometricBlock)}
        </g>
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-linear-to-t from-background to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[20%] bg-linear-to-b from-background to-transparent" />
    </div>
  );
}
