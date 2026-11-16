import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'block text-xs text-gray-600 font-semibold uppercase tracking-wide',
        className
      )}
      {...props}
    />
  );
}

export { Label };
