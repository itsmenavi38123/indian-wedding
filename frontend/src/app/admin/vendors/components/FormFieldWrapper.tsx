'use client';

import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldWrapperProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isMultiSelect?: boolean;
  options?: { label: string; value: string }[];
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  isMultiSelect,
  options,
}) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {isMultiSelect && options ? (
              <div className="w-full min-h-[44px]">
                <MultiSelect
                  options={options}
                  value={field.value ? (field.value as string).split(',') : []}
                  onChange={(val) => field.onChange((val as string[]).join(','))}
                />
              </div>
            ) : type === 'select' && options ? (
              <select
                {...field}
                disabled={disabled}
                required={required}
                className="border rounded p-2 w-full h-10 bg-white"
              >
                <option value="">{placeholder || `Select ${label}`}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : type === 'textarea' ? (
              <textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                rows={3}
                className="border rounded p-2 w-full min-h-[80px] resize-vertical"
                onChange={(e) => field.onChange(e.target.value)}
              />
            ) : (
              <div className="relative w-full">
                <input
                  {...field}
                  type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                  placeholder={placeholder}
                  disabled={disabled}
                  required={required}
                  className="border rounded p-2 w-full h-10 pr-10"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === 'number') {
                      field.onChange(val === '' ? undefined : Number(val));
                    } else if (type === 'tel') {
                      field.onChange(val.replace(/\D/g, ''));
                    } else {
                      field.onChange(val);
                    }
                  }}
                />
                {type === 'password' && (
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                )}
              </div>
            )}
          </FormControl>
          {fieldState.error ? (
            <p className="text-red-500 text-sm mt-1 min-h-[8px]">{fieldState.error.message}</p>
          ) : (
            <p className="min-h-[8px]" />
          )}
        </FormItem>
      )}
    />
  );
};
