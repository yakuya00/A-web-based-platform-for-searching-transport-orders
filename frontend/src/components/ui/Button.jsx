import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 gap-2',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-lg',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
        outline:
          'border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-600',
        link: 'text-blue-600 underline-offset-4 hover:underline',

        // 🔥 ТВОЙ ИДЕАЛЬНЫЙ ПЕРЕКЛЮЧАТЕЛЬ!
        // По умолчанию он серый, но если есть data-active="true", он становится синим!
        tab: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:hover:bg-blue-100 data-[active=true]:shadow-sm',
        role_selection:
          'flex flex-col items-center border-2 border-gray-100 bg-transparent hover:border-blue-600 hover:bg-blue-50 group',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-14 rounded-2xl px-8 text-base',
        icon: 'h-11 w-11',
        role_selection: 'h-auto p-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
