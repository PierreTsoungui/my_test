
import { useId } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  id,
  disabled = false,
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-slate-800"
      >
        {label}
      </label>

      <select
        id={selectId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="
          min-h-11 rounded-lg border border-slate-400
          bg-white px-3 py-2 text-sm text-slate-900
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-blue-700
          focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-60
      "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
