import { useRef } from 'react';

/**
 * Spam honeypot. Renders a hidden text field that real users never see or fill,
 * but naive bots do. Include `hp_extra_field: honeypotValue()` in the submit
 * payload; the API tags any request where it is non-empty as possible spam.
 * The field name is deliberately meaningless so browser autofill (which keys
 * off names like "website"/"company") never fills it for real users.
 */
export function useHoneypot() {
  const ref = useRef<HTMLInputElement>(null);
  const honeypotField = (
    <input
      ref={ref}
      type="text"
      name="hp_extra_field"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  );
  const honeypotValue = () => ref.current?.value || '';
  return { honeypotField, honeypotValue };
}
