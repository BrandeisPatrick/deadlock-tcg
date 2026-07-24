import { motion } from 'framer-motion';
import type { TargetFilter } from '@/abilities';
import { palette, spring, text } from '../tokens';

interface Props {
  title: string;
  desc: string;
  filter: TargetFilter;
  onCancel: () => void;
  /** Extra right-edge inset (px) — the open side panel's width on desktop,
   *  so the banner centres over the visible board instead of the full
   *  viewport (where its right end slides under the panel sheet). */
  rightInset?: number;
}

const TARGET_LABELS: Record<TargetFilter, string> = {
  noTarget: 'No Target',
  self: 'Self',
  allyAny: 'Any Ally',
  allyHero: 'Ally Hero',
  enemyAny: 'Any Enemy',
  enemyHero: 'Enemy Hero',
  enemyActive: 'Enemy Active',
  anyBoard: 'Any Hero',
};

export function TargetingOverlay({ title, desc, filter, onCancel, rightInset = 0 }: Props) {
  // Anchor the banner AWAY from the rows it asks the player to tap: ally
  // targeting docks under the rival's hand (your rows stay clear), enemy
  // targeting docks above your hand (the rival's rows stay clear).
  const anchorTop = filter === 'allyAny' || filter === 'allyHero' || filter === 'self';
  return (
    // Outer strip: spans the VISIBLE board area (viewport minus the open
    // panel via rightInset). Only left+right are set — adding a width would
    // over-constrain the box and CSS silently drops `right`, which is how
    // the pill used to end up centred on the full viewport with its tail
    // under the panel sheet. The pill centres inside via flex and may
    // shrink below its natural width (the text span ellipsizes).
    <div style={{
      position: 'fixed',
      left: 16, right: 16 + rightInset,
      ...(anchorTop
        ? { top: 14 }
        : { bottom: 'calc(220px + env(safe-area-inset-bottom))' }),
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 50,
    }}>
    <motion.div
      initial={{ opacity: 0, y: anchorTop ? -20 : 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: anchorTop ? -10 : 10, scale: 0.96 }}
      transition={spring.snappy}
      style={{
        // Single-line strip: the old three-row card was ~110px tall and
        // buried a whole board row (including rows that can hold targets).
        maxWidth: 'min(680px, 100%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        pointerEvents: 'auto',
        background: palette.bg1,
        border: `2px solid ${palette.success}`,
        borderRadius: 999,
        padding: '7px 8px 7px 8px',
        boxShadow: `0 10px 26px rgba(40, 20, 0, 0.32), 0 0 22px ${palette.success}55`,
      }}
    >
      <span style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '4px 10px',
        background: `${palette.success}22`,
        border: `1px solid ${palette.success}66`,
        borderRadius: 999,
        ...text.label, color: palette.success,
        whiteSpace: 'nowrap',
      }}>
        <span aria-hidden>◎</span>
        <span>{TARGET_LABELS[filter]}</span>
      </span>

      <span style={{
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...text.body,
        color: palette.textDim,
      }}>
        <span style={{ ...text.label, color: palette.text }}>{title}</span>
        {desc ? <> — {desc}</> : null}
        <span style={{ color: palette.textFaint }}> · tap or drag onto a glowing target</span>
      </span>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={onCancel}
        aria-label="Cancel"
        title="Cancel"
        style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28,
          background: `${palette.danger}18`,
          border: `1px solid ${palette.danger}88`,
          borderRadius: '50%',
          cursor: 'pointer',
          ...text.label, color: palette.danger,
          lineHeight: 1,
        }}
      >
        ✕
      </motion.button>
    </motion.div>
    </div>
  );
}
