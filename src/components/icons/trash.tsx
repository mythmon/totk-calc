import type { Icon } from ".";

export const TrashIcon: Icon = ({ size = 32, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
    <path
      d="M7 6.2439H13.5455M25 6.2439C22.2308 6.2439 19 6.2439 19 6.2439M13.5455 6.2439V4H19V6.2439M13.5455 6.2439H19M7 7.92683H25L23.9091 27H8.09091L7 7.92683Z"
      stroke="currentcolor"
      strokeLinecap="square"
    />
    <path d="M21.7161 11.3435L21 24" stroke="currentcolor" />
    <path d="M10.8115 11.3434L11.5 24" stroke="currentcolor" />
    <line x1="16.5" y1="11" x2="16.5" y2="24" stroke="currentcolor" />
  </svg>
);
