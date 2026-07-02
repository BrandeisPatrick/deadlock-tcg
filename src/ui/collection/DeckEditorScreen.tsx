import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { palette, fonts, spring, text } from '../tokens';
import { BackPlaque, GameButton } from '../chrome';
import { getDeck, saveDeck, DECK_SIZE, MAX_COPIES } from '@/storage/playerData';
import type { DeckSlot } from '@/storage/playerData';
import { SPELLS, EQUIPMENT, CARDS_BY_ID } from '@/cards';
import type { CardData } from '@/engine/types';
import { RoundCardIcon } from '../card/RoundCardIcon';
import { useViewport } from '../hooks/useViewport';

interface Props {
  slotIndex: number;
  onBack: () => void;
}

type Filter = 'all' | 'spell' | 'equipment';

export function DeckEditorScreen({ slotIndex, onBack }: Props) {
  const { isMobile } = useViewport();
  const existing = getDeck(slotIndex);
  const [name, setName] = useState(existing?.name ?? `Deck ${slotIndex + 1}`);
  const [cards, setCards] = useState<string[]>(existing?.cards ?? []);
  const [filter, setFilter] = useState<Filter>('all');

  const pool: CardData[] = filter === 'spell' ? SPELLS
    : filter === 'equipment' ? EQUIPMENT
    : [...SPELLS, ...EQUIPMENT];

  function countInDeck(cardId: string): number {
    return cards.filter((c) => c === cardId).length;
  }

  function addCard(cardId: string) {
    if (cards.length >= DECK_SIZE) return;
    if (countInDeck(cardId) >= MAX_COPIES) return;
    setCards([...cards, cardId]);
  }

  function removeCard(index: number) {
    setCards(cards.filter((_, i) => i !== index));
  }

  function handleSave() {
    const deck: DeckSlot = {
      id: `deck_${slotIndex}`,
      name: name.trim() || `Deck ${slotIndex + 1}`,
      cards,
    };
    saveDeck(slotIndex, deck);
    onBack();
  }

  const isFull = cards.length >= DECK_SIZE;

  return (
    <div style={{
      minHeight: '100dvh',
      background: palette.bg0,
      color: palette.text,
      fontFamily: fonts.ui,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header bar — ledger strip: parchment gradient, mahogany rule,
          warm top highlight; actions in the shared chrome components. */}
      <div style={{
        padding: isMobile ? '12px 14px' : '14px 40px',
        borderBottom: '1px solid #5a3f1c',
        background: `linear-gradient(180deg, ${palette.bg2}, ${palette.bg1})`,
        boxShadow: 'inset 0 1px 0 rgba(255, 244, 214, 0.7), 0 4px 12px rgba(40, 20, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 10 : 20,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        <BackPlaque onClick={onBack} label="Cancel" />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Deck name..."
          style={{
            flex: 1,
            minWidth: isMobile ? 140 : undefined,
            maxWidth: isMobile ? undefined : 300,
            padding: '8px 14px',
            border: '1px solid rgba(90, 63, 28, 0.5)',
            borderRadius: 8,
            background: palette.card.body,
            boxShadow: 'inset 0 2px 5px rgba(70, 45, 12, 0.15)',
            fontFamily: fonts.display,
            fontSize: 18,
            color: palette.text,
            outline: 'none',
          }}
        />

        <div style={{
          fontFamily: fonts.ui,
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: isFull ? palette.success : palette.textDim,
        }}>
          {cards.length} / {DECK_SIZE}
        </div>

        <GameButton variant="brass" size="sm" onClick={handleSave}>
          Save Deck
        </GameButton>
      </div>

      {/* Main content: pool (left) + deck (right). Phones stack them and let
          the page scroll as one column instead of two independent scroll panes. */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 360px',
        minHeight: 0,
      }}>
        {/* Card pool */}
        <div style={{
          padding: isMobile ? '16px 14px' : '20px 32px',
          overflow: isMobile ? 'visible' : 'auto',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['all', 'spell', 'equipment'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 16px',
                  border: filter === f ? '1px solid #5a3f1c' : '1px solid rgba(90, 63, 28, 0.35)',
                  borderRadius: 999,
                  background: filter === f
                    ? 'linear-gradient(180deg, #e2ab42, #b07825 55%, #955f19)'
                    : 'transparent',
                  color: filter === f ? '#241503' : palette.textDim,
                  textShadow: filter === f ? '0 1px 0 rgba(255, 235, 180, 0.45)' : undefined,
                  boxShadow: filter === f
                    ? 'inset 0 1px 0 rgba(255, 240, 200, 0.7), 0 2px 5px rgba(40, 20, 0, 0.25)'
                    : undefined,
                  fontFamily: fonts.ui,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {f === 'all' ? 'All' : f === 'spell' ? 'Spells' : 'Equipment'}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 10,
          }}>
            {pool.map((card) => {
              const count = countInDeck(card.id);
              const canAdd = count < MAX_COPIES && !isFull;
              return (
                <PoolCard
                  key={card.id}
                  card={card}
                  count={count}
                  canAdd={canAdd}
                  onAdd={() => addCard(card.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Deck contents */}
        <div style={{
          borderLeft: isMobile ? 'none' : `1px solid ${palette.border}`,
          borderTop: isMobile ? `1px solid ${palette.border}` : 'none',
          background: palette.bg1,
          padding: isMobile ? '16px 14px' : '20px 20px',
          overflow: isMobile ? 'visible' : 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            fontFamily: fonts.display,
            fontSize: 16,
            color: palette.text,
            marginBottom: 16,
          }}>
            Deck Contents
          </div>

          {cards.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.textFaint,
              ...text.body,
            }}>
              Click cards on the left to add them.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <AnimatePresence mode="popLayout">
                {cards.map((cardId, i) => {
                  const data = CARDS_BY_ID[cardId];
                  return (
                    <motion.div
                      key={`${cardId}-${i}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={spring.snappy}
                      onClick={() => removeCard(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: palette.bg2,
                        border: `1px solid ${palette.border}`,
                        cursor: 'pointer',
                      }}
                    >
                      <RoundCardIcon cardId={cardId} size={28} showName={false} />
                      <div style={{ flex: 1 }}>
                        <div style={{ ...text.label, fontSize: 12 }}>{data?.name ?? cardId}</div>
                        <div style={{ ...text.body, fontSize: 10, color: palette.textDim }}>
                          {data?.type === 'spell' ? 'Spell' : `T${(data as any)?.tier ?? '?'} Equipment`}
                          {' · Cost ' + ((data as any)?.cost ?? 0)}
                        </div>
                      </div>
                      <div style={{
                        color: palette.danger,
                        fontWeight: 700,
                        fontSize: 14,
                      }}>
                        ×
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PoolCard({ card, count, canAdd, onAdd }: {
  card: CardData;
  count: number;
  canAdd: boolean;
  onAdd: () => void;
}) {
  const cost = (card as any).cost ?? 0;
  const tier = card.type === 'equipment' ? (card as any).tier : null;

  return (
    <motion.button
      onClick={canAdd ? onAdd : undefined}
      disabled={!canAdd}
      whileHover={canAdd ? { y: -2 } : undefined}
      whileTap={canAdd ? { scale: 0.98 } : undefined}
      transition={spring.snappy}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        border: count > 0
          ? `1px solid ${palette.accent}`
          : `1px solid ${palette.border}`,
        borderRadius: 8,
        background: palette.bg1,
        cursor: canAdd ? 'pointer' : 'default',
        opacity: canAdd ? 1 : 0.5,
        textAlign: 'left',
      }}
    >
      <RoundCardIcon cardId={card.id} size={40} showName={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...text.label, fontSize: 12 }}>{card.name}</div>
        <div style={{ ...text.body, fontSize: 10, color: palette.textDim }}>
          {card.type === 'spell' ? 'Spell' : `T${tier} Equipment`}
          {' · Cost ' + cost}
        </div>
        {card.text && (
          <div style={{
            ...text.body,
            fontSize: 10,
            color: palette.textFaint,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200,
          }}>
            {card.text}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: fonts.ui,
        fontSize: 12,
        fontWeight: 700,
        color: count > 0 ? palette.accent : palette.textFaint,
        minWidth: 24,
        textAlign: 'center',
      }}>
        {count}/{MAX_COPIES}
      </div>
    </motion.button>
  );
}
