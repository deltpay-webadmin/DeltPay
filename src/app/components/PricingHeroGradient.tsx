import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   Animated WebGL sphere gradient — mirrors the ShaderGradient props:
   color1="#92dbe0"  color2="#0b7bff"  color3="#3865cf"
   type="sphere"  grain="on"  uSpeed=0.3  uStrength=0.3
   ───────────────────────────────────────────────────────────────────────── */

const VS = /* glsl */`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FS = /* glsl */`
  precision highp float;
  uniform float u_time;
  uniform vec2  u_resolution;

  // Colors from the ShaderGradient config
  vec3 col1 = vec3(0.573, 0.859, 0.878); // #92dbe0
  vec3 col2 = vec3(0.043, 0.482, 1.000); // #0b7bff
  vec3 col3 = vec3(0.220, 0.396, 0.812); // #3865cf

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, amp = 0.5, freq = 1.0;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p * freq);
      freq *= 2.0;
      amp  *= 0.5;
    }
    return v;
  }

  // Grain
  float grain(vec2 uv) {
    return hash(uv + fract(u_time * 0.01)) * 0.06;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    // Aspect-correct centred coords
    vec2 st = uv - 0.5;
    st.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.3; // uSpeed

    // Sphere mask — soft circular vignette
    float dist = length(st);
    float sphere = 1.0 - smoothstep(0.28, 0.62, dist);

    // Flowing noise layers (uDensity ~ 0.8, uFrequency ~ 5.5)
    vec2 q = vec2(
      fbm(st * 1.8 + vec2(0.0, t * 0.4)),
      fbm(st * 1.8 + vec2(5.2, t * 0.35))
    );
    vec2 r = vec2(
      fbm(st * 2.6 + 4.0 * q + vec2(1.7, 9.2) + t * 0.15),
      fbm(st * 2.6 + 4.0 * q + vec2(8.3, 2.8) + t * 0.12)
    );

    float f = fbm(st * 3.5 + 4.0 * r + t * 0.08);
    f = smoothstep(0.0, 1.0, f);

    // Blend the three palette colours
    vec3 color = mix(col3, col2, clamp(f * 2.0, 0.0, 1.0));
    color = mix(color, col1, clamp(f * f * 4.0, 0.0, 1.0));

    // Sphere masking: outside the sphere blend toward deep navy
    vec3 bg = vec3(0.016, 0.118, 0.259); // #041E42
    color = mix(bg, color, sphere);

    // Soft grain overlay
    color += grain(uv);

    // Brightness (uStrength = 0.3 → keeps it rich, not blown out)
    color *= 1.15;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export function PricingHeroGradient({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VS);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs!);
    gl.attachShader(prog, fs!);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes  = gl.getUniformLocation(prog, 'u_resolution');

    let raf: number;
    let start = performance.now();

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * Math.min(devicePixelRatio, 2);
      canvas.height = canvas.offsetHeight * Math.min(devicePixelRatio, 2);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const render = (now: number) => {
      const t = (now - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        display: 'block',
        ...style,
      }}
    />
  );
}
