'use client';

import { useEffect, useState } from 'react';

export const ShimmerLoadingBar = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden rounded-t-lg">
      <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer" />
    </div>
  );
};

// 2. Pulsing border effect around the card
export const PulsingBorderLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 rounded-lg pointer-events-none">
      <div className="absolute inset-0 rounded-lg border-2 border-orange-400 animate-pulse" />
      <div className="absolute inset-0 rounded-lg border-2 border-orange-300 animate-ping" />
    </div>
  );
};

// 3. Progress bar that fills from left to right
export const ProgressBarLoader = ({ isLoading }: { isLoading: boolean }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// 4. Skeleton shimmer effect over entire card content
export const SkeletonShimmer = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
  );
};

// 5. Dots loader in the corner of the card
export const DotsLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute top-2 right-2 flex space-x-1">
      <div
        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <div
        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <div
        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

// 6. Circular progress indicator
export const CircularLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
};

// 7. Wave effect across the card
export const WaveLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden">
      <div className="relative w-full h-full">
        <div className="absolute w-full h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 animate-wave" />
      </div>
    </div>
  );
};

// 8. Glow effect around the card
export const GlowLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg blur-sm opacity-75 animate-pulse pointer-events-none" />
  );
};

// Main loading wrapper that can be used with any card
export const CardLoadingWrapper = ({
  children,
  isLoading,
  type = 'shimmer',
}: {
  children: React.ReactNode;
  isLoading: boolean;
  type?: 'shimmer' | 'border' | 'progress' | 'skeleton' | 'dots' | 'circular' | 'wave' | 'glow';
}) => {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 rounded-lg z-10 pointer-events-none" />
      )}

      {type === 'shimmer' && <ShimmerLoadingBar isLoading={isLoading} />}
      {type === 'border' && <PulsingBorderLoader isLoading={isLoading} />}
      {type === 'progress' && <ProgressBarLoader isLoading={isLoading} />}
      {type === 'skeleton' && <SkeletonShimmer isLoading={isLoading} />}
      {type === 'dots' && <DotsLoader isLoading={isLoading} />}
      {type === 'circular' && <CircularLoader isLoading={isLoading} />}
      {type === 'wave' && <WaveLoader isLoading={isLoading} />}
      {type === 'glow' && <GlowLoader isLoading={isLoading} />}

      {children}
    </div>
  );
};
