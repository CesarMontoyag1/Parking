'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './VideoCarousel.module.css';

type VideoItem = {
  id: number;
  title: string;
  url: string;
  label: string;
};

type VideoCarouselProps = {
  videos: VideoItem[];
  fadeMs?: number;
};

export default function VideoCarousel({
  videos,
  fadeMs = 2000,
}: VideoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTriggeredRef = useRef(false);

  useEffect(() => {
    fadeTriggeredRef.current = false;

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [activeIndex]);

  const activeVideo = videos[activeIndex];

  return (
    <div className={styles.carousel} aria-label="Video principal">
      <video
        key={activeVideo.url}
        autoPlay
        muted
        playsInline
        className={styles.video}
        onTimeUpdate={(event) => {
          const { currentTime, duration } = event.currentTarget;
          if (!Number.isFinite(duration) || fadeTriggeredRef.current) {
            return;
          }

          const remainingMs = (duration - currentTime) * 1000;

          // Inicia el fade antes del final para suavizar el cambio.
          if (remainingMs <= fadeMs) {
            fadeTriggeredRef.current = true;
            setIsFading(true);
          }
        }}
        onEnded={() => {
          if (videos.length <= 1) {
            return;
          }

          // Cambia el video cuando termina y vuelve a mostrar contenido.
          fadeTimeoutRef.current = setTimeout(() => {
            setActiveIndex((current) => (current + 1) % videos.length);
            setIsFading(false);
          }, 150);
        }}
      >
        <source src={activeVideo.url} type="video/mp4" />
      </video>

      {/* Transición minimalista a negro para suavizar el cambio */}
      <div
        className={`${styles.fadeOverlay} ${isFading ? styles.fadeOverlayActive : ''}`}
        style={{ transitionDuration: `${fadeMs}ms` }}
      />

      {/* Etiqueta discreta para dar contexto al video actual */}
      <div className={styles.caption} aria-hidden="true">
        {activeVideo.title} · {activeVideo.label}
      </div>
    </div>
  );
}
