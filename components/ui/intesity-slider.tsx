import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IntensitySliderProps {
  /** Current value (controlled) */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Min value — defaults to 0 */
  min?: number;
  /** Max value — defaults to 100 */
  max?: number;
  /** Step size — defaults to 1 */
  step?: number;
  /** Number of tick marks shown below the track */
  tickCount?: number;
  /** Label for the low end */
  lowLabel?: string;
  /** Label for the high end */
  highLabel?: string;
  /** Called whenever the value changes */
  onValueChange?: (value: number) => void;
  /** Called when the user stops dragging */
  onValueCommit?: (value: number) => void;
  /** Additional class names for the wrapper */
  className?: string;
  /** Disable the slider */
  disabled?: boolean;
}

// ─── Tick marks ──────────────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────

const IntensitySlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, IntensitySliderProps>(({ value, defaultValue = 50, min = 0, max = 100, step = 1, onValueChange, onValueCommit, className, disabled = false }, ref) => {
  // Support both controlled and uncontrolled usage
  const [internalValue, setInternalValue] = React.useState(value ?? defaultValue);

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (vals: number[]) => {
    setInternalValue(vals[0]);
    onValueChange?.(vals[0]);
  };

  const handleValueCommit = (vals: number[]) => {
    onValueCommit?.(vals[0]);
  };

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  return (
    <div className={cn("rounded-2xl shadow-sm  w-full max-w-lg select-none", className)}>
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={[currentValue]}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        disabled={disabled}
        className={cn("relative flex items-center w-full h-[28px] touch-none", disabled && "opacity-50 cursor-not-allowed")}
        aria-label="Intensity"
      >
        <SliderPrimitive.Track className="relative w-full h-[16px] rounded-full bg-[#161616] overflow-hidden">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-[#7c5aff] shadow-[inset_0_1px_rgb(255_255_255/0.15)] transition-all" />
        </SliderPrimitive.Track>
        {/* <SliderPrimitive.Thumb className="block size-5 rounded-full border-2 border-white bg-[#7c5aff] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" /> */}
      </SliderPrimitive.Root>
    </div>
  );
});

IntensitySlider.displayName = "IntensitySlider";

export { IntensitySlider };
export type { IntensitySliderProps };
