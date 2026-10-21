import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Sliders,
  Heart,
  Share2,
  Tv,
  Sparkles,
} from 'lucide-react';
import { SCENES, OledTheme } from '../types';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  currentSceneId: number;
  onSceneSelect: (sceneId: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  onToggleFullscreen: () => void;
  theme: OledTheme;
  onThemeChange: (theme: OledTheme) => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
  showGlow: boolean;
  onToggleGlow: () => void;
  onOpenPersonalize: () => void;
  onOpenShare: () => void;
  onToggleStoryGuide: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReplay,
  currentSceneId,
  onSceneSelect,
  speed,
  onSpeedChange,
  isMuted,
  onToggleMute,
  isLooping,
  onToggleLoop,
  onToggleFullscreen,
  theme,
  onThemeChange,
  showScanlines,
  onToggleScanlines,
  showGlow,
  onToggleGlow,
  onOpenPersonalize,
  onOpenShare,
  onToggleStoryGuide,
}) => {
  const speeds = [0.5, 1, 1.5, 2];
  const themes: { id: OledTheme; label: string; colorClass: string }[] = [
    { id: 'cyan', label: 'Cyan OLED', colorClass: 'bg-cyan-400' },
    { id: 'white', label: 'Monochrome', colorClass: 'bg-white' },
    { id: 'amber', label: 'Amber Vintage', colorClass: 'bg-amber-400' },
    { id: 'emerald', label: 'Matrix Green', colorClass: 'bg-emerald-400' },
  ];

  return (
    <div className="w-full max-w-[760px] mx-auto mt-4 space-y-3 font-mono text-sm">
      {/* PRIMARY PLAYBACK BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl backdrop-blur-md shadow-lg">
        {/* Play / Replay / Step buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
          </button>

          <button
            onClick={onReplay}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors active:scale-95 cursor-pointer"
            title="Replay from Beginning"
            aria-label="Replay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSceneSelect(Math.max(1, currentSceneId - 1))}
            disabled={currentSceneId <= 1}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-95 cursor-pointer"
            title="Previous Scene"
            aria-label="Previous Scene"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSceneSelect(Math.min(SCENES.length, currentSceneId + 1))}
            disabled={currentSceneId >= SCENES.length}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-95 cursor-pointer"
            title="Next Scene"
            aria-label="Next Scene"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Scene Selector Scrubber */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-center">
          <label htmlFor="scene-select" className="text-xs text-neutral-400 whitespace-nowrap">
            Scene:
          </label>
          <select
            id="scene-select"
            value={currentSceneId}
            onChange={(e) => onSceneSelect(Number(e.target.value))}
            className="bg-neutral-800/90 text-neutral-100 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-cyan-400 max-w-[240px] truncate cursor-pointer"
          >
            {SCENES.map((scene) => (
              <option key={scene.id} value={scene.id}>
                {scene.id}. {scene.titleEn}
              </option>
            ))}
          </select>
        </div>

        {/* Audio, Loop, Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors active:scale-95 cursor-pointer ${
              !isMuted
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
            }`}
            title={isMuted ? 'Unmute 8-bit Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleLoop}
            className={`px-2.5 h-9 rounded-xl text-xs font-medium transition-colors active:scale-95 cursor-pointer flex items-center gap-1 ${
              isLooping
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
            }`}
            title="Toggle Seamless Loop"
          >
            Loop
          </button>

          <button
            onClick={onToggleFullscreen}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors active:scale-95 cursor-pointer"
            title="Toggle Fullscreen"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECONDARY ACTION BAR: PERSONALIZE, SHARE, SPEED, THEME */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl backdrop-blur-sm">
        {/* Storyboard Guide & Personalize */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStoryGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-sans transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>12 Scenes Guide</span>
          </button>

          <button
            onClick={onOpenPersonalize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-sans transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>Personalize</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-sans transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Share WhatsApp</span>
          </button>
        </div>

        {/* Speed & Screen FX */}
        <div className="flex items-center gap-2">
          {/* Speed Pills */}
          <div className="flex items-center bg-neutral-800/90 rounded-xl p-0.5 border border-neutral-700">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                  speed === s
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Theme Palette Buttons */}
          <div className="flex items-center gap-1 bg-neutral-800/90 p-1 rounded-xl border border-neutral-700">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  theme === t.id ? 'ring-2 ring-white ring-offset-1 ring-offset-neutral-900 scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                title={t.label}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${t.colorClass}`} />
              </button>
            ))}
          </div>

          {/* Scanlines Toggle */}
          <button
            onClick={onToggleScanlines}
            className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
              showScanlines
                ? 'bg-neutral-800 text-cyan-400 border-cyan-500/40'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700'
            }`}
            title="Toggle Retro Scanlines"
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
