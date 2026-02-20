'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PlacementInfo } from '@/lib/types';
import { ensureAdConfigInitialized, onAdReady } from '@/lib/ads/ad-placement-singleton';

type RewardedAdState = 'idle' | 'prompt' | 'watching' | 'completed' | 'dismissed' | 'error';

interface UseRewardedAdOptions {
  name?: string;
}

interface UseRewardedAdReturn {
  requestRewardedAd: () => Promise<boolean>;
  adState: RewardedAdState;
  isAdReady: boolean;
  resetAdState: () => void;
}

export function useRewardedAd(options: UseRewardedAdOptions = {}): UseRewardedAdReturn {
  const { name = 'generate_mock_data' } = options;
  const [adState, setAdState] = useState<RewardedAdState>('idle');
  const [isAdReady, setIsAdReady] = useState(false);
  const resolveRef = useRef<((granted: boolean) => void) | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const finalize = useCallback((granted: boolean, nextState: RewardedAdState) => {
    if (!resolveRef.current) return;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAdState(nextState);
    resolveRef.current(granted);
    resolveRef.current = null;
  }, []);

  useEffect(() => {
    ensureAdConfigInitialized();
    return onAdReady(() => setIsAdReady(true));
  }, []);

  const requestRewardedAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.adBreak) {
        resolve(true);
        return;
      }

      if (resolveRef.current) {
        resolve(false);
        return;
      }

      resolveRef.current = resolve;
      const startedAt = performance.now();

      timeoutRef.current = window.setTimeout(() => {
        console.info('[ads] rewarded timed out; proceeding', {
          name,
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        finalize(true, 'idle');
      }, 12000);

      try {
        window.adBreak({
          type: 'reward',
          name,
          beforeAd: () => {
            setAdState('watching');
          },
          afterAd: () => {},
          beforeReward: (showAdFn: () => void) => {
            setAdState('prompt');
            showAdFn();
          },
          adDismissed: () => {
            finalize(false, 'dismissed');
          },
          adViewed: () => {
            finalize(true, 'completed');
          },
          adBreakDone: (placementInfo: PlacementInfo) => {
            if (!resolveRef.current) return;

            if (placementInfo.breakStatus === 'viewed') {
              finalize(true, 'completed');
              return;
            }

            if (placementInfo.breakStatus === 'dismissed') {
              finalize(false, 'dismissed');
              return;
            }

            console.info('[ads] rewarded unavailable; proceeding', {
              name,
              breakStatus: placementInfo.breakStatus,
              elapsedMs: Math.round(performance.now() - startedAt),
            });
            finalize(true, 'idle');
          },
        });
      } catch (error) {
        console.info('[ads] adBreak threw; proceeding', { name, error });
        finalize(true, 'idle');
      }
    });
  }, [finalize, name]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      resolveRef.current = null;
    };
  }, []);

  const resetAdState = useCallback(() => {
    setAdState('idle');
  }, []);

  return { requestRewardedAd, adState, isAdReady, resetAdState };
}
