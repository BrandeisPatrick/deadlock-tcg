import { motion } from 'framer-motion';
import type { GameState, PlayerID } from '@/engine/types';
import { palette, fonts, text } from '../tokens';
import { useStatTick } from './useStatTick';

/**
 * Patron vitals carved into the tabletop — a brass-framed plate screwed to
 * the table's rim corner, so the win condition (patron HP) plus deck/hand
 * counts and skill readiness are ALWAYS on the battlefield, panel open or
 * closed. Rival's plate rides the far rim (top-left), yours the near rim
 * (bottom-left) — mirroring the soul racks' top/bottom split on the right
 * edge: identity/life on the left rail, economy on the right.
 *
 * Material matches RowPlaque (dark mahogany plate, engraved brass text) so
 * it reads as furniture, not floating chrome. Lives INSIDE the tilted,
 * fit-scaled plane; sized so its numerals survive the 0.42 min scale.
 */
export function PatronPlaque({
  label, ps, hostile, skillUsed, projectedFaceDamage, side, isMobile, myTurn,
}: {
  label: string;
  ps: GameState['players'][PlayerID];
  hostile?: boolean;
  /** Player-wide "a skill was used this turn" flag for this patron's side. */
  skillUsed: boolean;
  projectedFaceDamage?: number;
  side: 'top' | 'bottom';
  isMobile: boolean;
  /** Highlight ring while it's this patron's turn. */
  myTurn?: boolean;
}) {
  const accent = hostile ? palette.danger : palette.accent;
  const hpFrac = Math.max(0, Math.min(1, ps.hp / ps.hpMax));
  const projectedHp = Math.max(0, ps.hp - (projectedFaceDamage ?? 0));
  const projectedFrac = Math.max(0, Math.min(1, projectedHp / ps.hpMax));
  const hasIncoming = !!projectedFaceDamage && projectedFaceDamage > 0;
  // Same tick language as hero cards / panel: pulse bright on heal,
  // desaturated on damage.
  const hpTick = useStatTick(ps.hp);
  const hpFlash = hpTick === 'down' ? palette.hpDim : hpTick === 'up' ? palette.hpBright : palette.hp;

  const numeralSize = isMobile ? 15 : 21;

  return (
    <div
      aria-label={`${label}: ${ps.hp} of ${ps.hpMax} HP`}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: isMobile ? 6 : 9,
        padding: isMobile ? '4px 8px 5px' : '6px 11px 7px',
        borderRadius: 7,
        // RowPlaque's plate ramp, widened — a mahogany plate with brass edge.
        background: 'linear-gradient(180deg, #52381a, #38250e)',
        border: '1px solid rgba(235, 205, 145, 0.35)',
        boxShadow: [
          'inset 0 1px 0 rgba(255, 226, 170, 0.28)',
          '0 3px 8px rgba(40, 20, 0, 0.4)',
          myTurn ? `0 0 0 1.5px ${accent}66, 0 0 14px ${accent}44` : '0 0 0 0 transparent',
        ].join(', '),
        pointerEvents: 'none',
      }}
    >
      {/* Identity column: faction dot + engraved name. */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 3,
        minWidth: 0,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          ...text.label,
          fontSize: isMobile ? 9 : 11,
          color: '#e3c07f',
          textShadow: '0 1px 1px rgba(0, 0, 0, 0.55)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: accent,
            boxShadow: `0 0 5px ${accent}aa`,
            flexShrink: 0,
          }} />
          {label}
        </span>
        {/* Counts row — deck / discard (+ rival hand). Engraved small print. */}
        <span style={{
          fontFamily: fonts.ui,
          fontSize: isMobile ? 8.5 : 10,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'rgba(227, 192, 127, 0.72)',
          textShadow: '0 1px 1px rgba(0, 0, 0, 0.5)',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}>
          deck {ps.deck.length} · disc {ps.discard.length}{hostile ? ` · hand ${ps.hand.length}` : ''}
        </span>
      </div>

      {/* Divider pin — a brass rivet separating identity from vitals. */}
      <span aria-hidden style={{
        alignSelf: 'center',
        width: 5, height: 5, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, #f0d290, ${palette.accent} 55%, #6b4716)`,
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.5)',
        flexShrink: 0,
      }} />

      {/* Vitals column: HP numeral + bar, skill dot riding the corner. */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 3,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, lineHeight: 1 }}>
          {hasIncoming && (
            <span style={{
              padding: '1px 4px', borderRadius: 3,
              background: `${palette.danger}dd`, color: '#fff',
              fontFamily: fonts.ui, fontSize: isMobile ? 8.5 : 10, fontWeight: 800,
              textShadow: '0 1px 1px rgba(0,0,0,0.5)',
            }}>▼{projectedFaceDamage}</span>
          )}
          <motion.span
            style={{
              fontFamily: fonts.ui,
              fontWeight: 800,
              fontSize: numeralSize,
              fontVariantNumeric: 'tabular-nums',
              color: '#f2dfae',
              textShadow: '0 1px 1px rgba(0, 0, 0, 0.6)',
              display: 'inline-block',
            }}
            animate={hpTick
              ? { scale: [1, 1.3, 1], color: ['#f2dfae', hpFlash, '#f2dfae'] }
              : { scale: 1, color: '#f2dfae' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >{ps.hp}</motion.span>
          <span style={{
            fontFamily: fonts.ui, fontWeight: 700,
            fontSize: isMobile ? 9 : 11,
            color: 'rgba(227, 192, 127, 0.65)',
            textShadow: '0 1px 1px rgba(0, 0, 0, 0.5)',
          }}>/ {ps.hpMax}</span>
          {/* Skill readiness — the same green pulse as the panel, docked
              beside the HP so one glance covers life + skill. */}
          {skillUsed ? (
            <span title="Skill used" style={{
              width: 7, height: 7, borderRadius: '50%', marginLeft: 3,
              background: 'rgba(227, 192, 127, 0.35)',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.4)',
              alignSelf: 'center',
            }} />
          ) : (
            <motion.span
              title="Skill ready"
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 7, height: 7, borderRadius: '50%', marginLeft: 3,
                background: palette.success,
                boxShadow: `0 0 6px ${palette.success}`,
                alignSelf: 'center',
              }}
            />
          )}
        </span>
        {/* HP bar — recessed channel with the faction-coloured fill and the
            hatched projected-damage stripe from the panel's bar. */}
        <span style={{
          position: 'relative',
          display: 'block',
          width: isMobile ? 64 : 92,
          height: isMobile ? 4 : 5,
          borderRadius: 3,
          background: 'rgba(0, 0, 0, 0.4)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 226, 170, 0.15)',
          overflow: 'hidden',
        }}>
          <span style={{
            position: 'absolute', inset: 0,
            width: `${hpFrac * 100}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            transition: 'width 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
          {hasIncoming && (
            <span style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${projectedFrac * 100}%`,
              width: `${(hpFrac - projectedFrac) * 100}%`,
              background: `repeating-linear-gradient(45deg, ${palette.danger}cc 0 3px, ${palette.danger}77 3px 6px)`,
              transition: 'all 200ms ease',
            }} />
          )}
        </span>
      </div>
    </div>
  );
}
