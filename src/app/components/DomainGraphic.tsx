import domainPhotoreal from '@/assets/feature-domain-photoreal.png';

/* ════════════════════════════════════════════════════════════════
   DOMAIN GRAPHIC — photoreal product render of a search-results
   page on iPhone showing a Delt customer ranking #1, matching the
   FeatureShowcase devices aesthetic.
   ════════════════════════════════════════════════════════════════ */
export function DomainGraphic() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <img
        src={domainPhotoreal}
        alt="Search results page on iPhone showing a Delt customer ranking number one for 'best pizza near me' — verified, top match, 4.9 stars."
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </div>
  );
}
