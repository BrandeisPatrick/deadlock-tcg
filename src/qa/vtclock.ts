/**
 * Virtual-clock QA harness — freeze the app's sense of time and step it
 * manually. Inert unless the page is loaded with `?vtclock=1`.
 *
 * Why: judging animation frames (attack lunges, damage flashes, overlay
 * reveals) needs a paused clock — screenshots of a live clock always land
 * mid- or post-flight, and a hidden/occluded tab freezes rAF entirely while
 * game timers keep running, skipping whole animations between paints.
 *
 * With the flag on, rAF + timer time only advances when the console calls
 *   __vt.tick(ms)   // advance virtual time in 60fps frames
 * so any animation can be sampled at exact offsets. This module MUST be the
 * first import of main.tsx: framer-motion's frameloop captures the rAF
 * reference at module-evaluation time, so a later install is ignored.
 *
 * The overrides feed rAF callbacks virtual timestamps and virtualize
 * performance.now/Date.now plus >4ms timers (game AI delays, FX unmount
 * fuses) onto the same clock, so logic and animation stay in lockstep.
 * Sub-4ms timers stay real so scheduler/microtask-ish work keeps flowing.
 * CSS transitions/animations run on the compositor clock and are NOT
 * captured — drive those by real paints, or prefer framer for anything
 * that needs QA stepping.
 */
declare global {
  interface Window {
    __vt?: {
      now: () => number;
      tick: (ms?: number) => { vnow: number; rafPending: number; timersPending: number };
    };
    __slow?: {
      get: () => number;
      set: (factor: number) => number;
    };
  }
}

if (new URLSearchParams(window.location.search).get('vtclock') === '1') {
  // Route framer-motion onto its JS animation path: accelerated values
  // (opacity/transform keyframes) otherwise run as WAAPI on the compositor
  // clock, which this virtual clock cannot drive — in a hidden tab they
  // simply never render. framer feature-detects with
  // `Object.hasOwnProperty.call(Element.prototype, "animate")` on first use
  // and its WAAPI constructor is wrapped in try/catch with a JSAnimation
  // fallback, so removing the method up front is a supported downgrade.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (Element.prototype as any).animate;

  let now = performance.now();
  const rafQ = new Map<number, FrameRequestCallback>();
  let rafId = 1;
  type Timer = { at: number; cb: () => void };
  const timers = new Map<number, Timer>();
  // High ids so clearTimeout(realId) from pre-install code never collides.
  let timerId = 1_000_000;

  performance.now = () => now;
  const dateOffset = Date.now() - now;
  Date.now = () => Math.round(now + dateOffset);

  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    const id = rafId++;
    rafQ.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id: number) => { rafQ.delete(id); };

  const realSetTimeout = window.setTimeout.bind(window);
  const realClearTimeout = window.clearTimeout.bind(window);
  const realSetInterval = window.setInterval.bind(window);
  const realClearInterval = window.clearInterval.bind(window);

  window.setTimeout = ((cb: TimerHandler, ms = 0, ...args: unknown[]) => {
    if (typeof cb !== 'function' || ms <= 4) return realSetTimeout(cb as never, ms, ...args);
    const id = timerId++;
    timers.set(id, { at: now + ms, cb: () => (cb as (...a: unknown[]) => void)(...args) });
    return id;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((id?: number) => {
    if (id != null && timers.has(id)) timers.delete(id);
    else realClearTimeout(id);
  }) as typeof window.clearTimeout;

  window.setInterval = ((cb: TimerHandler, ms = 0, ...args: unknown[]) => {
    if (typeof cb !== 'function' || ms <= 4) return realSetInterval(cb as never, ms, ...args);
    const id = timerId++;
    const item: Timer = {
      at: now + ms,
      cb: () => {
        (cb as (...a: unknown[]) => void)(...args);
        item.at = now + ms;
        timers.set(id, item);
      },
    };
    timers.set(id, item);
    return id;
  }) as typeof window.setInterval;
  window.clearInterval = ((id?: number) => {
    if (id != null && timers.has(id)) timers.delete(id);
    else realClearInterval(id);
  }) as typeof window.clearInterval;

  window.__vt = {
    now: () => now,
    tick(ms = 16.667) {
      const target = now + ms;
      while (now < target - 1e-6) {
        now = Math.min(now + 16.667, target);
        // Due timers first (game logic mutates state), then the rAF frame
        // renders it — mirrors the real event loop's ordering.
        const due = [...timers.entries()]
          .filter(([, t]) => t.at <= now)
          .sort((a, b) => a[1].at - b[1].at);
        for (const [id, t] of due) {
          timers.delete(id);
          try { t.cb(); } catch (e) { console.error('[vtclock] timer callback threw', e); }
        }
        const frame = [...rafQ.values()];
        rafQ.clear();
        for (const cb of frame) {
          try { cb(now); } catch (e) { console.error('[vtclock] rAF callback threw', e); }
        }
      }
      return { vnow: Math.round(now), rafPending: rafQ.size, timersPending: timers.size };
    },
  };
  console.info('[vtclock] virtual clock installed — advance with __vt.tick(ms)');
}

// ---------------------------------------------------------------------------
// Slow-motion mode — `?vtslow=N` (e.g. vtslow=6): the app runs on the REAL
// clock but N× slower. Unlike vtclock (frozen clock, DOM-only sampling), the
// page keeps painting normally, so screenshots taken ~1/s act as a high-speed
// camera over animations that normally last a few hundred ms.
//
// Implementation: a piecewise-dilated timeline. performance.now/Date.now and
// rAF timestamps advance at realDelta / factor; setTimeout/setInterval delays
// are multiplied by the factor so game pacing (AI think, combat beats, reveal
// holds) stays in step with the dilated animations. WAAPI is disabled the
// same way as vtclock so no animation escapes onto the compositor's real-rate
// clock. The factor is runtime-adjustable via `__slow.set(N)` — play at 1×,
// switch to 6× just before the moment you want to film, back to 1× after.
// Pending timers keep the factor they were scheduled under; that skew is fine
// for QA. Ignored when vtclock is active (a frozen clock subsumes slow-mo).
if (
  new URLSearchParams(window.location.search).get('vtclock') !== '1' &&
  Number(new URLSearchParams(window.location.search).get('vtslow') ?? 0) > 1
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (Element.prototype as any).animate;

  let factor = Number(new URLSearchParams(window.location.search).get('vtslow'));
  const realNow = performance.now.bind(performance);
  let vNow = realNow();
  let lastReal = vNow;
  const dilatedNow = () => {
    const real = realNow();
    vNow += (real - lastReal) / factor;
    lastReal = real;
    return vNow;
  };
  performance.now = dilatedNow;
  const dateOffset = Date.now() - vNow;
  Date.now = () => Math.round(dilatedNow() + dateOffset);

  const realRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb: FrameRequestCallback) =>
    realRaf(() => cb(dilatedNow()));

  const realSetTimeout = window.setTimeout.bind(window);
  window.setTimeout = ((cb: TimerHandler, ms = 0, ...args: unknown[]) =>
    realSetTimeout(
      cb as never,
      typeof cb === 'function' && ms > 4 ? ms * factor : ms,
      ...args,
    )) as typeof window.setTimeout;
  const realSetInterval = window.setInterval.bind(window);
  window.setInterval = ((cb: TimerHandler, ms = 0, ...args: unknown[]) =>
    realSetInterval(
      cb as never,
      typeof cb === 'function' && ms > 4 ? ms * factor : ms,
      ...args,
    )) as typeof window.setInterval;

  window.__slow = {
    get: () => factor,
    set: (f: number) => {
      dilatedNow(); // settle vNow under the old factor first
      factor = Math.max(1, f);
      return factor;
    },
  };
  console.info(`[vtclock] slow-motion installed — ${factor}× (adjust with __slow.set(n))`);
}

export {};
