// Local field primitives for the MPA wizard. Deliberately self-contained
// (no CRM imports) so the public link page doesn't pull the backend bundle.

import { type ReactNode } from 'react';

export function Field({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function TextAreaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function CheckLine({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
      {label}
    </label>
  );
}

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T | '';
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
            value === o.value
              ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-700'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {title && <div className="mb-3 text-sm font-semibold text-gray-800">{title}</div>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}
