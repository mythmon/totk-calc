import type { Icon } from ".";

export const ArmorIcon: Icon = ({ width = 32, height = width, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 32 32" fill="none" {...props}>
    <path
      d="M22.6957 5H25.1304L30 7.75L26.3478 14.625L23.0761 11.875M22.6957 5L23.0761 11.875M22.6957 5H18.4348L16 7.75L14.1739 5H9.30435M9.30435 5H6.86957L2 7.75L5.65217 14.625L8.92391 11.875M9.30435 5L8.92391 11.875M23.0761 11.875L23.913 27H8.08696L8.92391 11.875M13.5652 9.125L18.4348 13.25M18.4348 9.125L13.5652 13.25M13.5652 14.625L18.4348 18.75M18.4348 14.625L13.5652 18.75"
      stroke="currentcolor"
    />
  </svg>
);
