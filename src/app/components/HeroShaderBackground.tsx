'use client';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

/* ──────────────────────────────────────────────────────────────
   HeroShaderBackground
   Live, animated shader gradient. Uses the user-provided playground
   config verbatim, with the palette tuned to read blue. Sits
   absolute-filling its parent section; pointer events disabled so it
   never intercepts clicks on the hero content.
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
          // Blue palette (replacing the teal/orange/periwinkle from the snippet)
          color1="#73b8ff"
          color2="#0a5bff"
          color3="#3865cf"
          reflection={0.4}
          // View (camera) props
          cAzimuthAngle={270}
          cPolarAngle={180}
          cDistance={0.5}
          cameraZoom={15.1}
          // Effect props
          lightType="env"
          brightness={0.8}
          envPreset="city"
          grain="on"
          // Tool props
          toggleAxis={false}
          zoomOut={false}
          hoverState=""
          // Optional - if using transition features
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}

export default HeroShaderBackground;
