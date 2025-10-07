'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  React.useEffect(() => {
    if (value) setDate(value);
  }, [value]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[250px] justify-start text-left font-normal h-[40px] md:h-[45px] bg-transparent text-white hover:bg-transparent hover:text-white"
        >
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={date?.from && date?.to ? { from: date.from, to: date.to } : undefined}
          onSelect={(val: any) => {
            setDate(val);
            if (val?.from && val?.to) onChange?.(val);
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
