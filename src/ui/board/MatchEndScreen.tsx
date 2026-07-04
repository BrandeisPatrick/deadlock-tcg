import { motion } from 'framer-motion';
import type { GameState, PlayerID, CardInstance } from '@/engine/types';
import { CARDS_BY_ID } from '@/cards';
import { palette, fonts, text, spring } from '../tokens';
import { GameButton } from '../chrome';
import { useViewport } from '../hooks/useViewport';

const HERO_IMG_BASE = `${import.meta.env.BASE_URL ?? '/'}heroes/`;

/**
 * Full-screen match epilogue. Leads with an unambiguous VICTORY / DEFEAT /
 * DRAW verdict, backs it with the patron flavor line, shows both teams'
 * final rosters (fallen heroes grayed with a K.O. wash), a compact stat
 * strip, and the exits: Rematch + Main Menu (or Return to Map for story
 * battles).
 */
export function MatchEndScreen({
  G, me, won, draw, isStory,
  onRematch, onMenu, onStoryReturn,
}: {
  G: GameState;
  me: PlayerID;
  won: boolean;
  draw: boolean;
  isStory: boolean;
  onRematch: () => void;
  onMenu: (() => void) | null;
  onStoryReturn: () => void;
}) {
  const { isMobile } = useViewport();
  const opp: PlayerID = me === '0' ? '1' : '0';
  const tone = draw ? palette.accent : won ? palette.success : palette.danger;
  const headline = draw ? 'Draw' : won ? 'Victory' : 'Defeat';
  const flavor = draw
    ? 'Both patrons stand — the city holds its breath.'
    : isStory
      ? (won ? 'The block is yours — press on uptown.' : 'Your run ends in the old city.')
      : (won ? 'The rival patron falls.' : 'Your patron is outflanked.');

  const myPs = G.players[me];
  const opPs = G.players[opp];
  const fallen = (c: CardInstance | null) => !c || c.hp <= 0 || (c.respawnTurnsLeft ?? 0) > 0;
  const myTeam = [myPs.active, ...myPs.bench].filter(Boolean) as CardInstance[];
  const opTeam = [opPs.active, ...opPs.bench].filter(Boolean) as CardInstance[];

  const stats: Array<{ label: string; value: string }> = [
    { label: 'Turns', value: String(G.turnNumber) },
    { label: 'Your patron', value: `${Math.max(0, myPs.hp)} HP` },
    { label: 'Rival patron', value: `${Math.max(0, opPs.hp)} HP` },
    { label: 'Heroes lost', value: `${myTeam.filter(fallen).length}–${opTeam.filter(fallen).length}` },
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(circle at 50% 32%, ${tone}2e, ${palette.bg0} 68%)`,
      fontFamily: fonts.ui,
      gap: isMobile ? 18 : 24,
      padding: isMobile ? '0 20px' : '0 32px',
      textAlign: 'center',
      overflow: 'hidden',
    }}>
      {/* Verdict */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring.bouncy}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      >
        <div style={{
          fontFamily: fonts.display,
          fontSize: 13,
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          color: palette.textDim,
          paddingLeft: '0.5em', // optically recenters tracked-out caps
        }}>
          {isStory ? 'Story battle' : 'Quick match'} · Turn {G.turnNumber}
        </div>
        <h1 style={{
          fontFamily: fonts.display,
          fontSize: isMobile ? 56 : 84,
          fontWeight: 400,
          lineHeight: 1,
          textTransform: 'uppercase',
          color: tone,
          textShadow: `0 0 54px ${tone}77, 0 2px 0 rgba(255, 244, 214, 0.5)`,
          margin: 0,
        }}>{headline}</h1>
        <div style={{ ...text.body, fontSize: 15, color: palette.textDim }}>{flavor}</div>
      </motion.div>

      {/* Final rosters — yours left, rival right (stacked on phones). */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.default, delay: 0.18 }}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 10 : 44,
          alignItems: 'center',
        }}
      >
        <RosterStrip label="Your team" team={myTeam} fallen={fallen} accent={won && !draw ? tone : palette.textDim} />
        <div aria-hidden style={{
          fontFamily: fonts.display, fontSize: 15, color: palette.textFaint, letterSpacing: '0.2em',
        }}>VS</div>
        <RosterStrip label="Rival team" team={opTeam} fallen={fallen} accent={!won && !draw ? tone : palette.textDim} />
      </motion.div>

      {/* Stat strip */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.default, delay: 0.3 }}
        style={{
          display: 'flex', gap: isMobile ? 16 : 34, flexWrap: 'wrap', justifyContent: 'center',
          padding: '12px 22px',
          background: 'rgba(245, 232, 204, 0.55)',
          border: `1px solid ${palette.border}`,
          borderRadius: 12,
          boxShadow: 'inset 0 1px 0 rgba(255, 250, 230, 0.6), 0 4px 14px rgba(40, 20, 0, 0.12)',
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 64 }}>
            <span style={{
              fontFamily: fonts.display, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: palette.textFaint,
            }}>{s.label}</span>
            <span style={{ ...text.numeric, fontSize: 18, color: palette.text }}>{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Exits */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.default, delay: 0.42 }}
        style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}
      >
        {isStory ? (
          <GameButton variant="brass" onClick={onStoryReturn} style={{ minWidth: 190, textAlign: 'center' }}>
            Return to Map
          </GameButton>
        ) : (
          <GameButton variant="brass" onClick={onRematch} style={{ minWidth: 170, textAlign: 'center' }}>
            Rematch
          </GameButton>
        )}
        {onMenu && (
          <GameButton onClick={onMenu} style={{ minWidth: 150, textAlign: 'center' }}>
            Main Menu
          </GameButton>
        )}
      </motion.div>
    </div>
  );
}

function RosterStrip({ label, team, fallen, accent }: {
  label: string;
  team: CardInstance[];
  fallen: (c: CardInstance | null) => boolean;
  accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{
        fontFamily: fonts.display, fontSize: 10, fontWeight: 700,
        letterSpacing: '0.32em', textTransform: 'uppercase', color: accent,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {team.map((c, i) => {
          const dead = fallen(c);
          const name = CARDS_BY_ID[c.cardId]?.name ?? c.cardId;
          return (
            <motion.div
              key={c.iid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.default, delay: 0.22 + i * 0.06 }}
              title={dead ? `${name} — fell in battle` : name}
              style={{
                position: 'relative',
                width: 58, height: 78,
                borderRadius: 7,
                overflow: 'hidden',
                border: `1px solid ${dead ? palette.border : palette.borderStrong}`,
                background: '#1a0f06',
                boxShadow: dead ? 'none' : '0 4px 10px rgba(40,20,0,0.28)',
              }}
            >
              <img
                src={`${HERO_IMG_BASE}${c.cardId}_card.webp`}
                alt={name}
                draggable={false}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: '50% 14%',
                  filter: dead ? 'grayscale(1) brightness(0.55)' : undefined,
                  userSelect: 'none',
                }}
              />
              {dead && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: fonts.display, fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.14em', color: 'rgba(255, 235, 210, 0.92)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                  background: 'linear-gradient(to top, rgba(20,8,2,0.55), transparent)',
                }}>K.O.</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
