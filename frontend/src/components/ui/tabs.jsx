import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Tabs({ className, orientation = 'horizontal', ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 flex-col', className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    size: {
      default: 'h-11 px-6 py-2',
      sm: 'h-9 rounded-lg px-4 text-xs',
      lg: 'h-14 rounded-2xl px-8 text-base',
      icon: 'h-11 w-11',
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function TabsList({ className, variant = 'default', ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      // Убрали кривой size="default", он не нужен в HTML-теге
      className={cn(
        // 1. БАЗА ОТ КНОПОК (чтобы размер, шрифт и отклики на клик были 1 в 1):
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 gap-2',
        'h-11 px-6 py-2', // Это размеры из size="default"

        // 2. ЦВЕТА И СОСТОЯНИЯ (заменили data-[active=true] на data-[state=active]!):
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:hover:bg-blue-100 data-[state=active]:shadow-sm',

        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none border-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
