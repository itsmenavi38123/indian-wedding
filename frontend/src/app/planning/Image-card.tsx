'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ImageCardProps = {
  src: string;
  alt: string;
  title: string;
  categoryLabel: string;
  onClick?: () => void;
  className?: string;
};

export function ImageCard({ src, alt, title, categoryLabel, onClick, className }: ImageCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative text-left transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      aria-label={`Open photos for ${categoryLabel}: ${title}`}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] w-full">
            {/* Using next/image for better perf; using /placeholder.svg with fixed query as required */}
            <Image
              src={src || '/placeholder.svg'}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
            />
          </div>
        </CardContent>
      </Card>

      <div className="pointer-events-none absolute left-2 top-2">
        <Badge variant="secondary">{categoryLabel}</Badge>
      </div>

      <div className="mt-2">
        <p className="line-clamp-1 text-sm font-medium">{title}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">Tap to see more</p>
      </div>
    </button>
  );
}
