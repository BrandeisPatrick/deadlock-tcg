import { motion, AnimatePresence } from 'framer-motion';
import { palette, spring, text } from '../tokens';

interface Props {
  isMyTurn: boolean;
  busy: boolean;
  hasPending: boolean;
  autoPlay: boolean;
  onEnd: () => void;
  onCancel: () => void;
  onToggleAuto: () => void;
  /** 'table' mounts the cluster on a felt shelf attached to the table's
   *  front-right rim (desktop); 'tray' is the flat row used inside the
   *  mobile hand tray. */
  variant: 'table' | 'tray';
}

/**
 * The turn-control cluster: status lamp, End Turn, Auto toggle, Cancel.
 * Buttons keep constant labels (an action never doubles as a state
 * readout); the status line carries the changing state in a fixed-height
 * slot so nothing reflows.
 */
export function BoardControls({
  isMyTurn, busy, hasPending, autoPlay, onEnd, onCancel, onToggleAuto, variant,
}: Props) {
  const status = !isMyTurn
    ? { key: 'rival', label: "Rival's move", tone: palette.textDim, pulse: true }
    : busy
      ? { key: 'busy', label: 'Resolving…', tone: palette.accent, pulse: true }
      : autoPlay
        ? { key: 'auto', label: 'Auto-play on', tone: palette.success, pulse: false }
        // Idle on the player's turn: say so — the empty slot read as a
        // half-finished panel and the state was only implied by button color.
        : { key: 'yours', label: 'Your move', tone: palette.accent, pulse: false };
  const endTurnHot = isMyTurn && !busy;
  const onTable = variant === 'table';

  const cluster = (
    <>
      {/* Status / Cancel slot — fixed height so swapping between the
          status line and the Cancel pill never moves the buttons below. */}
      <div style={{
        height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        order: onTable ? undefined : 1,
      }}>
        <AnimatePresence mode="wait" initial={false}>
          {hasPending ? (
            <motion.button
              key="cancel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={spring.default}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -1 }}
              onClick={onCancel}
              style={{
                // Wine outline pill — the "back out" of an armed card/skill;
                // lives in the status slot because an armed action IS the
                // current state.
                background: 'rgba(138, 46, 42, 0.08)',
                border: `1px solid ${palette.danger}66`,
                borderRadius: 999,
                ...text.label, color: palette.danger,
                padding: '7px 16px',
                cursor: 'pointer',
              }}
            >Cancel</motion.button>
          ) : status ? (
            <motion.span
              key={status.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={spring.default}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                ...text.label, color: status.tone,
              }}
            >
              <motion.span
                aria-hidden
                animate={status.pulse ? { opacity: [0.35, 1, 0.35] } : { opacity: 1 }}
                transition={status.pulse
                  ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2 }}
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: status.tone,
                  boxShadow: `0 0 8px ${status.tone}`,
                }}
              />
              {status.label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {/* End Turn — constant label and fixed width; state lives in the
          colour (brass = press me, parchment = not now) and the status
          line above, never in the label. Stays clickable while busy: the
          tap is queued (Board fires it once the animation settles). */}
      <motion.button
        whileTap={isMyTurn ? { scale: 0.97, y: 2 } : undefined}
        whileHover={endTurnHot ? { scale: 1.03, y: -2 } : undefined}
        disabled={!isMyTurn}
        onClick={onEnd}
        animate={{ opacity: endTurnHot ? 1 : 0.75 }}
        transition={{ duration: 0.25 }}
        style={{
          width: 150,
          padding: '12px 0',
          borderRadius: 10,
          border: '1px solid #5a3f1c',
          background: endTurnHot
            ? 'linear-gradient(180deg, #e2ab42, #b07825 55%, #955f19)'
            : 'linear-gradient(180deg, #e8d8b2, #d9c497)',
          boxShadow: endTurnHot
            ? '0 3px 0 #6b4716, 0 7px 16px rgba(40, 20, 0, 0.35), inset 0 1px 0 rgba(255, 240, 200, 0.7)'
            : 'inset 0 1px 0 rgba(255, 250, 230, 0.5), 0 1px 3px rgba(40, 20, 0, 0.2)',
          ...text.label,
          textAlign: 'center',
          color: endTurnHot ? '#241503' : palette.textDim,
          textShadow: endTurnHot ? '0 1px 0 rgba(255, 235, 180, 0.45)' : undefined,
          cursor: isMyTurn ? (busy ? 'progress' : 'pointer') : 'default',
          order: onTable ? undefined : 2,
        }}
      >End Turn</motion.button>

      {/* Auto-play toggle — quiet ghost button with a state lamp; the dot
          goes forest-green while the AI is driving your turns. */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={{ y: -1 }}
        onClick={onToggleAuto}
        title={autoPlay
          ? 'Auto-play on — click to take control'
          : 'Auto-play off — click to let the AI play'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: autoPlay ? 'rgba(74, 112, 48, 0.12)' : 'transparent',
          border: `1px solid ${autoPlay ? `${palette.success}88` : 'rgba(90, 63, 28, 0.28)'}`,
          borderRadius: 999,
          ...text.label,
          color: autoPlay ? palette.success : palette.textFaint,
          padding: '6px 12px',
          cursor: 'pointer',
          order: onTable ? undefined : 0,
        }}
      >
        <span aria-hidden style={{
          width: 7, height: 7, borderRadius: '50%',
          background: autoPlay ? palette.success : 'rgba(90, 63, 28, 0.3)',
          boxShadow: autoPlay ? `0 0 8px ${palette.success}aa` : undefined,
        }} />
        Auto
      </motion.button>
    </>
  );

  if (!onTable) {
    // Mobile hand-tray row: Auto · status · End Turn, thumb-side last.
    // pointerEvents:auto — the tray shell above is pointer-transparent.
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: 'flex-end',
        paddingRight: 8,
        pointerEvents: 'auto',
      }}>
        {cluster}
      </div>
    );
  }

  // Desktop: a felt shelf pinned to the main column's bottom-right corner —
  // same inlay material as the tabletop, mahogany edge, so the controls
  // still read as table furniture.
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7,
      padding: '8px 12px 10px',
      background: 'linear-gradient(180deg, #dbc294, #d0b888 70%, #c6ad7c)',
      border: '1px solid #5a3f1c',
      borderRadius: 12,
      boxShadow: [
        'inset 0 4px 8px rgba(70, 45, 12, 0.28)',
        'inset 0 -1px 0 rgba(255, 244, 214, 0.35)',
        '0 16px 30px -8px rgba(40, 20, 0, 0.45)',
      ].join(', '),
    }}>
      {cluster}
    </div>
  );
}
