import type { Icon } from ".";

export const StarIcon: Icon = ({
  size = 32,
  fill = "currentcolor",
  stroke = "black",
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
    <path
      d="M16 5L19.2446 12.5342L27.4127 13.2918L21.2498 18.7058L23.0534 26.7082L16 22.52L8.94658 26.7082L10.7502 18.7058L4.58732 13.2918L12.7554 12.5342L16 5Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
  </svg>
);
