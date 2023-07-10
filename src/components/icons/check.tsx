import type { Icon } from ".";

export const CheckIcon: Icon = ({
  size = 32,
  fill = "currentcolor",
  stroke = "black",
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
    <path d="M7 10L13 16L25 4L31 10L13 28L1 16L7 10Z" fill={fill} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 19.8891L7 13.8891L4.88909 16L13 24.1109L27.1109 10L25 7.88909L13 19.8891ZM25 4L31 10L13 28L1 16L7 10L13 16L25 4Z"
      fill={stroke}
    />
  </svg>
);
