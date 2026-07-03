import designPhotoreal from '@/assets/feature-design-photoreal.png';

/* ════════════════════════════════════════════════════════════════
   AGENCY GRAPHIC — photoreal product render of a chic restaurant
   website on iPhone, matching the FeatureShowcase devices aesthetic.
   ════════════════════════════════════════════════════════════════ */
export function AgencyGraphic() {
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
        src={designPhotoreal}
        alt="Hand-crafted restaurant website rendered on iPhone — photographic typography, real pizza imagery, premium editorial design."
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
