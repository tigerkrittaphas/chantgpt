import React from 'react';

interface LotusIconProps {
  className?: string;
  size?: number;
}

const LotusIcon: React.FC<LotusIconProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center petal */}
      <ellipse
        cx="50"
        cy="45"
        rx="12"
        ry="30"
        className="fill-primary"
      />
      
      {/* Left petals */}
      <ellipse
        cx="35"
        cy="50"
        rx="10"
        ry="25"
        transform="rotate(-25 35 50)"
        className="fill-primary/80"
      />
      <ellipse
        cx="22"
        cy="55"
        rx="8"
        ry="20"
        transform="rotate(-45 22 55)"
        className="fill-primary/60"
      />
      
      {/* Right petals */}
      <ellipse
        cx="65"
        cy="50"
        rx="10"
        ry="25"
        transform="rotate(25 65 50)"
        className="fill-primary/80"
      />
      <ellipse
        cx="78"
        cy="55"
        rx="8"
        ry="20"
        transform="rotate(45 78 55)"
        className="fill-primary/60"
      />
      
      {/* Base */}
      <ellipse
        cx="50"
        cy="75"
        rx="25"
        ry="8"
        className="fill-secondary"
      />
      
      {/* Inner glow */}
      <circle
        cx="50"
        cy="50"
        r="8"
        className="fill-gold-light"
      />
    </svg>
  );
};

export default LotusIcon;
