import React, { useState } from 'react';

interface JellyfishIconProps {
  className?: string;
  alt?: string;
}

const JellyfishSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Jellyfish bell/umbrella */}
    <ellipse cx="48" cy="32" rx="32" ry="20" fill="#4FC3F7" />
    <ellipse cx="48" cy="32" rx="28" ry="16" fill="#29B6F6" />
    <ellipse cx="48" cy="32" rx="20" ry="12" fill="#03A9F4" />

    {/* Jellyfish body */}
    <ellipse cx="48" cy="42" rx="8" ry="10" fill="#81C784" />

    {/* Tentacles */}
    <path
      d="M36 48 C36 52, 34 56, 32 60 C30 64, 28 68, 26 72"
      stroke="#E91E63"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M42 50 C42 54, 40 58, 38 62 C36 66, 34 70, 32 74"
      stroke="#E91E63"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M48 52 C48 56, 46 60, 44 64 C42 68, 40 72, 38 76"
      stroke="#E91E63"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M54 50 C54 54, 56 58, 58 62 C60 66, 62 70, 64 74"
      stroke="#E91E63"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M60 48 C60 52, 62 56, 64 60 C66 64, 68 68, 70 72"
      stroke="#E91E63"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />

    {/* Eyes */}
    <circle cx="42" cy="30" r="2" fill="#1976D2" />
    <circle cx="54" cy="30" r="2" fill="#1976D2" />

    {/* Highlights on bell */}
    <ellipse cx="42" cy="28" rx="4" ry="2" fill="#B3E5FC" opacity="0.7" />
  </svg>
);

export const JellyfishIcon: React.FC<JellyfishIconProps> = ({
  className = "w-20 h-20",
  alt = "Jellyfish"
}) => {
  const [imageError, setImageError] = useState(false);
  const externalUrl = "https://img.icons8.com/color/96/000000/jellyfish.png";

  if (imageError) {
    return <JellyfishSvg className={className} />;
  }

  return (
    <img
      src={externalUrl}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  );
};