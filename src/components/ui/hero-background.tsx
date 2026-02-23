"use client";

import { useId } from "react";

export function HeroBackground() {
  const rawId = useId();
  const idStr = rawId.replace(/:/g, "");

  // Base isometric plane renderer
  const renderLayer = (
    translateY: string,
    delay: string,
    dur: string,
    content: React.ReactNode,
  ) => {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0,0; 0,${translateY}; 0,0`}
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />

        {/* Very clean base plane outline */}
        <path
          d="M 0 0 L 300 173.2 L 0 346.4 L -300 173.2 Z"
          fill="transparent"
          className="text-foreground opacity-20 dark:opacity-40"
          stroke="currentColor"
          strokeWidth="1"
        />

        {content}
      </g>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none ">
      {/* Premium subtle glows */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="absolute bottom-[20%] left-[30%] w-[300px] h-[300px] rounded-full bg-foreground/5 blur-[100px]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`mask-grad-${idStr}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.9" />
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
          <g transform="translate(500, 250)">
            {/* ---------------------------------------------------- */}
            {/* GLOBAL BACKGROUND GRID (Ultra Faint & Infinite) */}
            {/* ---------------------------------------------------- */}
            <g
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground opacity-10 dark:opacity-[0.05]"
            >
              {Array.from({ length: 81 }).map((_, i) => {
                const a = (i - 40) / 10; // -4 to +4
                return (
                  <g key={`bg-grid-${i}`}>
                    {/* Fixed 'a', varying 'b' from -4 to 4 */}
                    <path
                      d={`M ${300 * a + 1200} ${173.2 * a - 692.8} L ${300 * a - 1200} ${173.2 * a + 692.8}`}
                    />
                    {/* Fixed 'b', varying 'a' from -4 to 4 */}
                    <path
                      d={`M ${-1200 - 300 * a} ${-692.8 + 173.2 * a} L ${1200 - 300 * a} ${692.8 + 173.2 * a}`}
                    />
                  </g>
                );
              })}
            </g>
            {/* ---------------------------------------------------- */}
            {/* LAYER 1: Core / Storage (Bottom Layer) */}
            {/* ---------------------------------------------------- */}
            {renderLayer(
              "200",
              "0s",
              "10s",
              <g>
                {/* Sparse, elegant internal grid */}
                <g
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-foreground opacity-30 dark:opacity-30"
                >
                  <path d="M -150 86.6 L 150 259.8" />
                  <path d="M 0 173.2 L 300 0" />
                  <path d="M -150 259.8 L 150 86.6" />
                  <path d="M -300 173.2 L 0 346.4" />
                </g>

                {/* Abstract geometric memory banks */}
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-blue-500 opacity-40"
                >
                  <path d="M -100 173.2 L 0 230.9 L 100 173.2" />
                  <path
                    d="M -100 193.2 L 0 250.9 L 100 193.2"
                    className="opacity-50"
                  />
                </g>
              </g>,
            )}

            {/* Connecting Vertical Beams (Elegant & Thin) */}
            <g stroke="currentColor" className="text-blue-500 opacity-30">
              <path
                d="M 0 173.2 L 0 450"
                strokeWidth="0.5"
                strokeDasharray="4 8"
              />
              <path
                d="M -150 86.6 L -150 350"
                strokeWidth="1"
                className="text-foreground opacity-10"
              />
              <path
                d="M 150 259.8 L 150 450"
                strokeWidth="1"
                className="text-foreground opacity-10"
              />

              {/* Single high-speed data pulse */}
              <path
                d="M 0 173.2 L 0 450"
                strokeWidth="2"
                strokeDasharray="30 400"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="430;0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </g>

            {/* ---------------------------------------------------- */}
            {/* LAYER 2: Neural / Compute (Middle Layer) */}
            {/* ---------------------------------------------------- */}
            <g transform="translate(0, 100)">
              {renderLayer(
                "100",
                "0.5s",
                "10s",
                <g>
                  {/* Clean, mathematical circuit paths */}
                  <path
                    d="M -200 173.2 L -100 230.9 L 0 173.2 L 100 230.9 L 200 173.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-blue-500 opacity-50"
                  />
                  <path
                    d="M -100 115.5 L 0 173.2 L 100 115.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-foreground opacity-50 dark:opacity-50"
                  />

                  {/* Subtle pulsing nodes at intersections */}
                  {[
                    { x: -100, y: 230.9 },
                    { x: 0, y: 173.2 },
                    { x: 100, y: 230.9 },
                    { x: -100, y: 115.5 },
                    { x: 100, y: 115.5 },
                  ].map((node, i) => (
                    <g key={`mid-node-${i}`}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="2.5"
                        fill="currentColor"
                        className="text-foreground opacity-50 dark:opacity-20"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="8"
                        fill="currentColor"
                        className="text-blue-500 opacity-20"
                      >
                        <animate
                          attributeName="r"
                          values="2;10;2"
                          dur={`${3 + (i % 2)}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.4;0;0.4"
                          dur={`${3 + (i % 2)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  ))}

                  {/* Extremely subtle scanner line */}
                  <path
                    d="M -200 173.2 L 200 173.2"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-blue-500 opacity-20"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="-50,-28.8; 50,28.8; -50,-28.8"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>,
              )}
            </g>

            {/* Connecting Beams Layer 2 to 3 */}
            <g stroke="currentColor" className="text-foreground opacity-20">
              <path
                d="M -50 144.3 L -50 220"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
              <path
                d="M 50 202 L 50 280"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
            </g>

            {/* ---------------------------------------------------- */}
            {/* LAYER 3: Interface / Model (Top Layer) */}
            {/* ---------------------------------------------------- */}
            <g transform="translate(0, 0)">
              {renderLayer(
                "40",
                "1s",
                "10s",
                <g>
                  {/* Floating abstract geometry (No text or literal code) */}
                  <path
                    d="M 0 115.5 L 60 150 L 0 184.6 L -60 150 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-blue-500 opacity-70"
                  />
                  <path
                    d="M 0 115.5 L 60 150 L 0 184.6 L -60 150 Z"
                    fill="currentColor"
                    className="text-blue-500 opacity-5"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.05; 0.15; 0.05"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Focus reticles at the extreme corners */}
                  <g
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    className="text-foreground opacity-50 dark:opacity-50"
                  >
                    <path d="M -270 167.4 L -290 155.8 L -270 144.3" />
                    <path d="M 270 167.4 L 290 179 L 270 190.5" />
                    <path d="M -15 329 L 0 337.7 L 15 329" />
                    <path d="M -15 17.3 L 0 8.6 L 15 17.3" />
                  </g>
                </g>,
              )}
            </g>
          </g>
        </g>
      </svg>

      {/* Smooth fading gradients for the edges using semantic colors */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[30%] bg-linear-to-b from-background to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[20%] bg-linear-to-r from-background to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[20%] bg-linear-to-l from-background to-transparent" />
    </div>
  );
}
