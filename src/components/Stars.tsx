import type { Component } from "./component";
import { StarIcon } from "./icons/star";

interface StarsProps {
  count: number;
  size?: number;
}

export const Stars: Component<StarsProps> = ({ count, size = 24 }) => {
  return (
    <span className="whitespace-nowrap">
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} className="text-black inline" width={size} />
      ))}
    </span>
  );
};
