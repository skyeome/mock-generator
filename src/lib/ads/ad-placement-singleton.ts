interface AdPlacementState {
  configured: boolean;
  ready: boolean;
  listeners: Array<() => void>;
}

const STATE_KEY = '__ad_placement_state__';

function getState(): AdPlacementState {
  if (typeof globalThis === 'undefined') {
    return { configured: false, ready: false, listeners: [] };
  }

  const win = globalThis as unknown as Record<string, unknown>;
  if (!win[STATE_KEY]) {
    win[STATE_KEY] = { configured: false, ready: false, listeners: [] };
  }

  return win[STATE_KEY] as AdPlacementState;
}

export function ensureAdConfigInitialized(): void {
  if (typeof window === 'undefined' || !window.adConfig) return;

  const state = getState();
  if (state.configured) return;

  state.configured = true;

  window.adConfig({
    preloadAdBreaks: 'on',
    sound: 'off',
    onReady: () => {
      state.ready = true;
      for (const listener of state.listeners) {
        listener();
      }
      state.listeners = [];
    },
  });
}

export function onAdReady(cb: () => void): () => void {
  const state = getState();

  if (state.ready) {
    cb();
    return () => {};
  }

  state.listeners.push(cb);

  return () => {
    const idx = state.listeners.indexOf(cb);
    if (idx !== -1) {
      state.listeners.splice(idx, 1);
    }
  };
}
