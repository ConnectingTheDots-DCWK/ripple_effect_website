import { ImageResponse } from "next/og";

import { OgPlate } from "@/lib/og-mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The favicon, generated from the same ring table the app paints its own icon
 * from — so the tab and the title bar are the same mark rather than two that
 * were drawn to match once.
 */
export default function Icon() {
  return new ImageResponse(<OgPlate size={64} />, { ...size });
}
