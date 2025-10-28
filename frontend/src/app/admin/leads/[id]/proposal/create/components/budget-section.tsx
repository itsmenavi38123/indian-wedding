'use client';

import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = {
  budget?: [number, number]; // budget range [min, max]
  onChange: (value: [number, number]) => void;
};

export function BudgetSection({ budget = [500000, 2000000], onChange }: Props) {
  const [value, setValue] = useState<[number, number]>(budget);

  useEffect(() => {
    setValue(budget);
  }, [budget]);

  function handleSliderChange(val: [number, number]) {
    setValue(val);
    onChange(val);
  }

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newMin = Math.max(500000, Number(e.target.value) || 0);
    const newRange: [number, number] = [Math.min(newMin, value[1]), value[1]];
    setValue(newRange);
    onChange(newRange);
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newMax = Math.min(20000000, Number(e.target.value) || 0);
    const newRange: [number, number] = [value[0], Math.max(newMax, value[0])];
    setValue(newRange);
    onChange(newRange);
  }

  const presets: [number, number][] = [
    [500000, 1000000],
    [1000000, 2500000],
    [2500000, 5000000],
    [5000000, 20000000],
  ];

  return (
    <section aria-labelledby="budget-heading" className="w-full">
      <h2 id="budget-heading" className="text-lg font-semibold text-white mb-2">
        Budget Range
      </h2>

      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        {/* Slider */}
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Select Range</Label>
        <Slider
          min={500000}
          max={20000000}
          step={1000}
          value={value}
          onValueChange={handleSliderChange}
        />

        {/* Range Inputs */}
        <div className="flex items-center gap-2 mt-3">
          <Input
            type="number"
            min={500000}
            max={value[1]}
            value={value[0]}
            onChange={handleMinChange}
            className="text-black"
          />
          <span>-</span>
          <Input
            type="number"
            min={value[0]}
            max={20000000}
            value={value[1]}
            onChange={handleMaxChange}
            className="text-black"
          />
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {presets.map((range, idx) => (
            <Button
              key={idx}
              variant="outline"
              type="button"
              onClick={() => {
                setValue(range);
                onChange(range);
              }}
            >
              ₹{range[0] / 100000}L - ₹{range[1] / 100000}L+
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
