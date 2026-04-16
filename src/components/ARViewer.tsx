// @ts-nocheck
'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Setup TS definition for a-frame custom elements is handled in src/aframe.d.ts

export default function ARViewer({ projectId }: { projectId: string }) {
  const [projectData, setProjectData] = useState<any>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const targetRef = useRef<any>(null);

  useEffect(() => {
    async function init() {
      // 1. Fetch DB
      const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (data) {
        setProjectData(data);
        const img = new Image();
        img.src = data.image_url;
        img.onload = () => setAspectRatio(img.height / img.width);
      }

      // 2. Load A-Frame script dynamically
      await new Promise<void>((resolve) => {
        if ((window as any).AFRAME) return resolve();
        const aframeScr = document.createElement('script');
        aframeScr.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
        aframeScr.onload = () => resolve();
        document.head.appendChild(aframeScr);
      });

      // 3. Load MindAR-AFrame script dynamically
      await new Promise<void>((resolve) => {
        if ((window as any).MINDAR) return resolve();
        const mindarScr = document.createElement('script');
        mindarScr.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js';
        mindarScr.onload = () => resolve();
        document.head.appendChild(mindarScr);
      });

      setLibrariesLoaded(true);
    }
    init();
  }, [projectId]);

  // Bind Target Found / Lost to Video Autoplay
  useEffect(() => {
    if (!librariesLoaded || !targetRef.current) return;
    
    const target = targetRef.current;
    
    const targetFoundHandler = () => {
      console.log('Target Found');
      const videoEl = document.querySelector('#ar-video') as HTMLVideoElement;
      if (videoEl) videoEl.play().catch(e => console.warn('Auto-play blocked:', e));
    };

    const targetLostHandler = () => {
      console.log('Target Lost');
      const videoEl = document.querySelector('#ar-video') as HTMLVideoElement;
      if (videoEl) videoEl.pause();
    };

    target.addEventListener('targetFound', targetFoundHandler);
    target.addEventListener('targetLost', targetLostHandler);

    return () => {
      target.removeEventListener('targetFound', targetFoundHandler);
      target.removeEventListener('targetLost', targetLostHandler);
    };
  }, [librariesLoaded]);

  if (!projectData) {
    return <div className="text-white text-center p-20 bg-black min-h-screen">Loading AR experience for {projectId}...</div>;
  }

  if (!librariesLoaded) {
    return <div className="text-white text-center p-20 bg-black min-h-screen">Downloading AR Engine...</div>;
  }

  // Calculate approximate width/height for A-Video based on typical photo ratios (assuming 3:4 or 4:3 default for now, scale 1:1)
  // To avoid stretching, keeping width=1 height=1 covers the tracked square. It will naturally stretch to the tracked image size based on the .mind dimensions.

  return (
    <div className="w-full h-screen overflow-hidden fixed inset-0 z-50">
      <a-scene 
        mindar-image={`imageTargetSrc: ${projectData.tracking_url};`} 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights" 
        vr-mode-ui="enabled: false" 
        device-orientation-permission-ui="enabled: false"
      >
        <a-assets>
          <video 
            id="ar-video" 
            crossOrigin="anonymous" 
            src={projectData.video_url} 
            type="video/mp4" 
            preload="auto" 
            loop
            playsInline
            muted={false} // May require user interaction to unmute depending on mobile browser policy, or we start muted and add an unmute UI button. For MVP, many users will click the 'play' or tap screen. Let's keep it unmuted to test PRD requirement, but be aware of safari autoplay policies.
          />
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        <a-entity mindar-image-target="targetIndex: 0" ref={targetRef}>
          <a-video src="#ar-video" position="0 0 0" width="1" height={aspectRatio}></a-video>
        </a-entity>
      </a-scene>

      {/* Overlay for user interaction prompt to bypass autoplay policies */}
      <div className="absolute top-0 w-full p-4 bg-black/50 text-white text-center pointer-events-none z-10 flex flex-col items-center gap-2">
        <span>Point camera at your photo. TAP screen to unmute/ensure playback.</span>
      </div>
      
      {/* Invisible screen tap overlay for Audio Context initialization */}
      <div 
        className="absolute inset-0 z-0" 
        onClick={() => {
            const v = document.getElementById('ar-video') as HTMLVideoElement;
            if (v) { v.muted = false; v.play(); v.pause(); } // primes the audio
        }}
      />
    </div>
  );
}
