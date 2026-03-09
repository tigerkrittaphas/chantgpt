import React from 'react';

interface LotusIconProps {
  className?: string;
  size?: number;
  animateUpwardBlink?: boolean;
}

const LotusIcon: React.FC<LotusIconProps> = ({
  className = '',
  size = 48,
  animateUpwardBlink = false,
}) => {
  const rootClassName = `text-primary ${animateUpwardBlink ? 'chant-icon-upward-blink' : ''} ${className}`.trim();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1133.35 1104.06"
      xmlns="http://www.w3.org/2000/svg"
      className={rootClassName}
      role="img"
      aria-label="ChantGPT icon"
    >
      <ellipse className="chant-icon-part chant-icon-part-1 fill-current" cx="566.68" cy="187.33" rx="185.69" ry="187.33" />
      <path
        className="chant-icon-part chant-icon-part-2 fill-current"
        d="M869.19,591.96H264.16l41.99-95.43c0-12.41,36.7-22.48,81.97-22.48h357.12c45.27,0,81.97,10.06,81.97,22.48l41.99,95.43Z"
      />
      <polygon className="chant-icon-part chant-icon-part-3 fill-current" points="1002.49 846.41 130.86 846.41 207.77 691.35 925.59 691.35 1002.49 846.41" />
      <polygon className="chant-icon-part chant-icon-part-4 fill-current" points="1133.35 1104.06 0 1104.06 90.43 945.8 1042.92 945.8 1133.35 1104.06" />
    </svg>
  );
};

export default LotusIcon;
