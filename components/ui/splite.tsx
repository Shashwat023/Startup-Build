"use client";

import { useEffect, useRef } from "react";

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = scene;
    }
  }, [scene]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      frameBorder="0"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
}
