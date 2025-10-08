'use client';

import { useState, useEffect, useRef } from 'react';
import { formatINRWithCommas } from '@/lib/format';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  showFormatted?: boolean;
  currency?: string;
  onBlur?: () => void;
  onFocus?: () => void;
}

export function PriceInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  min = 0,
  max,
  showFormatted = true,
  currency = '₹',
  onBlur,
  onFocus,
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Remove non-numeric characters except decimal point
    const cleanedValue = inputValue.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = cleanedValue.split('.');
    const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');

    setDisplayValue(formattedValue);

    const numericValue = parseFloat(formattedValue) || 0;
    let finalValue = numericValue;

    // Apply min/max constraints
    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;

    onChange(finalValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value > 0 ? value.toString() : '');
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Format the value on blur
    const numericValue = parseFloat(displayValue) || 0;
    let finalValue = numericValue;

    // Apply min/max constraints
    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;

    onChange(finalValue);
    setDisplayValue(finalValue.toString());
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation keys, backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }

    // Ensure that it is a number or decimal point
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105) &&
      e.keyCode !== 190 &&
      e.keyCode !== 110
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={isFocused ? displayValue : formatINRWithCommas(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full ${className}`}
      />
      {showFormatted && !isFocused && value > 0 && (
        <div className="absolute -bottom-5 left-0 text-xs text-gray-600">
          {currency}
          {formatINRWithCommas(value)}
        </div>
      )}
    </div>
  );
}

export function PercentageInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  min = 0,
  max = 100,
}: Omit<PriceInputProps, 'currency' | 'showFormatted'>) {
  const [displayValue, setDisplayValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const cleanedValue = inputValue.replace(/[^\d.]/g, '');
    const parts = cleanedValue.split('.');
    const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');

    setDisplayValue(formattedValue);

    const numericValue = parseFloat(formattedValue) || 0;
    const finalValue = Math.min(max, Math.max(min, numericValue));

    onChange(finalValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value > 0 ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseFloat(displayValue) || 0;
    const finalValue = Math.min(max, Math.max(min, numericValue));
    onChange(finalValue);
    setDisplayValue(finalValue.toString());
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className}`}
      />
      <span className="ml-1">%</span>
    </div>
  );
}
