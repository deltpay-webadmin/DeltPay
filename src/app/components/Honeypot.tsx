import { useRef } from 'react';

/**
 * Spam honeypot. Renders a hidden text field that real users never see or fill,
 * but naive bots do. Include `company_website: honeypotValue()` in the submit
 * payload; the API silently drops any request where it is non-empty.
 */
export function useHoneypot() {
  const ref = useRef<HTMLInputElement>(null);
  const honeypotField = (
    <input
      ref={ref}
      type="text"
      name="company_website"
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
