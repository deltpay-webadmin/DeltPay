import { useRef, useEffect, useState, useCallback } from 'react';
import { MezzalunaMockup } from './website-mockups/Mezzaluna';
import { VitalityBarMockup } from './website-mockups/VitalityBar';
import { RiseCrumbMockup } from './website-mockups/RiseCrumb';
import { LumiereMockup } from './website-mockups/Lumiere';
import { BrightSmilesMockup } from './website-mockups/BrightSmiles';
import { TheHarlowMockup } from './website-mockups/TheHarlow';
import { ApexMockup } from './website-mockups/Apex';

const MOCKUP_WIDTH = 1440;

export function WebsiteMockupRenderer({ mockupName }: { mockupName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(3000);

  const mockups: Record<string, JSX.Element> = {
    'Mezzaluna': <MezzalunaMockup />,
    'Vitality Bar': <VitalityBarMockup />,
    'Rise & Crumb': <RiseCrumbMockup />,
    'Lumière': <LumiereMockup />,
    'Bright Smiles Dental': <BrightSmilesMockup />,
    'The Harlow': <TheHarlowMockup />,
    'Apex': <ApexMockup />,
  };

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      setScale(containerWidth / MOCKUP_WIDTH);
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // Observe actual content height for dynamic sizing
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [mockupName]);

  const mockup = mockups[mockupName];

  if (!mockup) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
        Mockup not found
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          height: contentHeight * scale,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          ref={contentRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: `${MOCKUP_WIDTH}px`,
            position: 'absolute',
            left: '50%',
            marginLeft: `${-(MOCKUP_WIDTH / 2)}px`,
          }}
        >
          {mockup}
        </div>
      </div>
    </div>
  );
}

// Thumbnail version: renders the top portion of a mockup scaled to fit inside a card
export function WebsiteMockupThumbnail({ mockupName }: { mockupName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  const mockups: Record<string, JSX.Element> = {
    'Mezzaluna': <MezzalunaMockup />,
    'Vitality Bar': <VitalityBarMockup />,
    'Rise & Crumb': <RiseCrumbMockup />,
    'Lumière': <LumiereMockup />,
    'Bright Smiles Dental': <BrightSmilesMockup />,
    'The Harlow': <TheHarlowMockup />,
    'Apex': <ApexMockup />,
  };

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(containerWidth / MOCKUP_WIDTH);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const mockup = mockups[mockupName];

  if (!mockup) return null;

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${MOCKUP_WIDTH}px`,
          pointerEvents: 'none',
        }}
      >
        {mockup}
      </div>
    </div>
  );
}
