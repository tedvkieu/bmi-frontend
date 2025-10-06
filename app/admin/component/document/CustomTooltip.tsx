import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface CustomTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  open?: boolean; // Optional: to control visibility from parent
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  children,
  content,
  delayDuration = 200, // Default delay
  side = 'top',
  align = 'center',
  sideOffset = 5,
  open,
  defaultOpen,
  onOpenChange,
}) => {
  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-800 text-white text-xs px-2.5 py-1 rounded-md shadow-lg select-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            side={side}
            align={align}
            sideOffset={sideOffset}
          >
            {content}
            <Tooltip.Arrow className="fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default CustomTooltip;