import { motion } from 'framer-motion';
import { palette, fonts, spring, text } from '../tokens';

interface Props {
  isMyTurn: boolean;
  busy: boolean;
  hasPending: boolean;
  autoPlay: boolean;
  onEnd: () => void;
  onCancel: () => void;
  onToggleAuto: () => void;
  /** 'dock' mounts the cluster in the table's right rail (desktop) as a
   *  carved console: engraved status plate, brass END TURN medallion set
   *  into a socket, and a small auto switch. 'tray' is the flat row used
   *  inside the mobile hand tray. */
  variant: 'dock' | 'tray';
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

  if (variant === 'tray') {
    // Mobile hand-tray row: Auto · status/cancel · End Turn, thumb-side last.
    // pointerEvents:auto — the tray shell above is pointer-transparent.
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: 'flex-end',
        paddingRight: 8,
        pointerEvents: 'auto',
      }}>
        <AutoSwitch autoPlay={autoPlay} onToggleAuto={onToggleAuto} />
        <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
          <StatusOrCancel status={status} hasPending={hasPending} onCancel={onCancel} />
        </div>
        <motion.button
          whileTap={isMyTurn ? { scale: 0.97, y: 2 } : undefined}
          disabled={!isMyTurn}
          onClick={onEnd}
          animate={{ opacity: endTurnHot ? 1 : 0.75 }}
          transition={{ duration: 0.25 }}
          style={{
            width: 132,
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
          }}
        >End Turn</motion.button>
      </div>
    );
  }

  // Desktop dock — a console carved into the table's right rail.
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11,
      pointerEvents: 'auto',
    }}>
      {/* Status plate / Cancel — fixed-height slot so swaps never reflow. */}
      <div style={{
        height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <StatusOrCancel status={status} hasPending={hasPending} onCancel={onCancel} plate />
      </div>

      {/* END TURN — a brass medallion set into a recessed socket, the same
          fixture language as the souls rack and respawn dials. */}
      <div style={{
        width: 104, height: 104,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // The socket: a recess drilled into the felt.
        background: 'linear-gradient(180deg, rgba(84, 58, 22, 0.30), rgba(84, 58, 22, 0.14))',
        boxShadow: [
          'inset 0 3px 8px rgba(70, 45, 12, 0.5)',
          'inset 0 -1px 0 rgba(255, 244, 214, 0.5)',
        ].join(', '),
      }}>
        <motion.button
          whileHover={endTurnHot ? { scale: 1.04 } : undefined}
          whileTap={isMyTurn ? { scale: 0.95 } : undefined}
          disabled={!isMyTurn}
          onClick={onEnd}
          aria-label="End Turn"
          style={{
            position: 'relative',
            width: 88, height: 88,
            borderRadius: '50%',
            border: '1px solid rgba(50, 28, 6, 0.85)',
            background: endTurnHot
              ? 'radial-gradient(circle at 36% 28%, #f2c665, #cf9832 45%, #a06a1c 78%, #7a4d12)'
              : 'radial-gradient(circle at 36% 28%, #cdb287, #b0966a 50%, #8d7449 82%, #6f5a38)',
            // Structural shadows stay STATIC — animating a multi-shadow list
            // (with insets) through framer degenerates into a giant stray
            // ring. The ready-glow pulses on its own layer below instead.
            boxShadow: endTurnHot
              ? '0 3px 6px rgba(30, 15, 0, 0.5), inset 0 2px 2px rgba(255, 240, 200, 0.75), inset 0 -3px 4px rgba(90, 50, 8, 0.55)'
              : '0 2px 5px rgba(30, 15, 0, 0.45), inset 0 1px 1px rgba(255, 240, 200, 0.4), inset 0 -2px 3px rgba(60, 35, 8, 0.4)',
            cursor: isMyTurn ? (busy ? 'progress' : 'pointer') : 'default',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 2,
            padding: 0,
          }}
        >
          {/* Ready glow — a single-shadow halo whose OPACITY pulses. */}
          {endTurnHot && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0.35 }}
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: -2,
                borderRadius: '50%',
                boxShadow: `0 0 22px 4px ${palette.accent}66`,
                pointerEvents: 'none',
              }}
            />
          )}
          {/* Engraved ring inside the medallion face. */}
          <span aria-hidden style={{
            position: 'absolute', inset: 7,
            borderRadius: '50%',
            border: endTurnHot
              ? '1px solid rgba(60, 32, 4, 0.5)'
              : '1px solid rgba(60, 40, 14, 0.4)',
            boxShadow: 'inset 0 1px 0 rgba(255, 240, 200, 0.3)',
            pointerEvents: 'none',
          }} />
          <span style={{
            fontFamily: fonts.display,
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '0.16em',
            paddingLeft: '0.16em', // optically recenters tracked-out caps
            textTransform: 'uppercase',
            textAlign: 'center',
            color: endTurnHot ? '#2a1503' : 'rgba(46, 32, 12, 0.72)',
            textShadow: endTurnHot
              ? '0 1px 0 rgba(255, 235, 180, 0.5)'
              : '0 1px 0 rgba(255, 240, 210, 0.35)',
          }}>
            End<br />Turn
          </span>
        </motion.button>
      </div>

      <AutoSwitch autoPlay={autoPlay} onToggleAuto={onToggleAuto} />
    </div>
  );
}

/** Status readout, or the Cancel pill while a card/skill is armed. `plate`
 *  renders the engraved-nameplate look used on the table dock. Keyed
 *  pop-in only — an AnimatePresence exit/enter swap here wedged mid-flight
 *  and left the slot permanently empty. */
function StatusOrCancel({ status, hasPending, onCancel, plate = false }: {
  status: { key: string; label: string; tone: string; pulse: boolean };
  hasPending: boolean;
  onCancel: () => void;
  plate?: boolean;
}) {
  if (hasPending) {
    return (
      <motion.button
        key="cancel"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.default}
        whileTap={{ scale: 0.96 }}
        whileHover={{ y: -1 }}
        onClick={onCancel}
        style={{
          background: 'rgba(138, 46, 42, 0.1)',
          border: `1px solid ${palette.danger}77`,
          borderRadius: 999,
          ...text.label, color: palette.danger,
          padding: '6px 15px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >Cancel</motion.button>
    );
  }
  return (
    <motion.span
      key={status.key}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.default}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        ...(plate ? {
          padding: '4px 11px',
          borderRadius: 5,
          background: 'linear-gradient(180deg, #52381a, #38250e)',
          border: '1px solid rgba(235, 205, 145, 0.35)',
          boxShadow: 'inset 0 1px 0 rgba(255, 226, 170, 0.28), 0 2px 5px rgba(40, 20, 0, 0.35)',
        } : {}),
        ...text.label,
        fontSize: 11,
        whiteSpace: 'nowrap',
        color: plate ? '#e3c07f' : status.tone,
        textShadow: plate ? '0 1px 1px rgba(0, 0, 0, 0.55)' : undefined,
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
  );
}

/** Auto-play toggle — quiet ghost pill with a state lamp; the dot goes
 *  forest-green while the AI is driving your turns. */
function AutoSwitch({ autoPlay, onToggleAuto }: { autoPlay: boolean; onToggleAuto: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      onClick={onToggleAuto}
      title={autoPlay
        ? 'Auto-play on — click to take control'
        : 'Auto-play off — click to let the AI play'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: autoPlay ? 'rgba(74, 112, 48, 0.14)' : 'rgba(58, 40, 16, 0.08)',
        border: `1px solid ${autoPlay ? `${palette.success}88` : 'rgba(90, 63, 28, 0.3)'}`,
        borderRadius: 999,
        ...text.label,
        fontSize: 11,
        color: autoPlay ? palette.success : palette.textFaint,
        padding: '5px 12px',
        cursor: 'pointer',
      }}
    >
      <span aria-hidden style={{
        width: 7, height: 7, borderRadius: '50%',
        background: autoPlay ? palette.success : 'rgba(90, 63, 28, 0.3)',
        boxShadow: autoPlay ? `0 0 8px ${palette.success}aa` : undefined,
      }} />
      Auto
    </motion.button>
  );
}
