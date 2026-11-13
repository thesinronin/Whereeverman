import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dices, Shuffle, Volume2, VolumeX } from 'lucide-react';
import type { FoodPlace } from '../types';
import { SLICE_PALETTE, formatDistance } from '../utils/geo';
import { playWheelTick, playWinChime } from '../utils/sound';

interface RouletteWheelProps {
  slices: FoodPlace[];
  winner: FoodPlace | null;
  isLoading: boolean;
  spinRequestCount: number;
  onSpinStart: () => void;
  onSpinComplete: (winner: FoodPlace) => void;
  onShuffle: () => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  slices,
  winner,
  isLoading,
  spinRequestCount,
  onSpinStart,
  onSpinComplete,
  onShuffle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const isSpinningRef = useRef<boolean>(false);
  const lastSliceIndexRef = useRef<number>(-1);
  const lastHandledRequestRef = useRef<number>(0);

  const [isSpinning, setIsSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clapperAngle, setClapperAngle] = useState(0);
  const [livePointerLabel, setLivePointerLabel] = useState<string>('');

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const getSliceIndexAtTop = useCallback(
    (rotation: number, count: number): number => {
      if (count <= 0) return -1;
      const sliceAngle = (2 * Math.PI) / count;
      const twoPi = 2 * Math.PI;
      const rel = ((-Math.PI / 2 - rotation) % twoPi + twoPi) % twoPi;
      return Math.floor(rel / sliceAngle) % count;
    },
    []
  );

  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const cssSize = canvas.clientWidth;
      if (!cssSize) return;

      const targetSize = Math.round(cssSize * dpr);
      if (canvas.width !== targetSize || canvas.height !== targetSize) {
        canvas.width = targetSize;
        canvas.height = targetSize;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssSize, cssSize);

      const cx = cssSize / 2;
      const cy = cssSize / 2;
      const outerRadius = cssSize / 2 - 8;
      const rimThickness = 11;
      const wheelRadius = outerRadius - rimThickness;

      // Outer dark bezel shadow & rim
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#181615';
      ctx.fill();

      const count = slices.length;
      if (count === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, wheelRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#EFECE5';
        ctx.fill();

        ctx.fillStyle = '#6B655E';
        ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          isLoading ? 'Scanning nearby spots...' : 'No places on wheel',
          cx,
          cy
        );
        ctx.restore();
        return;
      }

      const sliceAngle = (2 * Math.PI) / count;

      // Draw each slice
      for (let i = 0; i < count; i++) {
        const startAngle = rotation + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;
        const palette = SLICE_PALETTE[i % SLICE_PALETTE.length];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, wheelRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = palette.bg;
        ctx.fill();

        // Crisp hairline divider between slices
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(24, 22, 21, 0.22)';
        ctx.stroke();

        // Slice label along bisector
        const midAngle = startAngle + sliceAngle / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(midAngle);

        const fontSize =
          count <= 6 ? 13 : count <= 12 ? 11.5 : count <= 16 ? 10 : 9.2;
        ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = palette.text;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const maxTextWidth = wheelRadius * 0.58;
        const rawName = slices[i].displayName;
        let label = rawName;
        if (ctx.measureText(label).width > maxTextWidth) {
          while (
            label.length > 3 &&
            ctx.measureText(`${label}…`).width > maxTextWidth
          ) {
            label = label.slice(0, -1);
          }
          label = `${label.trim()}…`;
        }

        ctx.fillText(label, wheelRadius - 18, 0);
        ctx.restore();
      }

      // Draw tactile perimeter pegs at slice boundaries
      for (let i = 0; i < count; i++) {
        const angle = rotation + i * sliceAngle;
        const pegX = cx + Math.cos(angle) * (outerRadius - rimThickness / 2);
        const pegY = cy + Math.sin(angle) * (outerRadius - rimThickness / 2);

        ctx.beginPath();
        ctx.arc(pegX, pegY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#F7F5F0';
        ctx.fill();
      }

      // Inner rim highlight
      ctx.beginPath();
      ctx.arc(cx, cy, wheelRadius, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.stroke();

      // Center brass/obsidian cap
      const hubRadius = Math.max(24, wheelRadius * 0.17);
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#181615';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#F7F5F0';
      ctx.fill();

      ctx.restore();
    },
    [slices, isLoading]
  );

  // Redraw wheel when slices or viewport resize changes
  useEffect(() => {
    drawWheel(rotationRef.current);
    const idx = getSliceIndexAtTop(rotationRef.current, slices.length);
    if (idx >= 0 && slices[idx]) {
      setLivePointerLabel(slices[idx].displayName);
    } else {
      setLivePointerLabel('');
    }
  }, [slices, drawWheel, getSliceIndexAtTop]);

  useEffect(() => {
    const handleResize = () => drawWheel(rotationRef.current);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWheel]);

  const startSpin = useCallback(() => {
    if (isSpinningRef.current || slices.length < 2 || isLoading) return;

    isSpinningRef.current = true;
    setIsSpinning(true);
    onSpinStart();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const randomIdx = Math.floor(Math.random() * slices.length);
      const sliceAngle = (2 * Math.PI) / slices.length;
      const targetRotation =
        -Math.PI / 2 - (randomIdx + 0.5) * sliceAngle;
      rotationRef.current = targetRotation;
      drawWheel(targetRotation);
      isSpinningRef.current = false;
      setIsSpinning(false);
      setLivePointerLabel(slices[randomIdx].displayName);
      if (soundEnabledRef.current) playWinChime();
      onSpinComplete(slices[randomIdx]);
      return;
    }

    const startRotation = rotationRef.current;
    // 5 to 8 full spins + random target offset
    const extraSpins = (5 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const randomOffset = Math.random() * 2 * Math.PI;
    const totalDelta = extraSpins + randomOffset;
    const duration = 4300 + Math.random() * 900;
    const startTime = performance.now();

    lastSliceIndexRef.current = getSliceIndexAtTop(
      startRotation,
      slices.length
    );

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutQuart(progress);
      const currentRotation = startRotation + totalDelta * eased;

      rotationRef.current = currentRotation;
      drawWheel(currentRotation);

      const currentIdx = getSliceIndexAtTop(currentRotation, slices.length);
      if (currentIdx !== lastSliceIndexRef.current && currentIdx >= 0) {
        lastSliceIndexRef.current = currentIdx;
        if (slices[currentIdx]) {
          setLivePointerLabel(slices[currentIdx].displayName);
        }
        const velocityRatio = Math.max(0, 1 - progress);
        if (soundEnabledRef.current) {
          playWheelTick(velocityRatio);
        }
        setClapperAngle(-24);
        setTimeout(() => setClapperAngle(0), 65);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        isSpinningRef.current = false;
        setIsSpinning(false);
        setClapperAngle(0);
        const winningIdx = getSliceIndexAtTop(currentRotation, slices.length);
        const winningPlace = slices[winningIdx] ?? slices[0];
        if (winningPlace) {
          setLivePointerLabel(winningPlace.displayName);
          if (soundEnabledRef.current) playWinChime();
          onSpinComplete(winningPlace);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [
    slices,
    isLoading,
    drawWheel,
    getSliceIndexAtTop,
    onSpinStart,
    onSpinComplete,
  ]);

  useEffect(() => {
    if (
      spinRequestCount > 0 &&
      spinRequestCount !== lastHandledRequestRef.current
    ) {
      lastHandledRequestRef.current = spinRequestCount;
      startSpin();
    }
  }, [spinRequestCount, startSpin]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const canSpin = slices.length >= 2 && !isSpinning && !isLoading;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Live ticker readout above wheel */}
      <div className="w-full max-w-[360px] mb-2 flex items-center justify-between gap-2 px-1">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#6B655E]">
            {isSpinning
              ? 'Spinning...'
              : winner
                ? 'Last Pick'
                : 'Pointer Target'}
          </p>
          <p className="text-sm font-semibold text-[#181615] truncate">
            {livePointerLabel ||
              (slices.length === 1
                ? slices[0].displayName
                : 'Ready to spin')}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onShuffle}
            disabled={isSpinning || slices.length < 2}
            aria-label="Shuffle wheel slices"
            title="Shuffle slice order"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E5E0D8] bg-white text-[#181615] hover:bg-[#EFECE5] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label={soundEnabled ? 'Mute wheel sound' : 'Enable wheel sound'}
            title={soundEnabled ? 'Sound on' : 'Sound muted'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E5E0D8] bg-white text-[#181615] hover:bg-[#EFECE5] transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#6B655E]" />
            )}
          </button>
        </div>
      </div>

      {/* Roulette Wheel Stage */}
      <div className="relative w-full max-w-[356px] sm:max-w-[392px] aspect-square flex items-center justify-center">
        {/* Physical Top Clapper / Pointer */}
        <div
          aria-hidden="true"
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none origin-top transition-transform duration-75 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${clapperAngle}deg)`,
          }}
        >
          <svg
            width="34"
            height="42"
            viewBox="0 0 34 42"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M17 40L4 12C2.2 8.2 4.9 3 9.2 3H24.8C29.1 3 31.8 8.2 30 12L17 40Z"
              fill="#E84826"
              stroke="#181615"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="17" cy="11" r="3.5" fill="#F7F5F0" />
          </svg>
        </div>

        <canvas
          ref={canvasRef}
          onClick={canSpin ? startSpin : undefined}
          className={`w-full h-full rounded-full select-none ${
            canSpin ? 'cursor-pointer' : 'cursor-default'
          }`}
          aria-label="Food roulette wheel"
        />

        {/* Center Hub Spin Button */}
        <button
          type="button"
          onClick={startSpin}
          disabled={!canSpin}
          aria-label="Spin roulette wheel"
          className="absolute z-10 w-[72px] h-[72px] rounded-full bg-[#181615] text-white font-display font-bold text-xs tracking-wide uppercase flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-transform cursor-pointer"
        >
          <Dices className="w-5 h-5 mb-0.5 text-[#F2A922]" />
          <span>{isSpinning ? 'Wait' : 'Spin'}</span>
        </button>
      </div>

      {/* Primary Thumb-Zone CTA */}
      <div className="w-full max-w-[392px] mt-4">
        <button
          type="button"
          onClick={startSpin}
          disabled={!canSpin}
          className="w-full min-h-[50px] px-6 py-3 rounded-2xl bg-[#E84826] hover:bg-[#D53E1E] active:scale-[0.98] disabled:bg-[#D5CFC6] disabled:text-[#6B655E] text-white font-display font-bold text-base tracking-tight flex items-center justify-center gap-2.5 shadow-md shadow-[#E84826]/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Dices className="w-5 h-5" />
          <span>
            {isLoading
              ? 'Finding Nearby Places...'
              : isSpinning
                ? 'Wheel is Spinning...'
                : slices.length < 2
                  ? 'Need at least 2 places to spin'
                  : `Spin ${slices.length} Places`}
          </span>
        </button>

        {winner && !isSpinning && (
          <p className="mt-2 text-center text-xs text-[#6B655E] tabular-nums">
            Landed on <span className="font-semibold text-[#181615]">{winner.displayName}</span>{' '}
            · {formatDistance(winner.distanceMeters)} away
          </p>
        )}
      </div>
    </div>
  );
};
