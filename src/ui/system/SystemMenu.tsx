import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { palette, fonts, spring, text } from '../tokens';
import { GameButton } from '../chrome';
import { useSettings, updateSettings, APP_STORAGE_KEYS, type AppSettings } from '@/storage/settings';

/**
 * Persistent system layer — the one piece of chrome that exists on every
 * screen. A brass gear pinned to the top-right corner opens a pause-style
 * system menu: combat tempo, context-aware exit, save-data reset.
 * Mounted once in Root, OUTSIDE the screen transition wrapper, so it never
 * fades or moves during navigation.
 */
export function SystemLayer({ screen, onExitToMenu, exitLabel }: {
  /** Current view.screen from Root — drives which exit action shows. */
  screen: string;
  /** Leave the current context (concede a match / back to title). */
  onExitToMenu: () => void;
  /** Label for the exit action; empty string hides it (start screen). */
  exitLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  const [armReset, setArmReset] = useState(false);

  // Re-disarm the destructive reset whenever the menu closes.
  useEffect(() => { if (!open) setArmReset(false); }, [open]);

  // Escape toggles the menu — the universal pause gesture. Nothing else in
  // the app binds Escape (verified), so claiming it globally is additive;
  // if an overlay ever needs the key first it should stopPropagation.
  // Ignore the key while typing in an input (deck name field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      setOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Fullscreen — tracked from the document so the toggle reflects reality
  // even when the user exits with the browser's own Esc handling.
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && !!document.fullscreenElement,
  );
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function resetAll() {
    if (!armReset) { setArmReset(true); return; }
    for (const key of APP_STORAGE_KEYS) {
      try { localStorage.removeItem(key); } catch {}
    }
    // Full reload back to the title so every in-memory store re-seeds.
    window.location.href = import.meta.env.BASE_URL ?? '/';
  }

  return (
    <>
      {/* Gear — always visible, always in the same corner. */}
      <motion.button
        aria-label="System menu"
        title="Menu (Esc)"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08, rotate: 24 }}
        whileTap={{ scale: 0.92 }}
        transition={spring.snappy}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 130,
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #52381a, #38250e)',
          border: '1px solid rgba(235, 205, 145, 0.4)',
          boxShadow: 'inset 0 1px 0 rgba(255, 226, 170, 0.3), 0 3px 8px rgba(40, 20, 0, 0.4)',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <GearIcon />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 125,
              background: 'rgba(58, 38, 12, 0.4)',
              backdropFilter: 'blur(7px)',
              WebkitBackdropFilter: 'blur(7px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } }}
              transition={spring.default}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: 'min(400px, 92vw)',
                borderRadius: 14,
                background: `linear-gradient(180deg, ${palette.bg2}, ${palette.bg1} 30%, #e6d4ab)`,
                border: '1px solid #5a3f1c',
                boxShadow: [
                  '0 24px 60px rgba(40, 20, 0, 0.45)',
                  'inset 0 1px 0 rgba(255, 244, 214, 0.7)',
                ].join(', '),
                padding: '20px 22px 22px',
              }}
            >
              {/* Brass keyline — same ledger framing as panels and table. */}
              <div aria-hidden style={{
                position: 'absolute',
                inset: 4,
                borderRadius: 10,
                border: '1px solid rgba(176, 120, 37, 0.35)',
                pointerEvents: 'none',
              }} />

              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                paddingBottom: 12,
                borderBottom: `1px solid ${palette.borderStrong}`,
                boxShadow: '0 1px 0 rgba(255, 244, 214, 0.55)',
              }}>
                <span style={{
                  fontFamily: fonts.display,
                  fontSize: 22,
                  color: palette.text,
                  textShadow: '0 1px 0 rgba(255, 244, 214, 0.6)',
                }}>
                  System
                </span>
                <span style={{ ...text.label, color: palette.textFaint }}>v0.1</span>
              </div>

              {/* Combat tempo */}
              <div style={{ padding: '16px 0 4px' }}>
                <div style={{ ...text.label, color: palette.textDim, marginBottom: 8 }}>
                  Combat speed
                </div>
                <div style={{
                  display: 'flex',
                  gap: 6,
                  padding: 4,
                  borderRadius: 10,
                  background: 'linear-gradient(180deg, rgba(84, 58, 22, 0.14), rgba(84, 58, 22, 0.08))',
                  border: '1px solid rgba(84, 58, 22, 0.32)',
                  boxShadow: 'inset 0 2px 6px rgba(70, 45, 12, 0.25)',
                }}>
                  {([1, 1.5, 2] as AppSettings['combatSpeed'][]).map((speed) => {
                    const active = settings.combatSpeed === speed;
                    return (
                      <button
                        key={speed}
                        onClick={() => updateSettings({ combatSpeed: speed })}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          borderRadius: 7,
                          border: active ? '1px solid #5a3f1c' : '1px solid transparent',
                          background: active
                            ? 'linear-gradient(180deg, #e2ab42, #b07825 55%, #955f19)'
                            : 'transparent',
                          color: active ? '#241503' : palette.textDim,
                          textShadow: active ? '0 1px 0 rgba(255, 235, 180, 0.45)' : undefined,
                          boxShadow: active
                            ? 'inset 0 1px 0 rgba(255, 240, 200, 0.7), 0 2px 5px rgba(40, 20, 0, 0.25)'
                            : undefined,
                          ...text.label,
                          fontVariantNumeric: 'tabular-nums',
                          cursor: 'pointer',
                        }}
                      >
                        {speed}×
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display */}
              <div style={{ padding: '14px 0 4px' }}>
                <div style={{ ...text.label, color: palette.textDim, marginBottom: 8 }}>
                  Display
                </div>
                <button
                  onClick={toggleFullscreen}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, rgba(84, 58, 22, 0.14), rgba(84, 58, 22, 0.08))',
                    border: '1px solid rgba(84, 58, 22, 0.32)',
                    boxShadow: 'inset 0 2px 6px rgba(70, 45, 12, 0.25)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ ...text.label, color: palette.text }}>Fullscreen</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 7,
                    border: '1px solid #5a3f1c',
                    background: isFullscreen
                      ? 'linear-gradient(180deg, #e2ab42, #b07825 55%, #955f19)'
                      : 'rgba(84, 58, 22, 0.12)',
                    color: isFullscreen ? '#241503' : palette.textDim,
                    textShadow: isFullscreen ? '0 1px 0 rgba(255, 235, 180, 0.45)' : undefined,
                    boxShadow: isFullscreen
                      ? 'inset 0 1px 0 rgba(255, 240, 200, 0.7), 0 2px 5px rgba(40, 20, 0, 0.25)'
                      : 'inset 0 1px 2px rgba(70, 45, 12, 0.25)',
                    ...text.label,
                  }}>
                    {isFullscreen ? 'On' : 'Off'}
                  </span>
                </button>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '16px 0 0',
              }}>
                {exitLabel && (
                  <GameButton
                    variant={screen === 'match' ? 'wine' : 'parchment'}
                    onClick={() => { setOpen(false); onExitToMenu(); }}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    {exitLabel}
                  </GameButton>
                )}
                <GameButton
                  variant="wine"
                  onClick={resetAll}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  {armReset ? 'Tap again to erase everything' : 'Reset save data'}
                </GameButton>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: `1px solid ${palette.border}`,
                ...text.body,
                fontSize: 11,
                color: palette.textFaint,
                textAlign: 'center',
              }}>
                A fan-made tabletop adaptation · not affiliated with Valve
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden>
      <path
        fill="#e3c07f"
        d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm9 4.94v-2.68l-2.37-.6a6.9 6.9 0 0 0-.68-1.64l1.25-2.1-1.9-1.9-2.1 1.26a6.9 6.9 0 0 0-1.64-.68L13.34 3h-2.68l-.6 2.37a6.9 6.9 0 0 0-1.64.68l-2.1-1.25-1.9 1.9 1.26 2.1a6.9 6.9 0 0 0-.68 1.63L3 10.66v2.68l2.37.6c.15.58.38 1.13.68 1.64l-1.25 2.1 1.9 1.9 2.1-1.26c.51.3 1.06.53 1.63.68l.61 2.37h2.68l.6-2.37a6.9 6.9 0 0 0 1.64-.68l2.1 1.25 1.9-1.9-1.26-2.1c.3-.51.53-1.06.68-1.63l2.37-.61Z"
      />
    </svg>
  );
}
