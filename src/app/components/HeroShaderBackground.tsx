import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

/* ──────────────────────────────────────────────────────────────
   HeroShaderBackground
   Live, animated shader gradient locked to the Delt brand
   indigo (#4945ff). Sits absolute-filling its parent section.
   Pointer events are disabled so it never intercepts clicks.
   ────────────────────────────────────────────────────────────── */

export function HeroShaderBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <ShaderGradientCanvas
        style={{ width: '100%', height: '100%' }}
        lazyLoad={undefined}
        fov={undefined}
        pixelDensity={1}
        pointerEvents="none"
      >
        <ShaderGradient
          animate="on"
          type="sphere"
          wireframe={false}
          shader="defaults"
          // Timing — start the loop in the dark phase where color3 (deep
          // navy/near-black) dominates and color1 (brand indigo) reads as
          // a directional glow rather than a full wash. Lower uSpeed slows
          // the cycle so the dark phase reads on screen longer.
          range="enabled"
          rangeStart={180}
          rangeEnd={9999}
          uTime={180}
          uSpeed={0.18}
          uStrength={0.28}
          uDensity={0.8}
          uFrequency={5.5}
          uAmplitude={3.2}
          positionX={-0.1}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={130}
          rotationZ={70}
          // Delt brand indigo — primary, secondary tonal, deep-navy anchor.
          // color3 is darkened toward pure black so the dark phase of the
          // loop reads as black rather than a second blue.
          color1="#4945ff"
          color2="#7c79ff"
          color3="#05061a"
          reflection={0.4}
          // Camera
          cAzimuthAngle={270}
          cPolarAngle={180}
          cDistance={0.5}
          cameraZoom={15.1}
          // Lighting — slightly dimmer than original so the indigo
          // highlights don't bloom across the whole canvas, but bright
          // enough that the glow still reads.
          lightType="env"
          brightness={0.7}
          envPreset="city"
          grain="on"
          // Misc
          toggleAxis={false}
          zoomOut={false}
          hoverState=""
          enableTransition={false}
        />
      </ShaderGradientCanvas>

      {/* Dark wash so the indigo reads as a directional glow rather than
          a full-canvas blue. Heavier at top/bottom edges; the shader's
          indigo still punches through in the mid-band so the surface
          stays black-dominant without going entirely flat black. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
}

export default HeroShaderBackground;
