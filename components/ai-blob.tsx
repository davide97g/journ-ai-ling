// AI-Bot-Blobs.tsx
// Minimal, shadcn-flavored React component showing cool animated blobs behind an avatar.
// Tailwind classes are used for layout and spacing. The component is intentionally small
// and easy to drop into a dashboard or profile card.

type Props = {
  size?: number; // avatar size in px
  label?: string; // accessible label or name
  primaryColor?: string; // hex color for main blob (e.g. #7c3aed)
  secondaryColor?: string; // hex color for second blob (e.g. #06b6d4)
  animated?: boolean;
  className?: string;
};

export default function AIBotBlobs({
  size = 88,
  label = "AI Bot",
  primaryColor = "#7c3aed",
  secondaryColor = "#06b6d4",
  animated = true,
  className = "",
}: Props) {
  const blobSize = Math.max(Math.round(size * 2.2), 140);
  const svgStyle = { width: blobSize, height: blobSize };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      aria-label={label}
    >
      {/* Blobs wrapper */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          className="-z-10"
          viewBox={`0 0 ${blobSize} ${blobSize}`}
          style={svgStyle}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
              <stop
                offset="100%"
                stopColor={secondaryColor}
                stopOpacity="0.85"
              />
            </linearGradient>
            <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>

          {/* Primary blob */}
          <g
            filter="url(#blur)"
            transform={`translate(${blobSize * 0.02}, ${blobSize * 0.03})`}
          >
            <path
              fill="url(#g1)"
              d={`M${blobSize * 0.12},${blobSize * 0.32}
                 C${blobSize * 0.02},${blobSize * 0.02} ${blobSize * 0.48},${
                blobSize * 0.0
              } ${blobSize * 0.68},${blobSize * 0.12}
                 C${blobSize * 0.92},${blobSize * 0.26} ${blobSize * 0.98},${
                blobSize * 0.62
              } ${blobSize * 0.76},${blobSize * 0.78}
                 C${blobSize * 0.54},${blobSize * 0.96} ${blobSize * 0.16},${
                blobSize * 0.88
              } ${blobSize * 0.06},${blobSize * 0.66}
                 C${blobSize * 0.0},${blobSize * 0.52} ${blobSize * 0.22},${
                blobSize * 0.4
              } ${blobSize * 0.12},${blobSize * 0.32} Z`}
              opacity="0.95"
              className={animated ? "blob-anim-1" : ""}
            />
          </g>

          {/* Secondary smaller blob */}
          <g
            filter="url(#blur)"
            transform={`translate(${blobSize * 0.28}, ${blobSize * 0.48})`}
          >
            <path
              fill={secondaryColor}
              d={`M${blobSize * 0.1},${blobSize * 0.2}
                 C${blobSize * 0.0},${blobSize * 0.06} ${blobSize * 0.28},${
                blobSize * 0.0
              } ${blobSize * 0.44},${blobSize * 0.08}
                 C${blobSize * 0.62},${blobSize * 0.18} ${blobSize * 0.68},${
                blobSize * 0.42
              } ${blobSize * 0.52},${blobSize * 0.56}
                 C${blobSize * 0.36},${blobSize * 0.72} ${blobSize * 0.06},${
                blobSize * 0.62
              } ${blobSize * 0.02},${blobSize * 0.44}
                 C${blobSize * 0.0},${blobSize * 0.32} ${blobSize * 0.12},${
                blobSize * 0.24
              } ${blobSize * 0.1},${blobSize * 0.2} Z`}
              opacity="0.9"
              className={animated ? "blob-anim-2" : ""}
            />
          </g>
        </svg>
      </div>

      {/* Minimal shadcn-style avatar */}
      <div
        className={`relative flex items-center justify-center rounded-2xl shadow-md overflow-hidden bg-white/70 backdrop-blur-sm`}
      >
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-lg"
        >
          {/* Simple avatar circle with initials */}
          <div
            className="flex items-center justify-center rounded-full font-medium"
            style={{
              width: Math.round(size * 0.9),
              height: Math.round(size * 0.9),
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: "white",
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            }}
            aria-hidden={false}
          >
            <span style={{ fontSize: Math.round(size * 0.32) }}>
              {label
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        </div>
      </div>

      {/* Inline styles for tiny, purpose-driven animations — minimal and easy to adapt. */}
      <style>{`
        @keyframes float-1 {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-6px) rotate(6deg) scale(1.02); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        @keyframes float-2 {
          0% { transform: translate(0,0) rotate(0deg) scale(1); }
          50% { transform: translate(8px,-4px) rotate(-5deg) scale(1.01); }
          100% { transform: translate(0,0) rotate(0deg) scale(1); }
        }
        .blob-anim-1 { animation: float-1 6.5s ease-in-out infinite; transform-origin: 50% 50%; }
        .blob-anim-2 { animation: float-2 8.2s ease-in-out infinite; transform-origin: 50% 50%; }
      `}</style>
    </div>
  );
}

/*
Usage examples (drop into a page):

<AIBotBlobs size={96} label="Aurora" primaryColor="#8b5cf6" secondaryColor="#06b6d4" />

Or inside a shadcn Card:

<Card className="p-4 w-64">
  <CardContent className="flex items-center gap-4">
    <AIBotBlobs size={72} label="ECHO" primaryColor="#ef4444" secondaryColor="#f97316" />
    <div>
      <h4 className="text-sm font-semibold">Echo — Assistant</h4>
      <p className="text-xs text-muted-foreground">Context-aware helper</p>
    </div>
  </CardContent>
</Card>
*/
