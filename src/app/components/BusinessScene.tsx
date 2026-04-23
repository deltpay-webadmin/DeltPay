/**
 * BusinessScene
 * ------------
 * Rich editorial "scene" tile for a testimonial/case-study. Uses a custom,
 * AI-generated brand photograph (Nano Banana Pro) graded to the Delt palette,
 * with a glass overlay for the quote glyph, business name, location and metric.
 *
 * Each theme maps to a unique, bespoke image — no stock photos, no repeats.
 */
import React from 'react';
import { Quote } from 'lucide-react';

// Custom brand photography — AI-generated, locally bundled
import sceneHardware   from '../../assets/scenes/scene_hardware.jpg';
import sceneCafe       from '../../assets/scenes/scene_cafe.jpg';
import sceneBakery     from '../../assets/scenes/scene_bakery.jpg';
import sceneWellness   from '../../assets/scenes/scene_wellness.jpg';
import sceneAuto       from '../../assets/scenes/scene_auto.jpg';
import sceneRestaurant from '../../assets/scenes/scene_restaurant.jpg';
import sceneRetail     from '../../assets/scenes/scene_retail.jpg';
import sceneSalon      from '../../assets/scenes/scene_salon.jpg';
import sceneDental     from '../../assets/scenes/scene_dental.jpg';
import sceneOffice     from '../../assets/scenes/scene_office.jpg';
import sceneBooks      from '../../assets/scenes/scene_books.jpg';
import sceneFitness    from '../../assets/scenes/scene_fitness.jpg';
import sceneFlowers     from '../../assets/scenes/scene_flowers.jpg';
// Secondary variants so repeated themes show a different photo per business
import sceneCafe2       from '../../assets/scenes/scene_cafe2.jpg';
import sceneRestaurant2 from '../../assets/scenes/scene_restaurant2.jpg';
import sceneSalon2      from '../../assets/scenes/scene_salon2.jpg';
import sceneFitness2    from '../../assets/scenes/scene_fitness2.jpg';

const NAVY = '#041E42';
const PURPLE = '#4945FF';

// Each theme can map to one OR multiple photos. When multiple, a stable
// hash of the business name picks which variant to show so the same theme
// used across a page never shows the same image twice back-to-back.
const THEME_PHOTOS: Record<string, string[]> = {
  hardware:   [sceneHardware],
  cafe:       [sceneCafe, sceneCafe2],
  bakery:     [sceneBakery],
  wellness:   [sceneWellness],
  auto:       [sceneAuto],
  restaurant: [sceneRestaurant, sceneRestaurant2],
  retail:     [sceneRetail],
  salon:      [sceneSalon, sceneSalon2],
  dental:     [sceneDental],
  office:     [sceneOffice],
  books:      [sceneBooks],
  fitness:    [sceneFitness, sceneFitness2],
  flowers:    [sceneFlowers],
};

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

type Theme = keyof typeof THEME_PHOTOS;

interface BusinessSceneProps {
  theme: Theme;
  initials: string;
  businessName: string;
  location?: string;
  metric?: string;
  aspect?: 'square' | 'portrait' | 'landscape';
  variant?: 'navy' | 'purple' | 'cream';
}

export function BusinessScene({
  theme,
  initials,
  businessName,
  location,
  metric,
  aspect = 'square',
  variant = 'navy',
}: BusinessSceneProps) {
  const photoSet = THEME_PHOTOS[theme] || THEME_PHOTOS.retail;
  const seed = hashString(`${businessName}|${initials}|${theme}`);
  const photo = photoSet[seed % photoSet.length];

  const aspectClass = aspect === 'portrait'
    ? 'aspect-[4/5]'
    : aspect === 'landscape'
      ? 'aspect-[16/10]'
      : 'aspect-square';

  const gradient = variant === 'purple'
    ? `linear-gradient(160deg, rgba(73,69,255,0.55) 0%, rgba(4,30,66,0.85) 100%)`
    : variant === 'cream'
      ? `linear-gradient(160deg, rgba(246,247,251,0.1) 0%, rgba(4,30,66,0.75) 100%)`
      : `linear-gradient(160deg, rgba(4,30,66,0.45) 0%, rgba(4,30,66,0.9) 100%)`;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden w-full ${aspectClass}`}
      style={{
        boxShadow: '0 20px 60px rgba(4,30,66,0.22), 0 4px 12px rgba(4,30,66,0.08)',
      }}
    >
      {/* Photo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${photo}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(0.92) contrast(1.04)',
        }}
      />
      {/* Brand gradient wash */}
      <div
        className="absolute inset-0"
        style={{ background: gradient }}
      />
      {/* Purple accent glow */}
      <div
        className="absolute"
        style={{
          bottom: -80,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(73,69,255,0.5) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
        }}
      />

      {/* Top-left quote glyph */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <Quote
          size={44}
          color="rgba(255,255,255,0.88)"
          style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}
          strokeWidth={2.2}
        />
      </div>

      {/* Top-right: metric chip */}
      {metric && (
        <div
          className="absolute top-6 right-6 flex items-center gap-1.5 font-bold"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: NAVY,
            fontSize: 11,
            padding: '6px 12px',
            borderRadius: 999,
            letterSpacing: '-0.01em',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: PURPLE,
              boxShadow: `0 0 8px ${PURPLE}`,
            }}
          />
          {metric}
        </div>
      )}

      {/* Bottom: initials + business name */}
      <div className="absolute left-6 right-6 bottom-6 flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-2xl flex-shrink-0 font-bold"
          style={{
            width: 52,
            height: 52,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #EDEFF5 100%)',
            color: NAVY,
            fontSize: 17,
            letterSpacing: '-0.02em',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {businessName}
          </div>
          {location && (
            <div
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 12,
                marginTop: 2,
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
            >
              {location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
