import { useState, useEffect } from 'react';

/**
 * Performance tier classification for adaptive rendering.
 * - 'high': Full visual effects, complex animations, high-resolution assets
 * - 'medium': Moderate effects, simplified animations
 * - 'low': Minimal effects, reduced motion, basic rendering
 */
export type PerformanceTier = 'high' | 'medium' | 'low';

/**
 * Detected device capabilities used to drive adaptive UI decisions
 * across the BoxJellyProt application (particle counts, blur effects,
 * WebGL molecule rendering, animation complexity).
 */
export interface DeviceCapabilities {
  /** Classified performance tier based on hardware heuristics */
  tier: PerformanceTier;
  /** Whether the browser supports CSS backdrop-filter (frosted-glass effects) */
  supportsBackdropFilter: boolean;
  /** Whether the browser supports WebGL (required for 3D protein rendering) */
  supportsWebGL: boolean;
  /** Whether the user has enabled the prefers-reduced-motion accessibility setting */
  prefersReducedMotion: boolean;
}

// ---------------------------------------------------------------------------
// Navigator extensions – these properties exist on modern Chromium browsers
// but are not part of the base TypeScript Navigator type.
// ---------------------------------------------------------------------------
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

// ---------------------------------------------------------------------------
// Helper functions (pure, no hooks – safe to call anywhere)
// ---------------------------------------------------------------------------

/**
 * Classify the device into a performance tier based on hardware signals.
 *
 * High: devicePixelRatio > 1 AND logical cores > 4 AND device memory >= 8 GB
 * Medium: logical cores > 2
 * Low: everything else (or SSR / missing APIs)
 */
function detectTier(): PerformanceTier {
  if (typeof window === 'undefined') {
    return 'low';
  }

  const dpr = window.devicePixelRatio ?? 1;
  const cores = navigator.hardwareConcurrency ?? 2;
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;

  if (dpr > 1 && cores > 4 && memory >= 8) {
    return 'high';
  }

  if (cores > 2) {
    return 'medium';
  }

  return 'low';
}

/**
 * Check whether the browser supports `backdrop-filter: blur(...)`.
 * Returns `false` during SSR.
 */
function checkBackdropFilter(): boolean {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') {
    return false;
  }

  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
}

/**
 * Check whether the browser can create a WebGL (1 or 2) rendering context.
 * This is required for Three.js-based protein visualisation.
 * Returns `false` during SSR.
 */
function checkWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    // Explicitly lose the context to free GPU resources immediately.
    if (gl && 'getExtension' in gl) {
      const loseCtx = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
      loseCtx?.loseContext();
    }

    return gl !== null;
  } catch {
    return false;
  }
}

/**
 * Query the current state of the `prefers-reduced-motion` media query.
 * Returns `true` (reduced motion preferred) during SSR as a safe default.
 */
function checkReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook that detects device hardware capabilities and user motion
 * preferences.  The returned {@link DeviceCapabilities} object updates
 * reactively when the user toggles their OS-level reduced-motion setting.
 *
 * @example
 * ```tsx
 * const { tier, supportsWebGL, prefersReducedMotion } = useDeviceCapability();
 *
 * return tier === 'low' || prefersReducedMotion
 *   ? <StaticMoleculeImage />
 *   : <Interactive3DMolecule />;
 * ```
 */
export function useDeviceCapability(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => ({
    tier: detectTier(),
    supportsBackdropFilter: checkBackdropFilter(),
    supportsWebGL: checkWebGL(),
    prefersReducedMotion: checkReducedMotion(),
  }));

  useEffect(() => {
    // SSR guard – matchMedia is not available on the server.
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setCapabilities((prev) => ({
        ...prev,
        prefersReducedMotion: event.matches,
      }));
    };

    // Modern browsers support addEventListener on MediaQueryList.
    // Safari < 14 only supports the deprecated addListener; we fall back
    // gracefully.
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      mediaQuery.addListener(handleChange);
    }

    // Re-detect all capabilities on mount in case the initial SSR render
    // produced different values from the actual client environment.
    setCapabilities({
      tier: detectTier(),
      supportsBackdropFilter: checkBackdropFilter(),
      supportsWebGL: checkWebGL(),
      prefersReducedMotion: mediaQuery.matches,
    });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return capabilities;
}
