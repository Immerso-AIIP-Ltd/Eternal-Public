import { useState } from "react";
import { MobilePreview } from "./MobilePreview";
import { LaptopPreview } from "./LaptopPreview";

export function DevicePreview() {
  const [hoveredDevice, setHoveredDevice] = useState<'laptop' | 'mobile' | null>(null);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Laptop Preview - Background */}
      <div
        className={`relative transition-all duration-500 ease-out ${
          hoveredDevice === "laptop"
            ? "z-20 scale-105"
            : hoveredDevice === "mobile"
            ? "z-10 scale-95"
            : "z-15 scale-100"
        }`}
        onMouseEnter={() => setHoveredDevice("laptop")}
        onMouseLeave={() => setHoveredDevice(null)}
      >
        <LaptopPreview />
      </div>
      {/* Mobile Preview - Vertically centered and wider */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 -left-24 transition-all duration-500 ease-out ${
          hoveredDevice === "mobile"
            ? "z-30 scale-110"
            : hoveredDevice === "laptop"
            ? "z-10 scale-90"
            : "z-20 scale-100"
        }`}
        style={{ minWidth: 0 }}
        onMouseEnter={() => setHoveredDevice("mobile")}
        onMouseLeave={() => setHoveredDevice(null)}
      >
        <MobilePreview />
      </div>
    </div>
  );
} 