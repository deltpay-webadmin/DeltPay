import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TrailImage {
  id: number;
  x: number;
  y: number;
  src: string;
}

interface ImageMouseTrailProps {
  items: string[];
  maxNumberOfImages?: number;
  distance?: number;
  imgClass?: string;
  children: React.ReactNode;
}

export function ImageMouseTrail({
  items,
  maxNumberOfImages = 5,
  distance = 25,
  imgClass = 'w-40 h-48',
  children,
}: ImageMouseTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const imgIndex = useRef(0);
  const idCounter = useRef(0);
  const [images, setImages] = useState<TrailImage[]>([]);

  const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (getDistance(x, y, lastPos.current.x, lastPos.current.y) > distance) {
        lastPos.current = { x, y };
        const newImg: TrailImage = {
          id: idCounter.current++,
          x,
          y,
          src: items[imgIndex.current % items.length],
        };
        imgIndex.current++;

        setImages((prev) => {
          const next = [...prev, newImg];
          return next.length > maxNumberOfImages ? next.slice(-maxNumberOfImages) : next;
        });

        // Auto-remove after animation
        setTimeout(() => {
          setImages((prev) => prev.filter((img) => img.id !== newImg.id));
        }, 1200);
      }
    },
    [items, maxNumberOfImages, distance]
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      {/* Trail images */}
      <AnimatePresence>
        {images.map((img) => (
          <motion.img
            key={img.id}
            src={img.src}
            alt=""
            className={`absolute rounded-xl object-cover pointer-events-none shadow-2xl ${imgClass}`}
            style={{
              left: img.x,
              top: img.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
            initial={{ opacity: 0, scale: 0.6, rotate: Math.random() * 20 - 10 }}
            animate={{ opacity: 1, scale: 1, rotate: Math.random() * 10 - 5 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      {children}
    </div>
  );
}
