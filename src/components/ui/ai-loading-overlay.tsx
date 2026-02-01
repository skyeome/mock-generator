'use client';

import { useEffect, useState } from 'react';

interface AILoadingOverlayProps {
  isVisible: boolean;
  onCancel?: () => void;
}

type AnalysisStep = {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
};

const initialSteps: AnalysisStep[] = [
  { id: 1, label: 'Parsing JSON structure', status: 'pending' },
  { id: 2, label: 'Detecting field semantics', status: 'pending' },
  { id: 3, label: 'Mapping to data generators', status: 'pending' },
  { id: 4, label: 'Preparing mock data', status: 'pending' },
];

export function AILoadingOverlay({ isVisible, onCancel }: AILoadingOverlayProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);

  // Animate through steps
  useEffect(() => {
    if (!isVisible) {
      setSteps(initialSteps);
      setCurrentStep(0);
      return;
    }

    // Start with first step active
    setSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i === 0 ? 'active' : 'pending'
    })));
    setCurrentStep(1);

    // Progress through steps
    const intervals = [800, 1200, 600, 400];
    let step = 0;

    const progressStep = () => {
      if (step >= intervals.length - 1) return;

      step++;
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i < step ? 'completed' : i === step ? 'active' : 'pending'
      })));
      setCurrentStep(step + 1);
    };

    const timers = intervals.slice(0, -1).map((delay, i) =>
      setTimeout(progressStep, intervals.slice(0, i + 1).reduce((a, b) => a + b, 0))
    );

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-loading-title"
    >
      <div className="relative w-full max-w-md mx-4 p-6 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-emerald-500/10">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

        {/* AI Icon with pulse animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-emerald-500/20 rounded-full" style={{ animationDuration: '2s' }} />
            <div className="relative w-16 h-16 flex items-center justify-center bg-zinc-800 rounded-full border border-emerald-500/30">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0v4.25a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 18.75V14.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2
          id="ai-loading-title"
          className="text-xl font-semibold text-center text-zinc-100 mb-2"
        >
          Analyzing Schema…
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-center text-zinc-400 mb-6">
          AI is detecting field semantics for contextual data generation
        </p>

        {/* Progress steps */}
        <div
          className="space-y-3 mb-6"
          role="status"
          aria-live="polite"
          aria-label={`Step ${currentStep} of 4`}
        >
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-all duration-300 ${
                step.status === 'pending' ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {step.status === 'completed' && (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {step.status === 'active' && (
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                )}
                {step.status === 'pending' && (
                  <div className="w-4 h-4 rounded-full bg-zinc-600" />
                )}
              </div>

              {/* Label */}
              <span className={`text-sm ${
                step.status === 'completed' ? 'text-emerald-400' :
                step.status === 'active' ? 'text-zinc-100' :
                'text-zinc-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Reduced motion support */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-ping,
          .animate-spin {
            animation: none;
          }
          .animate-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
