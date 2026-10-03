import React from 'react';

interface DateFieldProps {
  id: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  min?: string | null;
  max?: string | null;
  invalid?: boolean;
}

export function DateField({ id, label, value, onChange, min, max, invalid = false }: DateFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value ?? ''}
        min={min ?? undefined}
        max={max ?? undefined}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg transition-colors duration-150 hover:border-subtle focus:border-analytics focus:outline-none focus-visible:ring-2 focus-visible:ring-analytics aria-[invalid=true]:border-danger" />
      
    </div>);

}