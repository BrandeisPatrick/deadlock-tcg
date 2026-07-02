import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CardInstance } from '@/engine/types';
import { CardFrame } from '../card/CardFrame';
import { palette, shadow, spring, text } from '../tokens';
import { GameButton } from '../chrome';
import { useViewport } from '../hooks/useViewport';

interface Props {
  cards: CardInstance[];
  onConfirm: (swapIids: string[]) => void;
}

export function MulliganOverlay({ cards, onConfirm }: Props) {
  const { isMobile } = useViewport();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(iid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(iid)) next.delete(iid);
      else next.add(iid);
      return next;
    });
  }

  const swapCount = selected.size;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(232, 216, 180, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 95,
        padding: isMobile ? 16 : 32,
        overflowY: isMobile ? 'auto' : undefined,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring.snappy}
        style={{ marginBottom: 28, textAlign: 'center' }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14,
          padding: '10px 32px',
          background: `linear-gradient(180deg, ${palette.bg2}, ${palette.bg1})`,
          border: `1px solid #5a3f1c`,
          borderRadius: 999,
          boxShadow: '0 6px 16px rgba(40, 20, 0, 0.22), inset 0 1px 0 rgba(255, 244, 214, 0.7), inset 0 0 0 3px rgba(176, 120, 37, 0.15)',
        }}>
          <span style={{ ...text.label, color: palette.text }}>
            Reshuffle Your Opening
          </span>
        </div>
        <div style={{ marginTop: 12, ...text.body, color: palette.textDim }}>
          Tap any cards to send them back to your deck. Then lock in your opening hand.
        </div>
      </motion.div>

      {/* Cards — dealt one after another (stagger) so the opening hand reads
          as a deal, not a wall. The outer div owns the entrance; the inner
          button keeps its own animate for the swap-toggle state. */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } }}
        style={{
          display: 'flex',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: 'center',
          gap: isMobile ? 12 : 24,
          marginBottom: isMobile ? 20 : 32,
        }}
      >
        {cards.map((c) => {
          const isSwapping = selected.has(c.iid);
          return (
            <motion.div
              key={c.iid}
              variants={{
                hidden: { y: 36, opacity: 0, scale: 0.92 },
                show: { y: 0, opacity: 1, scale: 1, transition: spring.default },
              }}
            >
            <motion.button
              onClick={() => toggle(c.iid)}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -8 }}
              animate={{
                y: isSwapping ? -12 : 0,
                scale: isSwapping ? 0.95 : 1,
                opacity: isSwapping ? 0.55 : 1,
                rotate: isSwapping ? -3 : 0,
              }}
              transition={spring.snappy}
              style={{
                padding: 0, border: 'none', background: 'transparent',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <CardFrame
                cardId={c.cardId}
                size={isMobile ? 'hand' : 'full'}
                glow={isSwapping ? 'danger' : 'accent'}
              />
              {isSwapping && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10,
                  background: 'rgba(255,107,107,0.18)',
                  pointerEvents: 'none',
                }}>
                  <span style={{
                    background: palette.danger,
                    padding: '6px 14px',
                    borderRadius: 999,
                    boxShadow: shadow.lg,
                    ...text.label, color: '#1a1410',
                  }}>
                    Swap
                  </span>
                </div>
              )}
            </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring.snappy, delay: 0.1 }}
        style={{ display: 'flex', gap: 14 }}
      >
        <GameButton
          variant="brass"
          onClick={() => onConfirm([...selected])}
          style={{ minWidth: 200, textAlign: 'center' }}
        >
          {swapCount === 0 ? 'Lock In' : `Reshuffle ${swapCount}`}
        </GameButton>
      </motion.div>
    </motion.div>
  );
}
