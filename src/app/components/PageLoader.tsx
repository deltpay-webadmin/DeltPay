/**
 * Branded route loader shown while a lazy-loaded page chunk is fetching.
 * Full-viewport, centered DeltPay wordmark with a subtle spinner — keeps the
 * screen from flashing blank during code-split navigation.
 */
export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        background: '#F6F7FB',
      }}
    >
      <div
        style={{
          fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: '#041E42',
        }}
      >
        Delt<span style={{ color: '#4945FF' }}>Pay</span>
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '3px solid rgba(73,69,255,0.18)',
          borderTopColor: '#4945FF',
          animation: 'deltpay-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes deltpay-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
