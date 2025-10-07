'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}
interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  dropdownClassName?: string;
  className?: string; // for the trigger button
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  dropdownClassName = 'w-[300px]',
  className = '', // default empty
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeValue = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-between ${className}`} // use passed className
          >
            <span>{placeholder || 'Select options'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`p-0 ${dropdownClassName}`}>
          <div className="max-h-72 overflow-y-auto">
            <Command>
              {/* <CommandInput placeholder="Search..." /> */}
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => toggleValue(opt.value)}
                    className={value.includes(opt.value) ? 'bg-muted' : ''}
                  >
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((val) => {
            const label = options.find((o) => o.value === val)?.label || val;
            return (
              <Badge key={val} variant="secondary" className="flex items-center gap-1">
                {label}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeValue(val);
                  }}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </>
  );
}
