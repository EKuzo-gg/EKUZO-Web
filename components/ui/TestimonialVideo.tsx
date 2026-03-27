"use client";

import { useRef, useState } from "react";

interface TestimonialVideoProps {
  src: string;
  name: string;
  role: string;
}

export default function TestimonialVideo({ src, name, role }: TestimonialVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function handlePlay() {
    const v = videoRef.current;
    if (!v) return;
    v.play();
    setPlaying(true);
  }

  function handlePause() {
    setPlaying(false);
  }

  return (
    <div className="camps-testimonial-video-wrap">
      <div>
        <div className="camps-video-wrapper">
          <div className="camps-video-shadow" />
          <div className="camps-testimonial-video">
            <video
              ref={videoRef}
              controls={playing}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onPause={handlePause}
              onEnded={handlePause}
              onPlay={() => setPlaying(true)}
            >
              <source src={src} type="video/mp4" />
            </video>
            {/* Dark overlay with play button — hidden while playing */}
            {!playing && (
              <div className="camps-video-overlay" onClick={handlePlay}>
                <div className="camps-play-btn">
                  <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden="true">
                    <path d="M28 16L0 32V0L28 16Z" fill="white" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Name beneath video */}
        <div className="mt-4 text-center">
          <span className="font-body text-black block" style={{ fontSize: "clamp(1rem, 1.6vw, 24px)", lineHeight: "34px" }}>
            {name}
          </span>
          <span className="font-body text-black block" style={{ fontSize: "clamp(1rem, 1.6vw, 24px)", lineHeight: "34px", opacity: 0.5 }}>
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}
