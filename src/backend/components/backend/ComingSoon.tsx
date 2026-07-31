import React from 'react';
import { Hourglass } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  /** 'page' fills the route body; 'inline' sits inside an existing page layout (e.g. a sub-tab). */
  variant?: 'page' | 'inline';
}

export function ComingSoon({ title, description, icon: Icon = Hourglass, variant = 'page' }: ComingSoonProps) {
  return (
    <div
      className={
        variant === 'page'
          ? 'h-full flex items-center justify-center px-6'
          : 'flex items-center justify-center px-6 py-24'
      }
    >
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-[14px] bg-(--dp-accent-soft) border border-(--dp-border) flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-(--dp-accent-text)" strokeWidth={1.75} />
        </div>
        <h2 className="text-[18px] font-bold text-(--dp-text)">{title}</h2>
        {description && <p className="mt-1.5 text-[13px] leading-relaxed text-(--dp-text-muted)">{description}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-(--dp-border) font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--dp-text-faint)">
          <span className="w-1.5 h-1.5 rounded-full bg-(--dp-accent) animate-pulse" />
          In development
        </span>
      </div>
    </div>
  );
}
