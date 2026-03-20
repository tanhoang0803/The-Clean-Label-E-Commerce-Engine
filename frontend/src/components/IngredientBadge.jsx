import React, { useState } from 'react';

/**
 * IngredientBadge — displays a SAFE or NOT SAFE status badge.
 * Hovering over the badge shows the AI's reason as a tooltip.
 *
 * Props:
 *   isSafe   {boolean|null}  — true = safe, false = unsafe, null = not yet audited
 *   aiReason {string}        — explanation from the AI audit
 */
export default function IngredientBadge({ isSafe, aiReason }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (isSafe === null || isSafe === undefined) {
    return (
      <span style={styles.pending}>
        Audit pending
      </span>
    );
  }

  return (
    <span
      style={isSafe ? styles.safe : styles.unsafe}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {isSafe ? 'SAFE' : 'NOT SAFE'}
      {showTooltip && aiReason && (
        <span style={styles.tooltip}>
          {aiReason}
        </span>
      )}
    </span>
  );
}

const base = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '0.78rem',
  fontWeight: '700',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  position: 'relative',
  cursor: 'default',
  userSelect: 'none',
};

const styles = {
  safe: {
    ...base,
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  },
  unsafe: {
    ...base,
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  pending: {
    ...base,
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: '1px solid #d1d5db',
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    padding: '8px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '400',
    lineHeight: '1.4',
    width: '220px',
    whiteSpace: 'normal',
    textTransform: 'none',
    letterSpacing: '0',
    zIndex: 50,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
  },
};
