import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fonts } from '../tokens';
import { boardRows } from './BoardTable';
import { useViewport } from '../hooks/useViewport';

interface Props {
  rivalSouls: number;
  yourSouls: number;
}

const CAP = 10;   // matches SOULS_MAX — full rack renders without an overflow tail

/** Hook: track the current "slot count" for a player. The slot count
 *  rebases to the current souls when souls go UP (a refill / gain) and
 *  stays put when souls go DOWN (a spend), so a spend leaves the socket
 *  visible-but-empty rather than removing it from the rack. */
function useSlotCount(souls: number): number {
  const [slots, setSlots] = useState(souls);
  const prev = useRef(souls);
  useEffect(() => {
    if (souls > prev.current) {
      // Refill / gain → rebase the slot count to the new total.
      setSlots(souls);
    } else if (souls > slots) {
      // Safety: external state out-of-sync (e.g. dev hot-reload).
      setSlots(souls);
    }
    prev.current = souls;
  }, [souls, slots]);
  return slots;
}

/**
 * Soul racks — one per player, pinned to the right edge of the board like
 * a chip rack screwed into a card table. Each rack is a recessed channel
 * in the felt holding round brass soul-coins: gaining a soul pops a coin
 * into the next socket, spending one leaves the socket visibly empty.
 * The engraved numeral at the rack's anchor end is the at-a-glance count.
 * Rival's rack anchors at the TOP row, yours at the BOTTOM.
 */
export function SoulsRail({ rivalSouls, yourSouls }: Props) {
  // Slot count rebases on refill but stays put on spend, so a spent
  // soul leaves the socket visible-but-empty rather than removing it.
  const rivalSlots = useSlotCount(rivalSouls);
  const yourSlots = useSlotCount(yourSouls);
  const { isMobile } = useViewport();
  // Mirror the parent grid's row layout (via the shared boardRows
  // metrics) so each rack sits vertically centred inside its bench row.
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        // Hug the right edge of the board grid so the racks read as
        // fixtures on the battlefield, not an off-board chrome strip.
        right: isMobile ? -4 : -14,
        top: 0,
        bottom: 0,
        width: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: boardRows.gap(isMobile),
        pointerEvents: 'none',
      }}
    >
      {/* Rival's rack — centred within the rival-bench row. */}
      <div style={{
        flex: `0 0 ${boardRows.bench(isMobile)}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Rack filled={rivalSouls} slots={rivalSlots} side="rival" mobile={isMobile} />
      </div>

      {/* Lane row — empty spacer so the bottom rack lands inside the
          your-bench row, not the lane. */}
      <div style={{ flex: `0 0 ${boardRows.lane(isMobile)}px` }} />

      {/* Your rack — centred within the your-bench row. */}
      <div style={{
        flex: `0 0 ${boardRows.bench(isMobile)}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Rack filled={yourSouls} slots={yourSlots} side="you" mobile={isMobile} />
      </div>
    </div>
  );
}

function Rack({ filled, slots, side, mobile }: {
  filled: number;
  slots: number;
  side: 'rival' | 'you';
  mobile: boolean;
}) {
  const coin = mobile ? 10 : 12;
  // Always show at least 3 sockets so the fixture reads as a coin rack
  // even before the economy spins up; clamp to CAP and show a "+N"
  // overflow tail for any souls past it. Cap is a soft guard — V1
  // economy shouldn't push past ~6 in normal play.
  const rendered = Math.min(Math.max(slots, 3), CAP);
  const overflow = Math.max(0, slots - CAP);
  // Rival's rack reads top-down (numeral at the top edge, coins growing
  // toward the lane); yours reads bottom-up via column-reverse (numeral
  // at the bottom edge). Socket index 0 sits at the anchor end; the
  // first `filled` sockets hold coins, the rest sit empty.
  const isFilled = (i: number) => i < filled;
  return (
    <div style={{
      display: 'flex',
      flexDirection: side === 'rival' ? 'column' : 'column-reverse',
      alignItems: 'center',
      gap: 3,
      padding: '6px 4px',
      borderRadius: 999,
      // Recessed channel — same carve treatment as the row wells.
      background: 'linear-gradient(180deg, rgba(84, 58, 22, 0.15), rgba(84, 58, 22, 0.08))',
      border: '1px solid rgba(84, 58, 22, 0.32)',
      boxShadow: [
        'inset 0 2px 6px rgba(70, 45, 12, 0.28)',
        'inset 0 -1px 0 rgba(255, 244, 214, 0.4)',
      ].join(', '),
    }}>
      {/* Engraved count — the at-a-glance readout at the anchor end. */}
      <span style={{
        fontFamily: fonts.ui,
        fontSize: mobile ? 11 : 13,
        fontWeight: 700,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        color: '#6b4716',
        textShadow: '0 1px 0 rgba(255, 244, 214, 0.55)',
        padding: '1px 0 2px',
      }}>
        {filled}
      </span>

      {Array.from({ length: rendered }).map((_, i) => (
        <span
          key={`${side}-${i}`}
          style={{
            position: 'relative',
            width: coin,
            height: coin,
            borderRadius: '50%',
            // Empty socket — a drilled recess in the felt.
            background: 'rgba(84, 58, 22, 0.16)',
            boxShadow: 'inset 0 1.5px 3px rgba(70, 45, 12, 0.4)',
          }}
        >
          {/* Brass soul-coin — pops in on gain, shrinks away on spend. */}
          <motion.span
            initial={false}
            animate={{ opacity: isFilled(i) ? 1 : 0, scale: isFilled(i) ? 1 : 0.35 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24, mass: 0.7 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #f6d78c, #dfa93e 45%, #a06a1c 82%, #7a4d12)',
              boxShadow: [
                'inset 0 1px 1px rgba(255, 240, 200, 0.8)',
                '0 1px 2px rgba(40, 20, 0, 0.35)',
                '0 0 7px rgba(226, 171, 66, 0.55)',
              ].join(', '),
            }}
          />
        </span>
      ))}

      {overflow > 0 && (
        <span style={{
          fontFamily: fonts.ui,
          fontSize: 10, fontWeight: 700,
          color: '#6b4716',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>+{overflow}</span>
      )}
    </div>
  );
}
