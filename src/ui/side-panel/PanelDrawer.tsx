import { motion, AnimatePresence } from 'framer-motion';
import { palette, fonts } from '../tokens';
import { useViewport } from '../hooks/useViewport';

/**
 * Right-side game panel (Patrol + log + Amber Hand) with an always-visible
 * chevron tab to toggle it.
 *
 * Desktop: the panel participates in the Board's flex row — opening it
 * narrows the main column, and the stage's fit-scale reflows to the space
 * that's actually left. (It used to be a fixed overlay that sat on top of
 * the board's right edge, hiding slots and the End Turn shelf.)
 *
 * Mobile: stays a fixed overlay — there's no room to give up, and the
 * panel is closed by default there anyway.
 */
const WIDTH = 320;

export function PanelDrawer({ open, onToggle, children }: {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { isMobile } = useViewport();

  const tab = (
    <button
      onClick={onToggle}
      title={open ? 'Hide panel' : 'Show panel'}
      style={{
        position: 'fixed',
        top: '50%',
        right: open ? WIDTH : 0,
        transform: 'translateY(-50%)',
        width: 22, height: 64,
        background: `linear-gradient(180deg, ${palette.bg1}, ${palette.bg2})`,
        border: `1.5px solid ${palette.accent}`,
        borderRadius: '6px 0 0 6px',
        color: palette.text,
        cursor: 'pointer',
        fontFamily: fonts.ui,
        fontSize: 16, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `-3px 0 12px rgba(40, 20, 0, 0.32)`,
        zIndex: 65,
        padding: 0,
        transition: 'right 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        lineHeight: 1,
      }}
    >
      <span style={{
        display: 'inline-block',
        transform: open ? 'none' : 'rotate(180deg)',
        transition: 'transform 220ms ease',
      }}>‹</span>
    </button>
  );

  if (isMobile) {
    return (
      <>
        {tab}
        <AnimatePresence>
          {open && (
            <motion.aside
              key="panel-drawer"
              initial={{ x: WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: WIDTH }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              style={{
                position: 'fixed',
                top: 0, right: 0, bottom: 0,
                width: WIDTH,
                // Top padding clears the persistent system gear pinned to the
                // viewport corner so the panel header never sits under it.
                padding: '56px 12px 12px 8px',
                background: palette.bg0,
                boxShadow: `-8px 0 24px rgba(40, 20, 0, 0.32)`,
                zIndex: 64,
                overflow: 'hidden',
              }}
            >
              {children}
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: in-flow flex child. Stays mounted so the width can animate;
  // the inner box keeps a constant width so text doesn't reflow mid-slide.
  return (
    <>
      {tab}
      <motion.aside
        key="panel-drawer"
        initial={false}
        animate={{ width: open ? WIDTH : 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        style={{
          flex: '0 0 auto',
          alignSelf: 'stretch',
          overflow: 'hidden',
          background: palette.bg0,
          boxShadow: open ? `-8px 0 24px rgba(40, 20, 0, 0.32)` : 'none',
          zIndex: 64,
          position: 'relative',
        }}
      >
        <div style={{
          width: WIDTH,
          height: '100%',
          // Top padding clears the persistent system gear pinned to the
          // viewport corner so the panel header never sits under it.
          padding: '56px 12px 12px 8px',
          boxSizing: 'border-box',
          position: 'absolute',
          right: 0, top: 0,
        }}>
          {children}
        </div>
      </motion.aside>
    </>
  );
}
