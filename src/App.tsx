import React, { useState, useEffect, useRef } from 'react';
import { OledCanvas } from './components/OledCanvas';
import { Controls } from './components/Controls';
import { PersonalizeModal } from './components/PersonalizeModal';
import { ShareModal } from './components/ShareModal';
import { StoryGuide } from './components/StoryGuide';
import { OledTheme, PersonalizationData, SCENES } from './types';
import { soundEngine } from './audio/soundEngine';
import { resolveInitialPersonalization } from './utils/urlHelper';
import { Heart, Sparkles, Tv, Share2, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'oled_love_personalization_v1';

// Initial resolution from server bootstrap script or query params
const initialResolution = resolveInitialPersonalization(STORAGE_KEY);

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [currentSceneId, setCurrentSceneId] = useState<number>(initialResolution.initialScene);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Display style state
  const [theme, setTheme] = useState<OledTheme>('cyan');
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [showGlow, setShowGlow] = useState<boolean>(true);

  // Modals
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isStoryGuideOpen, setIsStoryGuideOpen] = useState<boolean>(false);

  // Personalization state (loaded from server bootstrap JSON, URL, or LocalStorage)
  const [personalization, setPersonalization] = useState<PersonalizationData>(
    initialResolution.personalization
  );

  // Save to localStorage when changed
  const handleSavePersonalization = (data: PersonalizationData) => {
    setPersonalization(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // Mute / Unmute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setEnabled(!nextMuted);
  };

  // Replay
  const handleReplay = () => {
    setCurrentSceneId(1);
    setIsPlaying(true);
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        handleReplay();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'ArrowRight') {
        setCurrentSceneId((prev) => Math.min(SCENES.length, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSceneId((prev) => Math.max(1, prev - 1));
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted]);

  const activeSceneMeta = SCENES[currentSceneId - 1] || SCENES[0];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#07090d] text-neutral-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans"
    >
      {/* TOP HEADER */}
      <header className="w-full border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Heart className="w-4 h-4 fill-cyan-400 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                  OLED Love Animation
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  12 Scenes
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden xs:block">
                Retro pixel-art romantic story with cityscape & heart transformation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPersonalizeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs border border-neutral-700 transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span className="hidden sm:inline">
                {personalization.recipient ? `For ${personalization.recipient}` : 'Personalize'}
              </span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 md:py-8 flex flex-col items-center justify-center">
        {/* Recipient & Custom Message Banner Notice if configured */}
        {(personalization.recipient || personalization.customMessage) && (
          <div className="mb-4 w-full max-w-[760px] px-4 py-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-rose-300">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {personalization.recipient && (
                  <span>
                    Untuk: <strong className="text-white font-semibold">{personalization.recipient}</strong>
                  </span>
                )}
                {personalization.sender && (
                  <span className="text-neutral-400">
                    • Dari: <strong className="text-neutral-200 font-semibold">{personalization.sender}</strong>
                  </span>
                )}
              </div>
            </div>

            {personalization.customMessage && (
              <div className="px-3 py-1 rounded-xl bg-neutral-800/90 border border-neutral-700 text-cyan-300 text-center sm:text-right font-medium text-xs tracking-wide shadow-inner">
                "{personalization.customMessage}"
              </div>
            )}
          </div>
        )}

        {/* OLED SCREEN MODULE */}
        <OledCanvas
          isPlaying={isPlaying}
          onPlayStateChange={setIsPlaying}
          speed={speed}
          theme={theme}
          showScanlines={showScanlines}
          showGlow={showGlow}
          personalization={personalization}
          currentSceneId={currentSceneId}
          onSceneChange={setCurrentSceneId}
          isLooping={isLooping}
        />

        {/* CONTROLS BAR */}
        <Controls
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onReplay={handleReplay}
          currentSceneId={currentSceneId}
          onSceneSelect={setCurrentSceneId}
          speed={speed}
          onSpeedChange={setSpeed}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isLooping={isLooping}
          onToggleLoop={() => setIsLooping(!isLooping)}
          onToggleFullscreen={handleToggleFullscreen}
          theme={theme}
          onThemeChange={setTheme}
          showScanlines={showScanlines}
          onToggleScanlines={() => setShowScanlines(!showScanlines)}
          showGlow={showGlow}
          onToggleGlow={() => setShowGlow(!showGlow)}
          onOpenPersonalize={() => setIsPersonalizeOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          onToggleStoryGuide={() => setIsStoryGuideOpen(true)}
        />

        {/* SCENE STORYBOARD INFO CARD */}
        <div className="w-full max-w-[760px] mt-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                SCENE {activeSceneMeta.id}/12
              </span>
              <span className="font-semibold">{activeSceneMeta.titleId}</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {activeSceneMeta.description}
            </p>
          </div>

          <button
            onClick={() => setIsStoryGuideOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>View All 12</span>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-neutral-900 py-4 px-6 text-center text-[11px] font-mono text-neutral-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OLED 256×160 Canvas Engine • Procedural Chiptune Audio • 100% Client-Side</span>
          <div className="flex items-center gap-3">
            <span className="text-neutral-400">Space: Play/Pause</span>
            <span>•</span>
            <span className="text-neutral-400">R: Replay</span>
            <span>•</span>
            <span className="text-neutral-400">M: Audio</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <PersonalizeModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        personalization={personalization}
        onSave={handleSavePersonalization}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        personalization={personalization}
      />

      <StoryGuide
        isOpen={isStoryGuideOpen}
        onClose={() => setIsStoryGuideOpen(false)}
        currentSceneId={currentSceneId}
        onSelectScene={setCurrentSceneId}
      />
    </div>
  );
}
