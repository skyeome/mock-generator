/**
 * Google Ad Placement API type definitions
 * @see https://developers.google.com/ad-placement/apis
 */

export type AdBreakType = 'preroll' | 'start' | 'pause' | 'next' | 'browse' | 'reward';

export type BreakFormat = 'interstitial' | 'reward';

export type BreakStatus =
  | 'notReady'
  | 'timeout'
  | 'invalid'
  | 'error'
  | 'noAdPreloaded'
  | 'frequencyCapped'
  | 'ignored'
  | 'other'
  | 'dismissed'
  | 'viewed';

export interface PlacementInfo {
  breakType: AdBreakType;
  breakName: string;
  breakFormat: BreakFormat;
  breakStatus: BreakStatus;
}

export interface AdBreakConfig {
  type: AdBreakType;
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  beforeReward?: (showAdFn: () => void) => void;
  adDismissed?: () => void;
  adViewed?: () => void;
  adBreakDone?: (placementInfo: PlacementInfo) => void;
}

export interface AdConfigParams {
  preloadAdBreaks?: 'on' | 'auto';
  sound?: 'on' | 'off';
  onReady?: () => void;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
    adBreak: (config: AdBreakConfig) => void;
    adConfig: (config: AdConfigParams) => void;
  }
}
