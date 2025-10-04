// AI-Bot-Blobs.tsx
// Animated gradient blob component with smooth warp animation

import { useEffect, useState } from "react";

type GradientColor = {
  color: string;
  stop: number; // 0-100
  opacity?: number; // 0-1
};

type Props = {
  size?: number; // blob size in px
  animated?: boolean;
  className?: string;
  colors?: GradientColor[]; // Array of gradient colors
  colorChangeInterval?: number; // milliseconds between color changes
  randomColors?: boolean; // enable random color generation
  isTyping?: boolean; // trigger glassmorphism effect when typing
};

export default function AIBotBlobs({
  size = 300,
  animated = true,
  className = "",
  colors = [
    { color: "#2ef5cd", stop: 0, opacity: 1 },
    { color: "#4c6ecf", stop: 44, opacity: 1 },
    { color: "#6567ce", stop: 60, opacity: 1 },
    { color: "#fa99c7", stop: 100, opacity: 1 },
  ],
  colorChangeInterval = 3000, // 3 seconds
  randomColors = false,
  isTyping = false,
}: Props) {
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);

  // Predefined color palettes
  const colorPalettes = [
    // Palette 1: Original (Teal to Pink)
    [
      { color: "#2ef5cd", stop: 0, opacity: 1 },
      { color: "#4c6ecf", stop: 44, opacity: 1 },
      { color: "#6567ce", stop: 60, opacity: 1 },
      { color: "#fa99c7", stop: 100, opacity: 1 },
    ],
    // Palette 2: Purple to Orange
    [
      { color: "#8b5cf6", stop: 0, opacity: 1 },
      { color: "#a855f7", stop: 33, opacity: 1 },
      { color: "#f97316", stop: 66, opacity: 1 },
      { color: "#f59e0b", stop: 100, opacity: 1 },
    ],
    // Palette 3: Blue to Green
    [
      { color: "#3b82f6", stop: 0, opacity: 1 },
      { color: "#06b6d4", stop: 33, opacity: 1 },
      { color: "#10b981", stop: 66, opacity: 1 },
      { color: "#22c55e", stop: 100, opacity: 1 },
    ],
  ];

  // Select next random palette
  const getNextPalette = (): number => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * colorPalettes.length);
    } while (nextIndex === currentPaletteIndex && colorPalettes.length > 1);
    return nextIndex;
  };

  // Color cycling effect
  useEffect(() => {
    if (!randomColors) return;

    const interval = setInterval(() => {
      setCurrentPaletteIndex(getNextPalette());
    }, colorChangeInterval);

    return () => clearInterval(interval);
  }, [randomColors, colorChangeInterval, currentPaletteIndex]);

  // Use current colors or provided colors
  const activeColors = randomColors
    ? colorPalettes[currentPaletteIndex]
    : colors;
  // Generate gradient CSS from colors array
  const generateGradient = (colors: GradientColor[], angle: number = 45) => {
    const stops = colors
      .map(({ color, stop, opacity = 1 }) => {
        // Handle both hex and hsl colors
        if (color.startsWith("hsl(")) {
          return `${color} ${stop}%`;
        } else {
          const rgb = hexToRgb(color);
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity}) ${stop}%`;
        }
      })
      .join(", ");
    return `linear-gradient(${angle}deg, ${stops})`;
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Create multiple gradient layers for depth
  const primaryGradient = generateGradient(activeColors, 45);
  const secondaryGradient = generateGradient(
    activeColors.map((c, i) => ({
      ...c,
      opacity: (c.opacity || 1) * 0.3,
      stop: c.stop + (i % 2 === 0 ? 10 : -10),
    })),
    80
  );
  const tertiaryGradient = generateGradient(
    activeColors.map((c, i) => ({
      ...c,
      opacity: (c.opacity || 1) * 0.1,
      stop: c.stop + (i % 2 === 0 ? -5 : 5),
    })),
    20
  );

  // Generate gradients for each palette
  const generatePaletteGradient = (palette: GradientColor[]) => {
    const primaryGradient = generateGradient(palette, 45);
    const secondaryGradient = generateGradient(
      palette.map((c, i) => ({
        ...c,
        opacity: (c.opacity || 1) * 0.3,
        stop: c.stop + (i % 2 === 0 ? 10 : -10),
      })),
      80
    );
    const tertiaryGradient = generateGradient(
      palette.map((c, i) => ({
        ...c,
        opacity: (c.opacity || 1) * 0.1,
        stop: c.stop + (i % 2 === 0 ? -5 : 5),
      })),
      20
    );
    return `${primaryGradient}, ${secondaryGradient}, ${tertiaryGradient}`;
  };

  return (
    <>
      {/* Render 3 blobs, one for each palette */}
      {randomColors ? (
        colorPalettes.map((palette, index) => (
          <div
            key={index}
            className={`warp-blob ${isTyping ? "typing" : ""} ${className}`}
            style={{
              width: size,
              height: size,
              background: generatePaletteGradient(palette),
              backgroundColor: "#fa709a", // Fallback color
              opacity: index === currentPaletteIndex ? 1 : 0,
            }}
          />
        ))
      ) : (
        <div
          className={`warp-blob ${isTyping ? "typing" : ""} ${className}`}
          style={{
            width: size,
            height: size,
            background: generatePaletteGradient(activeColors),
            backgroundColor: "#fa709a", // Fallback color
          }}
        />
      )}

      {/* Core component styles */}
      <style jsx>{`
        .warp-blob {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 100%;
          box-shadow: 0 15px 55px 20px rgba(0, 0, 0, 0.1);
          animation: ${animated ? "warp 10s infinite" : "none"};
          transition: 1s cubic-bezier(0.07, 0.8, 0.16, 1),
            opacity 2s ease-in-out, width 1s cubic-bezier(0.4, 0, 0.2, 1),
            height 1s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .warp-blob.typing {
          width: ${size + 20}px;
          height: ${size + 20}px;
          filter: blur(30px);
          transition: 1s cubic-bezier(0.07, 0.8, 0.16, 1),
            opacity 2s ease-in-out, width 1s cubic-bezier(0.4, 0, 0.2, 1),
            height 1s cubic-bezier(0.4, 0, 0.2, 1), filter 1.5s ease-in-out,
            box-shadow 1.5s ease-in-out;
        }

        @keyframes warp {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          25% {
            transform: translate(-50%, -50%) rotate(15deg);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-5deg);
          }
          75% {
            transform: translate(-50%, -50%) rotate(15deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
      `}</style>
    </>
  );
}
