"use client";

interface PatternRendererProps {
  type: string;
  color: string;
  opacity: number;
  thickness: number;
  scale: number;
}

interface MaskContentProps {
  type: string;
  actualScale: number;
  holeSize: number;
}

function MaskContent({ type, actualScale, holeSize }: MaskContentProps) {
  switch (type) {
    case "grid":
      return <rect x={(actualScale - holeSize) / 2} y={(actualScale - holeSize) / 2} width={holeSize} height={holeSize} fill="black" />;

    case "dots":
      return <circle cx={actualScale / 2} cy={actualScale / 2} r={holeSize / 2} fill="black" />;

    case "stripes":
      return <rect x={(actualScale - holeSize) / 2} y="0" width={holeSize} height={actualScale} fill="black" />;

    case "waves":
      return (
        <path
          d={`
            M 0 ${actualScale / 2} 
            Q ${actualScale / 4} ${actualScale / 2 - holeSize / 2}, ${actualScale / 2} ${actualScale / 2} 
            T ${actualScale} ${actualScale / 2}
            V ${actualScale} H 0 Z
          `}
          fill="black"
        />
      );

    case "noise":
      const noiseDots = [];
      const count = 15;
      for (let i = 0; i < count; i++) {
        const x = (i * 137.5) % actualScale;
        const y = (i * 253.1) % actualScale;
        noiseDots.push(<rect key={`noise-${i}`} x={x} y={y} width={holeSize / 4} height={holeSize / 4} fill="black" />);
      }
      return <>{noiseDots}</>;

    default:
      return null;
  }
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
};

export function PatternRenderer({ type, color, opacity, thickness, scale }: PatternRendererProps) {
  if (type === "none") return null;

  const patternId = `pattern-${type}`;
  const maskId = `mask-${type}`;
  const opacityDecimal = opacity / 100;

  const actualScale = (scale / 100) * 40;

  const holeSize = (thickness / 200) * actualScale;

  const rgb = hexToRgb(color);

  const patternFillColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityDecimal})`;

  return (
    <svg className="absolute inset-0 h-full w-full pointer-events-none">
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <pattern id={`${patternId}-mask`} x="0" y="0" width={actualScale} height={actualScale} patternUnits="userSpaceOnUse" patternTransform={type === "stripes" ? "rotate(45)" : ""}>
            <MaskContent type={type} actualScale={actualScale} holeSize={holeSize} />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#${patternId}-mask)`} />
        </mask>
      </defs>

      <rect width="100%" height="100%" fill={patternFillColor} mask={`url(#${maskId})`} />
    </svg>
  );
}
