import type { ReactNode } from 'react';
import { palette, text } from '../tokens';

/**
 * Shared row metrics — single source of truth for the three board rows.
 * Board.tsx sizes the live rows from these and BoardTable paints its
 * recessed wells from the same numbers, so the painted table and the
 * interactive grid can never drift apart.
 */
export const boardRows = {
  bench: (mobile: boolean) => (mobile ? 150 : 180),
  lane: (mobile: boolean) => (mobile ? 206 : 290),
  gap: (mobile: boolean) => (mobile ? 20 : 40),
} as const;

/** How far the table extends beyond the rows' bounding box. Exported so
 *  rim-mounted fixtures (PatronPlaque) can anchor to the same edges the
 *  painted table actually occupies. */
export const tablePad = (mobile: boolean) => ({
  x: mobile ? 8 : 34,
  top: mobile ? 12 : 24,
  bottom: mobile ? 12 : 26,
  rim: mobile ? 7 : 11,
});

// Table materials — the "physical" colours of the tabletop itself. Panels
// and text keep using the tokens ramp; these exist only for the wood/felt.
const mat = {
  rim0: '#6b4a20',
  rim1: '#3a2810',
  rimEdge: 'rgba(235, 205, 145, 0.32)',
  inlay0: '#e0cb9e',
  inlay1: '#d2ba8a',
  wellEdge: 'rgba(84, 58, 22, 0.32)',
  brass: palette.accent,
} as const;

// Procedural material textures — inline SVG turbulence, so the table gets
// real wood figure and felt tooth without shipping bitmap assets. Each is a
// tiling data-URI layered over the base gradients.
//
// Wood: noise stretched hard along X reads as long grain; two layers (dark
// pores + faint light figure on a different seed) give it depth.
const WOOD_DARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.16' numOctaves='5' seed='11' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.10  0 0 0 0 0.055  0 0 0 0 0.015  0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='420' height='140' filter='url(%23g)'/%3E%3C/svg%3E")`;
const WOOD_LIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.009 0.11' numOctaves='4' seed='4' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.78  0 0 0 0 0.48  0 0 0 0.16 0'/%3E%3C/filter%3E%3Crect width='420' height='140' filter='url(%23g)'/%3E%3C/svg%3E")`;
// Felt: fine, even tooth — high-frequency noise at low alpha.
const FELT_TOOTH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2' seed='9' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.32  0 0 0 0 0.20  0 0 0 0 0.06  0 0 0 0.085 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23f)'/%3E%3C/svg%3E")`;

/** Layered wood surface — grain textures over the mahogany ramp. */
const woodSurface = (angle: number) => ({
  backgroundImage: [
    WOOD_DARK,
    WOOD_LIGHT,
    `linear-gradient(${angle}deg, ${mat.rim0}, ${mat.rim1} 70%)`,
  ].join(', '),
  backgroundSize: '420px 140px, 380px 120px, 100% 100%',
});

/**
 * The tabletop: a mahogany-rimmed, felt-inlaid surface with one recessed
 * well per board row (rival bench / lane / your bench) and an engraved
 * emblem under the duel. Rendered as a decorative layer behind the live
 * rows; Board.tsx tilts the whole plane for the 3D read.
 */
export function BoardTable({ isMobile }: { isMobile: boolean }) {
  const pad = tablePad(isMobile);
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: -pad.top,
        bottom: -pad.bottom,
        left: -pad.x,
        right: -pad.x,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Rim — mahogany frame with real grain figure, a warm top highlight
          and a heavy drop shadow that anchors the table above the floor. */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 20,
        ...woodSurface(180),
        border: `1px solid ${mat.rimEdge}`,
        boxShadow: [
          '0 44px 84px -24px rgba(40, 20, 0, 0.6)',
          '0 14px 30px rgba(40, 20, 0, 0.3)',
          'inset 0 2px 1px rgba(255, 226, 170, 0.38)',
          'inset 0 -3px 2px rgba(0, 0, 0, 0.45)',
          'inset 2px 0 2px -1px rgba(255, 226, 170, 0.14)',
          'inset -2px 0 2px -1px rgba(0, 0, 0, 0.3)',
        ].join(', '),
      }} />

      {/* Front edge — the tabletop's visible thickness under the tilted
          plane: end-grain wood catching a sliver of light along its lip. */}
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 8,
        right: 8,
        height: isMobile ? 9 : 16,
        marginTop: -3,
        borderRadius: '0 0 16px 16px',
        backgroundImage: [
          WOOD_DARK,
          'linear-gradient(180deg, #3d2910, #241706 60%, #160e04)',
        ].join(', '),
        backgroundSize: '420px 140px, 100% 100%',
        boxShadow: [
          'inset 0 1px 0 rgba(255, 226, 170, 0.22)',
          '0 12px 24px rgba(40, 20, 0, 0.45)',
        ].join(', '),
      }} />

      {/* Corner rivets — brass pins in the rim. */}
      {([
        { top: 5, left: 5 }, { top: 5, right: 5 },
        { bottom: 5, left: 5 }, { bottom: 5, right: 5 },
      ] as const).map((pos, i) => (
        <span key={i} style={{
          position: 'absolute',
          ...pos,
          width: isMobile ? 6 : 9,
          height: isMobile ? 6 : 9,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, #f0d290, ${mat.brass} 55%, #6b4716)`,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.55), inset 0 -1px 1px rgba(0, 0, 0, 0.35)',
        }} />
      ))}

      {/* Inlay — the felt/parchment playing surface, recessed into the rim. */}
      <div style={{
        position: 'absolute',
        inset: pad.rim,
        borderRadius: 12,
        background: `linear-gradient(180deg, ${mat.inlay0}, ${mat.inlay1})`,
        boxShadow: [
          'inset 0 5px 16px rgba(70, 45, 12, 0.42)',
          'inset 0 -1px 0 rgba(255, 244, 214, 0.4)',
        ].join(', '),
        overflow: 'hidden',
      }}>
        {/* Felt tooth — fine organic noise (the old crossed hairline grids
            aliased into a cheap dot lattice on fractional-DPR screens). */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: FELT_TOOTH,
          backgroundSize: '240px 240px',
        }} />
        {/* Directional light — the tilted plane recedes, so the far edge
            sits in shade and the near lip catches the room light. */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(60, 38, 12, 0.14), transparent 26%, transparent 74%, rgba(255, 246, 214, 0.16) 100%)',
        }} />
        {/* Engraved keyline just inside the rim. */}
        <div style={{
          position: 'absolute',
          inset: 7,
          borderRadius: 9,
          border: '1px solid rgba(120, 80, 30, 0.32)',
          boxShadow: 'inset 0 1px 0 rgba(255, 244, 214, 0.35)',
        }} />
        {/* Warm light pool at the lane so the duel stays the bright spot.
            Long multi-stop falloff — a short fade banded visibly (a crisp
            ellipse rim) over the felt noise. */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 48% at 50% 50%, rgba(255, 240, 200, 0.32), rgba(255, 240, 200, 0.18) 45%, rgba(255, 240, 200, 0.07) 68%, transparent 92%)',
        }} />
      </div>

      {/* Row wells — exact overlay of the live rows (same heights + gap). */}
      <div style={{
        position: 'absolute',
        top: pad.top,
        bottom: pad.bottom,
        left: pad.x,
        right: pad.x,
        display: 'flex',
        flexDirection: 'column',
        gap: boardRows.gap(isMobile),
        padding: `0 ${isMobile ? 4 : 10}px`,
      }}>
        <RowWell h={boardRows.bench(isMobile)} />
        <RowWell h={boardRows.lane(isMobile)} lane />
        <RowWell h={boardRows.bench(isMobile)} />
      </div>
    </div>
  );
}

/** One recessed horizontal band on the tabletop, sized to its live row. */
function RowWell({ h, lane }: { h: number; lane?: boolean }) {
  return (
    <div style={{
      position: 'relative',
      flex: `0 0 ${h}px`,
      height: h,
      borderRadius: 14,
      background: lane
        ? 'linear-gradient(180deg, rgba(84, 58, 22, 0.18), rgba(84, 58, 22, 0.10) 55%, rgba(84, 58, 22, 0.15))'
        : 'linear-gradient(180deg, rgba(84, 58, 22, 0.13), rgba(84, 58, 22, 0.06) 60%, rgba(84, 58, 22, 0.10))',
      border: `1px solid ${mat.wellEdge}`,
      boxShadow: [
        'inset 0 3px 10px rgba(70, 45, 12, 0.30)',
        'inset 0 -1px 0 rgba(255, 244, 214, 0.45)',
      ].join(', '),
    }}>
      {lane && (
        <>
          {/* Engraved duel emblem — concentric brass rings behind the
              TurnCompass; echoes the respawn-clock dial language. */}
          <svg
            viewBox="0 0 200 200"
            width={170}
            height={170}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.55,
            }}
          >
            <g fill="none" stroke={mat.brass}>
              <circle cx="100" cy="100" r="92" strokeWidth="1" strokeOpacity="0.35" />
              <circle cx="100" cy="100" r="80" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="2 6" />
              <circle cx="100" cy="100" r="34" strokeWidth="0.8" strokeOpacity="0.35" />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * Math.PI) / 6;
                const x1 = 100 + Math.cos(a) * 84;
                const y1 = 100 + Math.sin(a) * 84;
                const x2 = 100 + Math.cos(a) * 90;
                const y2 = 100 + Math.sin(a) * 90;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={i % 3 === 0 ? 1.6 : 0.8} strokeOpacity="0.4" />;
              })}
            </g>
          </svg>
          {/* Brass corner ticks — mark the duel row as the contested zone. */}
          {([
            { top: 6, left: 6, borderTop: true, borderLeft: true },
            { top: 6, right: 6, borderTop: true, borderRight: true },
            { bottom: 6, left: 6, borderBottom: true, borderLeft: true },
            { bottom: 6, right: 6, borderBottom: true, borderRight: true },
          ] as const).map((c, i) => (
            <span key={i} style={{
              position: 'absolute',
              top: 'top' in c ? c.top : undefined,
              left: 'left' in c ? c.left : undefined,
              right: 'right' in c ? c.right : undefined,
              bottom: 'bottom' in c ? c.bottom : undefined,
              width: 14,
              height: 14,
              borderTop: 'borderTop' in c ? `2px solid ${mat.brass}88` : undefined,
              borderLeft: 'borderLeft' in c ? `2px solid ${mat.brass}88` : undefined,
              borderRight: 'borderRight' in c ? `2px solid ${mat.brass}88` : undefined,
              borderBottom: 'borderBottom' in c ? `2px solid ${mat.brass}88` : undefined,
            }} />
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Engraved brass plate for the row labels ("Rival · Bench", "Lane", …).
 * Lives in the board's left gutter rail (the plane's paddingLeft), beside
 * the cards — like a nameplate screwed to the rim. Multi-word labels pass
 * "\n" to stack ("Rival\nBench"), keeping the plate narrow enough for the
 * gutter at any fit-scale.
 */
export function RowPlaque({ children }: { children: ReactNode }) {
  return (
    <span style={{
      position: 'absolute',
      left: -64,
      width: 56,
      top: '50%',
      transform: 'translateY(-50%)',
      padding: '5px 4px',
      borderRadius: 5,
      background: 'linear-gradient(180deg, #52381a, #38250e)',
      border: '1px solid rgba(235, 205, 145, 0.35)',
      boxShadow: 'inset 0 1px 0 rgba(255, 226, 170, 0.28), 0 2px 5px rgba(40, 20, 0, 0.35)',
      ...text.label,
      fontSize: 11,
      lineHeight: 1.35,
      textAlign: 'center',
      whiteSpace: 'pre-line',
      color: '#e3c07f',
      textShadow: '0 1px 1px rgba(0, 0, 0, 0.55)',
      zIndex: 1,
      pointerEvents: 'none',
    }}>
      {children}
    </span>
  );
}

/**
 * An empty slot rendered as a recess carved into the tabletop — replaces
 * the old floating corner brackets. `accent` follows the owner (wine for
 * the rival, brass for you); `label` renders under the glyph (Active row).
 */
export function SlotWell({ accent, label }: { accent: string; label?: string }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: 10,
      background: 'linear-gradient(180deg, rgba(84, 58, 22, 0.18), rgba(84, 58, 22, 0.08) 55%, rgba(84, 58, 22, 0.14))',
      border: '1px solid rgba(84, 58, 22, 0.35)',
      boxShadow: [
        'inset 0 3px 9px rgba(70, 45, 12, 0.32)',
        'inset 0 -1px 0 rgba(255, 244, 214, 0.5)',
      ].join(', '),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      overflow: 'hidden',
    }}>
      {/* Hex sigil — same mark as the card backs, etched into the felt. */}
      <svg viewBox="0 0 60 68" width={40} height={46} style={{ opacity: 0.4 }}>
        <g stroke={accent} strokeWidth="1.4" fill="none">
          <path d="M30 4 L54 18 L54 50 L30 64 L6 50 L6 18 Z" />
          <path d="M30 14 L45 23 L45 45 L30 54 L15 45 L15 23 Z" opacity="0.6" />
          <circle cx="30" cy="34" r="3" fill={accent} fillOpacity="0.5" stroke="none" />
        </g>
      </svg>
      {label && (
        <span style={{ ...text.label, color: accent, opacity: 0.65 }}>{label}</span>
      )}
    </div>
  );
}
