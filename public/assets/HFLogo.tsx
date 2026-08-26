import React from 'react';

interface HFLogoProps {
  className?: string;
  fill?: string;
  width?: number | string;
  height?: number | string;
}

const HFLogo: React.FC<HFLogoProps> = ({
  className = '',
  fill = 'currentColor',
  width = 24,
  height = 24
}) => {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 611 504" fill={fill} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <path d="M0 20C0 8.9543 8.95431 0 20 0H109C120.046 0 129 8.95431 129 20V260H0V20Z" fill="#FFCB2F" />
      <path d="M0 121H129V362C129 373.046 120.046 382 109 382H20C8.95431 382 0 373.046 0 362V121Z" fill="#FFE084" />
      <path d="M199 20C199 8.9543 207.954 0 219 0H309C320.046 0 329 8.95431 329 20V260H199V20Z" fill="#FFE084" />
      <path d="M199 121H329V362C329 373.046 320.046 382 309 382H219C207.954 382 199 373.046 199 362V121Z" fill="#FFCB2F" />
      <path d="M0 121H329V260H0V121Z" fill="#754FA0" />
      <rect x="199" y="121" width="255" height="139" fill="#9B77C5" />
      <path d="M199 121C273.149 134.71 328.791 191.708 328.997 260H199V121Z" fill="#FF8681" />
      <path d="M199 121V260H0.00292969C0.210326 191.679 55.9191 134.664 130.135 121H199Z" fill="#F15452" />
      <path d="M129 362C129 368.296 126.089 373.91 121.542 377.576C54.6685 363.387 4.58758 316.607 0 260H129V362Z" fill="#FF8681" />
      <path d="M329 121L591 121C602.046 121 611 129.954 611 141V217H329V121Z" fill="#FFE084" />
      <path d="M329 121H454V382H329V121Z" fill="#FF8681" />
      <path d="M329 260H539C550.046 260 559 268.954 559 280V362C559 373.046 550.046 382 539 382H329V260Z" fill="#FFCB2F" />
      <path d="M329 252H454V484C454 495.046 445.046 504 434 504H349C337.954 504 329 495.046 329 484V252Z" fill="#F15452" />
      <path d="M329 121V121C398.036 121 454 176.964 454 246V257C454 326.036 398.036 382 329 382V382V121Z" fill="#754FA0" />
    </svg>
  );
};

export default HFLogo;
