import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { palette, fonts, spring, text } from './tokens';

/**
 * Shared menu chrome — the same Belle Époque parlor materials as the
 * battle table (parchment, mahogany, brass) packaged as primitives so
 * every screen outside the match reads as one product:
 *
 *   MenuShell     page container + parlor backdrop + centered column
 *   BackPlaque    engraved brass-plate back button
 *   ScreenHeading display title + engraved rule + subtitle
 *   GameButton    brass / parchment / wine action button
 */

export function MenuShell({ children, maxWidth = 1100 }: {
  children: ReactNode;
  maxWidth?: number;
}) {
  return (
    <div style={{
      minHeight: '100dvh',
      position: 'relative',
      background: palette.bg0,
      color: palette.text,
      fontFamily: fonts.ui,
      padding: 'clamp(20px, 4vw, 44px) clamp(14px, 5vw, 64px) 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <MenuBackdrop />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth }}>
        {children}
      </div>
    </div>
  );
}

/** Parlor atmosphere for menu screens — a warm lamp pool and deepened
 *  corners, matching the in-match ArenaBackdrop so navigating between
 *  menu and battle doesn't jump between two different rooms. */
export function MenuBackdrop() {
  return (
    <div aria-hidden style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 75% 55% at 50% 34%, rgba(255, 246, 214, 0.7), transparent 72%),
          radial-gradient(ellipse 80% 50% at 50% 100%, rgba(120, 80, 30, 0.08), transparent 65%)
        `,
      }} />
      {/* Paper fibre streaks — same material read as the match backdrop. */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(180deg, rgba(120, 80, 30, 0.025) 0 1px, transparent 1px 7px)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 100% 100% at 50% 46%, transparent 48%, rgba(80, 50, 15, 0.22) 100%)',
      }} />
    </div>
  );
}

/** Engraved brass-plate back button — same nameplate material as the
 *  board's row plaques, so "chrome you can press" looks consistent. */
export function BackPlaque({ onClick, label = 'Back' }: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={spring.snappy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 14px',
        borderRadius: 6,
        background: 'linear-gradient(180deg, #52381a, #38250e)',
        border: '1px solid rgba(235, 205, 145, 0.35)',
        boxShadow: 'inset 0 1px 0 rgba(255, 226, 170, 0.28), 0 2px 5px rgba(40, 20, 0, 0.35)',
        ...text.label,
        color: '#e3c07f',
        textShadow: '0 1px 1px rgba(0, 0, 0, 0.55)',
        cursor: 'pointer',
      }}
    >
      <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>←</span>
      {label}
    </motion.button>
  );
}

/** Display title + engraved brass rule + optional subtitle. */
export function ScreenHeading({ title, subtitle, compact }: {
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <div style={{ margin: '18px 0 30px' }}>
      <div style={{
        fontFamily: fonts.display,
        fontSize: compact ? 28 : 36,
        color: palette.text,
        lineHeight: 1.05,
        textShadow: '0 1px 0 rgba(255, 244, 214, 0.6)',
      }}>
        {title}
      </div>
      {/* Engraved rule with corner ticks — echoes the start-screen divider. */}
      <div aria-hidden style={{
        position: 'relative',
        width: 190,
        height: 1,
        background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent}33)`,
        margin: '12px 0 0 2px',
      }}>
        <span style={{
          position: 'absolute', top: -3, left: -3, width: 7, height: 7,
          borderTop: `1px solid ${palette.accent}`, borderLeft: `1px solid ${palette.accent}`,
        }} />
      </div>
      {subtitle && (
        <div style={{ ...text.body, color: palette.textDim, marginTop: 12, maxWidth: 560 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

type GameButtonVariant = 'brass' | 'parchment' | 'wine';

const buttonSkins: Record<GameButtonVariant, CSSProperties> = {
  brass: {
    background: 'linear-gradient(180deg, #e2ab42, #b07825 55%, #955f19)',
    border: '1px solid #5a3f1c',
    color: '#241503',
    textShadow: '0 1px 0 rgba(255, 235, 180, 0.45)',
    boxShadow: '0 3px 0 #6b4716, 0 7px 16px rgba(40, 20, 0, 0.3), inset 0 1px 0 rgba(255, 240, 200, 0.7)',
  },
  parchment: {
    background: 'linear-gradient(180deg, #f2e4c6, #e2cfa4)',
    border: '1px solid rgba(90, 63, 28, 0.6)',
    color: palette.text,
    boxShadow: 'inset 0 1px 0 rgba(255, 250, 230, 0.6), 0 2px 6px rgba(40, 20, 0, 0.18)',
  },
  wine: {
    background: 'rgba(138, 46, 42, 0.08)',
    border: `1px solid ${palette.danger}66`,
    color: palette.danger,
    boxShadow: 'none',
  },
};

/** The one press-me button of the app — brass primary, parchment
 *  secondary, wine for destructive/back-out actions. Same material as
 *  the on-table End Turn plate. */
export function GameButton({
  variant = 'brass', size = 'md', onClick, disabled, children, style, title,
}: {
  variant?: GameButtonVariant;
  size?: 'sm' | 'md';
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { y: -2, scale: 1.02 } : undefined}
      whileTap={!disabled ? { y: 1, scale: 0.97 } : undefined}
      transition={spring.snappy}
      style={{
        padding: size === 'sm' ? '8px 16px' : '11px 24px',
        borderRadius: size === 'sm' ? 8 : 10,
        ...text.label,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        ...buttonSkins[variant],
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
