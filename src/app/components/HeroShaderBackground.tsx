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
          uTime={0}
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
          // Exact playground palette (matches the reference recording)
          color1="#92dbe0"
          color2="#0b7bff"
          color3="#3865cf"
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

      {/* Minimal far-left contrast anchor for the hero copy. Kept very light
          and confined to the left edge so the shader motion reads exactly like
          the raw playground reference everywhere else. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,10,40,0.45) 0%, rgba(8,10,40,0.12) 22%, rgba(8,10,40,0) 42%)',
        }}
      />
    </div>
  );
}

export default HeroShaderBackground;
