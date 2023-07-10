"use client";
import type { Component } from "@/components/component";
import { hex } from "wcag-contrast";
import d3 from "@/lib/shared/d3";

interface ColorSelectorProps {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
}
export const ColorSelector: Component<ColorSelectorProps> = ({
  colors,
  selected,
  onChange,
}) => {
  const colorMap: Record<string, string> = {
    Base: "#aaaaaa",
    Blue: "#0000ff",
    Red: "#ff0000",
    Yellow: "#ffff00",
    White: "#ffffff",
    Black: "#000000",
    Purple: "#8800ff",
    Green: "#00aa00",
    "Light Blue": "#8888ff",
    Navy: "#000088",
    Orange: "#ff8800",
    Peach: "#ffaaaa",
    Crimson: "#880000",
    "Light Yellow": "#ffff88",
    Brown: "#aa4400",
    Gray: "#444444",
  };

  return (
    <div className="grid gap-1 w-full grid-cols-[repeat(8,1.3rem)]">
      {colors.map((color) => {
        const cssColor = colorMap[color] ?? "#000000";
        const checkColor = betterContrast(cssColor, ["#ffffff", "#000000"]);

        return (
          <div
            key={`swatch-${color}`}
            className="w-full pl-1 text border border-black cursor-pointer aspect-square text-center"
            style={{
              backgroundColor: cssColor,
              color: checkColor,
            }}
            onClick={() => onChange(color)}
            title={color}
          >
            {color === selected ? "✔" : null}
          </div>
        );
      })}
    </div>
  );
};
function betterContrast(background: string, foregrounds: string[]): string {
  if (foregrounds.length === 0) {
    throw new Error("no foregrounds");
  }
  const contrasts = foregrounds.map((fg) => ({
    fg,
    contrast: hex(background, fg),
  }));
  return d3.greatest(contrasts, (d) => d.contrast)?.fg ?? foregrounds[0]!;
}
