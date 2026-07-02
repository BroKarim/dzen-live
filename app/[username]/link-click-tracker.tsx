"use client";

import { useCallback } from "react";
import { sendTrackingBeacon } from "./tracking";

export default function LinkClickTracker({ children, linkId }: { children: React.ReactNode; linkId: string }) {
  const handleClick = useCallback(() => {
    sendTrackingBeacon(linkId);
  }, [linkId]);

  // role="presentation" tells a11y this is a non-interactive wrapper div —
  // keyboard events are handled by TexturedCard (the actual interactive child).
  // sendBeacon fires on click which naturally bubbles up from the card.
  return (
    <div onClick={handleClick} role="presentation">
      {children}
    </div>
  );
}
