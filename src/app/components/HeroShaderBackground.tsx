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
          // Begin the loop at the frame the user picked: dark navy top,
          // indigo glow concentrated along the bottom edge.
          range="enabled"
          rangeStart={53}
          rangeEnd={9999}
          uTime={53}
          uSpeed={0.3}
          uStrength={0.3}
          uDensity={0.8}
          uFrequency={5.5}
          uAmplitude={3.2}
          positionX={-0.1}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={130}
          rotationZ={70}
          // Delt brand indigo — primary, secondary tonal, deep-navy anchor
          color1="#4945ff"
          color2="#7c79ff"
          color3="#1a1a4d"
          reflection={0.4}
          // Camera
          cAzimuthAngle={270}
          cPolarAngle={180}
          cDistance={0.5}
          cameraZoom={15.1}
          // Lighting
          lightType="env"
          brightness={0.8}
          envPreset="city"
          grain="on"
          // Misc
          toggleAxis={false}
          zoomOut={false}
          hoverState=""
          enableTransition={false}
        />
      </ShaderGradientCanvas>

      {/* Subtle navy wash so foreground text stays high-contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,10,40,0.55) 0%, rgba(8,10,40,0.35) 45%, rgba(8,10,40,0.65) 100%)',
        }}
      />

      {/* Hotspot tamer — the shader concentrates a bright violet peak in the
          upper-right where there is no foreground content. Without something
          anchored to it, that bright spot just reads as a distracting empty
          area. We flatten it with a directional navy wash that's heaviest in
          the top-right corner and fades toward the (text-bearing) left, so the
          gradient stays alive on the left while the empty right corner settles
          back into the navy canvas. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 110% at 100% 0%, rgba(8,10,40,0.72) 0%, rgba(8,10,40,0.30) 38%, rgba(8,10,40,0) 68%)',
        }}
      />
    </div>
  );
}

export default HeroShaderBackground;
