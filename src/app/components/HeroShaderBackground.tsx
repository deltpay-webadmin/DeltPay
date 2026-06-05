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
          uSpeed={0.49}
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
          // Electric-blue light band on a true-black field (matches reference)
          color1="#0b7bff"
          color2="#0a32ff"
          color3="#000010"
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

      {/* Light text-contrast scrim, weighted to the left where the hero copy
          sits. Kept intentionally subtle so the bright electric-blue light
          band reads cleanly — like the raw shader reference. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(0,0,16,0.55) 0%, rgba(0,0,16,0.25) 32%, rgba(0,0,16,0) 60%)',
        }}
      />
    </div>
  );
}

export default HeroShaderBackground;
