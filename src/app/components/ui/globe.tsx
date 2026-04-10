import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

interface EarthProps {
  className?: string;
  theta?: number;
  dark?: number;
  scale?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: Array<{ location: [number, number]; size: number; color?: [number, number, number] }>;
  markerElevation?: number;
}

const Earth: React.FC<EarthProps> = ({
  className = '',
  theta = 0.25,
  dark = 1,
  scale = 1.1,
  diffuse = 1.2,
  mapSamples = 40000,
  mapBrightness = 6,
  baseColor = [0.4, 0.6509, 1],
  markerColor = [1, 0, 0],
  glowColor = [0.2745, 0.5765, 0.898],
  markers = [],
  markerElevation = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let width = canvas.offsetWidth || 400;
    let phi = 0;
    let animId: number;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta,
      dark,
      scale,
      diffuse,
      mapSamples,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      opacity: 1,
      offset: [0, 0],
      markers: markers.map(m => ({
        location: m.location,
        size: m.size,
        color: m.color,
      })),
      markerElevation,
    });

    // cobe v2 uses globe.update() in a rAF loop instead of onRender
    function animate() {
      phi += 0.003;
      const w = canvas.offsetWidth || width;
      if (w > 0) width = w;
      globe.update({ phi, width: width * 2, height: width * 2 });
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    setReady(true);

    return () => {
      cancelAnimationFrame(animId);
      globe.destroy();
    };
  }, [theta, dark, scale, diffuse, mapSamples, mapBrightness]);

  return (
    <div
      className={`flex items-center justify-center z-10 ${className}`}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 1s ease' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          aspectRatio: '1',
        }}
      />
    </div>
  );
};

export default Earth;