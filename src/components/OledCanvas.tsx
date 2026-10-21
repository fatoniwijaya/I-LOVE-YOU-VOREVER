import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PixelRenderer, LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../pixel/renderer';
import { SCENES, OledTheme, PersonalizationData } from '../types';
import { soundEngine } from '../audio/soundEngine';

interface OledCanvasProps {
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  speed: number;
  theme: OledTheme;
  showScanlines: boolean;
  showGlow: boolean;
  personalization: PersonalizationData;
  currentSceneId: number;
  onSceneChange: (sceneId: number) => void;
  isLooping: boolean;
}

const THEME_COLORS: Record<OledTheme, { primary: string; glow: string; border: string }> = {
  cyan: {
    primary: '#FFFFFF',
    glow: 'rgba(0, 240, 255, 0.35)',
    border: 'border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.45)]',
  },
  white: {
    primary: '#FFFFFF',
    glow: 'rgba(255, 255, 255, 0.25)',
    border: 'border-neutral-400/60 shadow-[0_0_18px_rgba(255,255,255,0.35)]',
  },
  amber: {
    primary: '#FFBE3B',
    glow: 'rgba(255, 170, 0, 0.35)',
    border: 'border-amber-500/60 shadow-[0_0_20px_rgba(255,170,0,0.45)]',
  },
  emerald: {
    primary: '#4EFE95',
    glow: 'rgba(50, 255, 120, 0.35)',
    border: 'border-emerald-500/60 shadow-[0_0_20px_rgba(50,255,120,0.45)]',
  },
};

export const OledCanvas: React.FC<OledCanvasProps> = ({
  isPlaying,
  onPlayStateChange,
  speed,
  theme,
  showScanlines,
  showGlow,
  personalization,
  currentSceneId,
  onSceneChange,
  isLooping,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<PixelRenderer | null>(null);

  // Animation timeline state
  const animStateRef = useRef({
    currentSceneIdx: currentSceneId - 1,
    sceneTime: 0,
    totalTime: 0,
    lastFrameTimestamp: 0,
    isPlaying: isPlaying,
    speed: speed,
    lastBeatTime: 0,
    lastFootstepStep: -1,
  });

  // Sync prop changes into ref to avoid restarting requestAnimationFrame loop
  useEffect(() => {
    animStateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    animStateRef.current.speed = speed;
  }, [speed]);

  // Sync external scene changes
  useEffect(() => {
    if (animStateRef.current.currentSceneIdx !== currentSceneId - 1) {
      animStateRef.current.currentSceneIdx = currentSceneId - 1;
      animStateRef.current.sceneTime = 0;
      rendererRef.current?.clearParticles();
      triggerSceneSound(currentSceneId);
    }
  }, [currentSceneId]);

  // Sound triggers per scene change
  const triggerSceneSound = useCallback((sceneId: number) => {
    if (sceneId === 3) soundEngine.playMeeting();
    else if (sceneId === 4) soundEngine.playHug();
    else if (sceneId === 6) soundEngine.playSparkle();
    else if (sceneId === 7) soundEngine.playHeartAppear();
    else if (sceneId === 9) soundEngine.playRevealFanfare();
  }, []);

  // Set up high-DPI canvas & start animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Crisp pixel art settings
    ctx.imageSmoothingEnabled = false;
    rendererRef.current = new PixelRenderer(ctx);

    let animationFrameId: number;

    const loop = (timestamp: number) => {
      if (!animStateRef.current.lastFrameTimestamp) {
        animStateRef.current.lastFrameTimestamp = timestamp;
      }
      const rawDelta = (timestamp - animStateRef.current.lastFrameTimestamp) / 1000;
      animStateRef.current.lastFrameTimestamp = timestamp;

      // Clamp delta to prevent crazy leaps when tab regains focus
      const dt = Math.min(rawDelta, 0.1) * animStateRef.current.speed;

      if (animStateRef.current.isPlaying) {
        animStateRef.current.sceneTime += dt;
        animStateRef.current.totalTime += dt;

        const currentScene = SCENES[animStateRef.current.currentSceneIdx];
        const sceneDuration = currentScene.duration;

        // Check if scene finished
        if (animStateRef.current.sceneTime >= sceneDuration) {
          if (animStateRef.current.currentSceneIdx < SCENES.length - 1) {
            animStateRef.current.currentSceneIdx += 1;
            animStateRef.current.sceneTime = 0;
            const newSceneId = animStateRef.current.currentSceneIdx + 1;
            onSceneChange(newSceneId);
            triggerSceneSound(newSceneId);
          } else if (isLooping) {
            // Loop back to Scene 1
            animStateRef.current.currentSceneIdx = 0;
            animStateRef.current.sceneTime = 0;
            rendererRef.current?.clearParticles();
            onSceneChange(1);
          } else {
            // Pause at the end
            animStateRef.current.isPlaying = false;
            onPlayStateChange(false);
          }
        }

        // Sound triggers during timeline
        const sIdx = animStateRef.current.currentSceneIdx + 1;
        const sTime = animStateRef.current.sceneTime;

        // Footsteps in scenes 1 and 2
        if (sIdx === 1 || sIdx === 2) {
          const stepIndex = Math.floor(animStateRef.current.totalTime * 3.5);
          if (stepIndex !== animStateRef.current.lastFootstepStep) {
            animStateRef.current.lastFootstepStep = stepIndex;
            soundEngine.playFootstep();
          }
        }

        // Heartbeat in scenes 10, 11, 12
        if (sIdx >= 10) {
          if (timestamp - animStateRef.current.lastBeatTime > 900) {
            animStateRef.current.lastBeatTime = timestamp;
            soundEngine.playHeartbeat();
          }
        }
      }

      // Render the current scene
      const sceneId = animStateRef.current.currentSceneIdx + 1;
      const currentDuration = SCENES[animStateRef.current.currentSceneIdx]?.duration || 3;
      const progress = Math.min(1, animStateRef.current.sceneTime / currentDuration);

      if (rendererRef.current) {
        rendererRef.current.renderScene(
          sceneId,
          progress,
          animStateRef.current.totalTime,
          THEME_COLORS[theme].primary,
          personalization
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, personalization, isLooping, onSceneChange, onPlayStateChange, triggerSceneSound]);

  const themeStyle = THEME_COLORS[theme];

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      {/* RETRO OLED DISPLAY ENCLOSURE */}
      <div className="relative w-full max-w-[760px] p-3 sm:p-5 md:p-6 rounded-[28px] bg-gradient-to-b from-[#1c1f24] via-[#101216] to-[#07090b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        {/* CORNER MOUNTING SCREWS */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-3.5 h-3.5 rounded-full bg-neutral-800 border border-neutral-600 shadow-inner flex items-center justify-center">
          <div className="w-2 h-0.5 bg-neutral-400 rotate-45 rounded-sm" />
          <div className="w-0.5 h-2 bg-neutral-400 -rotate-45 rounded-sm absolute" />
        </div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3.5 h-3.5 rounded-full bg-neutral-800 border border-neutral-600 shadow-inner flex items-center justify-center">
          <div className="w-2 h-0.5 bg-neutral-400 -rotate-12 rounded-sm" />
          <div className="w-0.5 h-2 bg-neutral-400 rotate-78 rounded-sm absolute" />
        </div>
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-3.5 h-3.5 rounded-full bg-neutral-800 border border-neutral-600 shadow-inner flex items-center justify-center">
          <div className="w-2 h-0.5 bg-neutral-400 rotate-30 rounded-sm" />
          <div className="w-0.5 h-2 bg-neutral-400 -rotate-60 rounded-sm absolute" />
        </div>
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-3.5 h-3.5 rounded-full bg-neutral-800 border border-neutral-600 shadow-inner flex items-center justify-center">
          <div className="w-2 h-0.5 bg-neutral-400 -rotate-45 rounded-sm" />
          <div className="w-0.5 h-2 bg-neutral-400 rotate-45 rounded-sm absolute" />
        </div>

        {/* OLED MODULE SILKSCREEN PINOUT HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 pb-2.5 text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-neutral-300 font-semibold">OLED 128x64</span>
            <span className="text-neutral-600 hidden sm:inline">| 16:10 PIXEL MATRIX</span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-neutral-400 tracking-widest font-mono">
            VCC • GND • SCL • SDA
          </div>
        </div>

        {/* INNER SCREEN BEZEL & ACTIVE OLED AREA */}
        <div
          className={`relative overflow-hidden rounded-xl bg-black border-2 transition-all duration-300 ${themeStyle.border} ${
            showGlow ? 'shadow-[0_0_35px_rgba(0,240,255,0.25)]' : ''
          }`}
          style={{ aspectRatio: '16 / 10' }}
        >
          {/* THE CANVAS */}
          <canvas
            ref={canvasRef}
            width={LOGICAL_WIDTH}
            height={LOGICAL_HEIGHT}
            className="w-full h-full block pixelated"
            style={{
              imageRendering: 'pixelated',
            }}
          />

          {/* VINTAGE SCANLINES OVERLAY */}
          {showScanlines && (
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0px, rgba(0, 0, 0, 0.6) 1px, transparent 1px, transparent 2px)',
                backgroundSize: '100% 2px',
              }}
            />
          )}

          {/* CRT / GLASS SPECULAR REFLECTION */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-cyan-500/10 to-white/10"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* SUBTLE VIGNETTE */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.85)]" />
        </div>

        {/* LOWER BEZEL CHIN WITH RETRO PRODUCT MARK */}
        <div className="pt-3 px-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold tracking-wider text-[10px] sm:text-[11px]">RETRO-OLED</span>
            <span className="text-neutral-600 hidden xs:inline">•</span>
            <span className="text-neutral-500 hidden xs:inline text-[10px]">12-SCENE ROMANCE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-[10px]">
              SCENE {currentSceneId}/12
            </span>
            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[9px] text-cyan-300 border border-neutral-700 max-w-[150px] truncate">
              {SCENES[currentSceneId - 1]?.titleEn}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
