import { motion, AnimatePresence } from 'framer-motion';
import type { CardInstance } from '@/engine/types';
import { palette, spring, text } from '../tokens';

interface Props {
  cards: CardInstance[];
}

// Mirror of the player's Hand fanning math, but inverted: cards open downward
// from a top anchor, so they look like an opponent's hand seen across the table.
function fanRotation(i: number, total: number): number {
  if (total <= 2) return 0;
  const center = (total - 1) / 2;
  const offset = i - center;
  const max = Math.min(6, 18 / total);
  return -offset * max;
}
function fanY(i: number, total: number): number {
  if (total <= 2) return 0;
  const center = (total - 1) / 2;
  const offset = Math.abs(i - center);
  return -Math.min(offset * offset * 1.6, 18);
}
function cardOverlap(total: number): number {
  if (total <= 2) return 14;
  if (total <= 3) return 8;
  if (total <= 4) return -8;
  if (total <= 5) return -22;
  if (total <= 6) return -38;
  if (total <= 7) return -50;
  return -60;
}

const CARD_W = 64;
const CARD_H = 92;

export function OpponentHand({ cards }: Props) {
  const total = cards.length;
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      gap: 0,
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '4px 0 8px',
      minHeight: CARD_H + 4,
      perspective: 1200,
      // Purely decorative strip — never intercept clicks meant for the
      // board rows it can overlap.
      pointerEvents: 'none',
    }}>
      {/* Ambient occlusion behind the fan — a soft pool of shade where the
          rival's cards meet the table's far rim, so the dark backs read as
          resting there instead of pasted on the parchment. Painted before
          the cards; their transforms stack them above it. */}
      {total > 0 && (
        <div aria-hidden style={{
          position: 'absolute',
          left: '50%',
          bottom: -6,
          width: Math.min(560, total * (CARD_W + 8) + 120),
          height: 54,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse 50% 100% at 50% 100%, rgba(50, 30, 8, 0.22), rgba(50, 30, 8, 0.09) 55%, transparent 78%)',
          filter: 'blur(2px)',
        }} />
      )}
      {total === 0 && (
        <div style={{ ...text.label, color: palette.textFaint, padding: '20px 0' }}>
          Rival — no cards in hand
        </div>
      )}
      <AnimatePresence>
        {cards.map((c, i) => {
          const rot = fanRotation(i, total);
          const y = fanY(i, total);
          return (
            <motion.div
              key={c.iid}
              layoutId={`oppcard-${c.iid}`}
              layout
              initial={{ opacity: 0, y: -50, scale: 0.6 }}
              animate={{ opacity: 1, y, scale: 1, rotate: rot }}
              exit={{ opacity: 0, y: 60, scale: 0.5, transition: { duration: 0.25 } }}
              transition={spring.default}
              style={{
                marginLeft: i === 0 ? 0 : cardOverlap(total),
                transformOrigin: 'top center',
                zIndex: i,
                width: CARD_W,
                height: CARD_H,
              }}
            >
              <CardBack />
            </motion.div>
          );
        })}
      </AnimatePresence>
      {total > 0 && (
        // Inline chip beside the fan — the old absolutely-positioned counter
        // floated in dead space once the stage stopped spanning the viewport.
        <span style={{
          alignSelf: 'center',
          marginLeft: 14,
          display: 'inline-flex', alignItems: 'baseline', gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'rgba(58, 40, 16, 0.08)',
          border: '1px solid rgba(90, 63, 28, 0.28)',
        }}>
          <span style={{ ...text.label, fontSize: 11, color: palette.textDim }}>Hand</span>
          <span style={{ ...text.numeric, fontSize: 15, color: palette.text }}>{total}</span>
        </span>
      )}
    </div>
  );
}

function CardBack() {
  // Face-down hand stays dark — sealed envelopes on a parchment table.
  const back0 = '#3a2810';
  const back1 = '#1f1408';
  const brass = palette.accent;
  return (
    <div style={{
      width: '100%', height: '100%',
      borderRadius: 6,
      background: `
        linear-gradient(160deg, ${back0}, ${back1} 60%, #0e0905),
        radial-gradient(ellipse at 50% 30%, ${brass}22, transparent 60%)
      `,
      border: `1px solid #5a3f1c`,
      boxShadow: '0 4px 12px rgba(40, 20, 0, 0.45), inset 0 0 0 1px rgba(255, 220, 160, 0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Inner border */}
      <div style={{
        position: 'absolute', inset: 4,
        borderRadius: 4,
        border: `1px solid rgba(255, 220, 160, 0.08)`,
        pointerEvents: 'none',
      }} />
      {/* Centerpiece — hex glyph */}
      <svg viewBox="0 0 60 90" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="cb-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={brass} stopOpacity="0.5" />
            <stop offset="100%" stopColor={brass} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="30" cy="45" rx="22" ry="14" fill="url(#cb-glow)" />
        <g stroke={brass} strokeWidth="0.8" fill="none" opacity="0.7">
          <path d="M30 30 L46 39 L46 55 L30 64 L14 55 L14 39 Z" />
          <path d="M30 36 L40 42 L40 54 L30 60 L20 54 L20 42 Z" opacity="0.6" />
          <circle cx="30" cy="48" r="2.5" fill={brass} fillOpacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
