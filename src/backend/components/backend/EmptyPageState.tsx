import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * ────────────────────────────────────────────────────────────
 * Empty states
 * ────────────────────────────────────────────────────────────
 * The CRM shows real data or it shows nothing — it never shows
 * invented records. Pages that are not yet wired to a Supabase
 * table render one of these instead of a fabricated sample set,
 * so an empty workspace reads as "nothing here yet" rather than
 * as someone else's book of business.
 *
 *   • `EmptyPageState` — whole-page placeholder, owns its header.
 *   • `EmptyState`     — inline block for a table body, list, or
 *                        card that has no rows to show.
 */

interface EmptyPageStateProps {
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyPageState({ title, description, actionButton }: EmptyPageStateProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors"
          >
            {actionButton.label}
          </button>
        )}
      </div>

      {/* Empty State Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <EmptyState title="No data yet" description={description} />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  /** Defaults to a generic inbox glyph. */
  icon?: React.ElementType;
  title: string;
  description?: string;
  /** Tightens the vertical padding for use inside a table body. */
  compact?: boolean;
}

export function EmptyState({ icon: Icon = Inbox, title, description, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 ${compact ? 'py-10' : 'py-16'}`}>
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-gray-500 max-w-sm">{description}</p>
      )}
    </div>
  );
}
