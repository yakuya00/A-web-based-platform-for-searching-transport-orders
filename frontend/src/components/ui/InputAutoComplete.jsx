import React from 'react';
import { Input } from '@/components/ui/input';

const InputAutoComplete = ({
  label,
  isLoading,
  items,
  onItemSelect,
  isSelected,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 relative z-50">
      {label && (
        <label className="block text-xs text-gray-600 font-semibold uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          className={className}
          {...props}
          aria-invalid={error ? 'true' : 'false'}
        />

        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {items && items.length > 0 && (
          <ul className="absolute z-50 top-full left-0 w-full bg-white border text-gray-700 border-gray-300 shadow-xl rounded-md max-h-60 overflow-auto mt-1">
            {items.map((item) => (
              <li
                key={item.place_id}
                onMouseDown={() => onItemSelect(item)}
                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm"
              >
                {item.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};

export default InputAutoComplete;
