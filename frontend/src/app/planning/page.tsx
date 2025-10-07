'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageCard } from './Image-card';

// Types
type CategoryId = 'entertainment' | 'food' | 'photography';

type Item = {
  id: string;
  title: string;
  category: CategoryId;
  coverSrc: string;
  alt: string;
};

// Category labels
const CATEGORY_LABEL: Record<CategoryId, string> = {
  entertainment: 'Entertainment (DJ)',
  food: 'Food & Catering',
  photography: 'Photography',
};

// Seed data: main grid cards (1-2 per category to start)
const ITEMS: Item[] = [
  {
    id: 'ent-1',
    title: 'Spark Beats DJ',
    category: 'entertainment',
    coverSrc: '/wedding-dj-booth-lights.jpg',
    alt: 'DJ booth with vibrant lights at a wedding reception',
  },
  {
    id: 'ent-2',
    title: 'Rhythmix Events',
    category: 'entertainment',
    coverSrc: '/wedding-dancefloor-dj.jpg',
    alt: 'Crowd dancing on a wedding dancefloor with DJ in the background',
  },
  {
    id: 'food-1',
    title: 'Gourmet Table',
    category: 'food',
    coverSrc: '/wedding-catering-buffet.jpg',
    alt: 'Elegant wedding buffet with assorted dishes and floral decor',
  },
  {
    id: 'food-2',
    title: 'Sweet Tier Cakes',
    category: 'food',
    coverSrc: '/wedding-cake-dessert-table.jpg',
    alt: 'Wedding cake on a dessert table with cupcakes and candles',
  },
  {
    id: 'photo-1',
    title: 'Golden Hour Studio',
    category: 'photography',
    coverSrc: '/wedding-couple-photoshoot-golden-hour.jpg',
    alt: 'Couple during a golden-hour outdoor wedding photoshoot',
  },
  {
    id: 'photo-2',
    title: 'Moments Captured Co.',
    category: 'photography',
    coverSrc: '/wedding-ceremony.png',
    alt: 'Photographer capturing a wedding ceremony moment',
  },
];

// Extra images shown after confirmation (by category)
const MORE_BY_CATEGORY: Record<CategoryId, { src: string; alt: string }[]> = {
  entertainment: [
    { src: '/wedding-dj-setup.jpg', alt: 'Professional DJ setup with speakers and lights' },
    { src: '/wedding-dancefloor-party.jpg', alt: 'Guests partying on the wedding dancefloor' },
    { src: '/wedding-uplighting-dj.jpg', alt: 'Reception hall with DJ uplighting' },
    { src: '/wedding-first-dance-dj.jpg', alt: 'First dance with DJ in the background' },
    { src: '/wedding-dj-crowd.jpg', alt: 'DJ hyping the crowd at a reception' },
    { src: '/wedding-dj-lights-smoke.jpg', alt: 'Light and smoke effects during the reception' },
  ],
  food: [
    { src: '/wedding-canapes.jpg', alt: 'Wedding canapés on a tray' },
    { src: '/wedding-buffet-spread.jpg', alt: 'Buffet spread with salads and mains' },
    { src: '/wedding-plated-dinner.jpg', alt: 'Plated dinner with garnish' },
    { src: '/wedding-dessert-bar.jpg', alt: 'Dessert bar with assorted pastries' },
    { src: '/placeholder.svg?height=480&width=640', alt: 'Signature cocktails on a bar' },
    { src: '/placeholder.svg?height=480&width=640', alt: 'Slice of wedding cake with flowers' },
  ],
  photography: [
    { src: '/placeholder.svg?height=480&width=640', alt: 'Bridal portrait with bouquet' },
    { src: '/placeholder.svg?height=480&width=640', alt: 'Groomsmen photo session' },
    { src: '/placeholder.svg?height=480&width=640', alt: 'Family group photo at ceremony' },
    { src: '/placeholder.svg?height=480&width=640', alt: 'Macro shot of wedding rings' },
    { src: '/placeholder.svg?height=480&width=640', alt: 'Wide shot of wedding venue' },
    { src: '/placeholder.svg?height=480&width=640', alt: 'Black-and-white dancefloor photo' },
  ],
};

export default function WeddingGallery() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<'confirm' | 'more'>('confirm');
  const [selected, setSelected] = React.useState<{
    category: CategoryId;
    itemTitle: string;
  } | null>(null);

  function onItemClick(item: Item) {
    setSelected({ category: item.category, itemTitle: item.title });
    setStep('confirm');
    setOpen(true);
  }

  function onClose() {
    setOpen(false);
    // Reset step so next time starts from confirm
    setTimeout(() => setStep('confirm'), 150);
  }

  const categoryLabel = selected ? CATEGORY_LABEL[selected.category] : '';

  return (
    <section aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="sr-only">
        Vendors gallery
      </h2>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <ImageCard
            key={item.id}
            src={item.coverSrc || '/placeholder.svg'}
            alt={item.alt}
            title={item.title}
            categoryLabel={CATEGORY_LABEL[item.category]}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>

      {/* Modal flow */}
      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : onClose())}>
        <DialogContent className="max-w-3xl">
          {step === 'confirm' && selected && (
            <>
              <DialogHeader>
                <DialogTitle>See more photos?</DialogTitle>
                <DialogDescription>
                  You tapped a photo in {categoryLabel}. Would you like to view more photos from
                  this category?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={onClose} aria-label="Cancel">
                  Not now
                </Button>
                <Button
                  onClick={() => setStep('more')}
                  aria-label={`Show more ${categoryLabel} photos`}
                >
                  Show more {categoryLabel}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'more' && selected && (
            <>
              <DialogHeader>
                <DialogTitle>More photos — {categoryLabel}</DialogTitle>
                <DialogDescription>
                  Browse a curated set of images from {categoryLabel}. Tap any image to close or
                  continue browsing.
                </DialogDescription>
              </DialogHeader>

              <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                {MORE_BY_CATEGORY[selected.category].map((img, idx) => (
                  <div
                    key={`${selected.category}-${idx}`}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-md"
                  >
                    {/* Simple <img> to avoid next/image layout in dialog; alt included for a11y */}
                    <img
                      src={img.src || '/placeholder.svg'}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                      onClick={onClose}
                    />
                  </div>
                ))}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setStep('confirm')} aria-label="Back">
                  Back
                </Button>
                <Button onClick={onClose} aria-label="Close">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
