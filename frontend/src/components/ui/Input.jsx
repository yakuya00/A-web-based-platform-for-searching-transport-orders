import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 📏 ЖЕСТКИЙ РАЗМЕР (40px) и базовое поведение:
        'flex h-11 w-full px-3 py-2',

        // 🎨 ТВОЙ ФИРМЕННЫЙ СТИЛЬ:
        'text-sm text-gray-700 bg-white border border-border rounded-lg outline-none transition-all',

        // ✨ ТВОЙ КРАСИВЫЙ ФОКУС (мягкое свечение):
        'focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10',
        'aria-invalid:border-red-500 aria-invalid:bg-red-50 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-500/20 aria-invalid:text-red-900',

        // 🛡️ Стандартные фишки (плейсхолдеры и заблокированное состояние):
        'placeholder:text-gray-400',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  );
}

export { Input };
