import React from 'react';

const Zar3aLogo = ({ width = 120, height = 40 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background soft circle */}
      <circle cx="25" cy="25" r="15" fill="#16a34a" fillOpacity="0.15" />
      {/* Dynamic Leaf Vector */}
      <path d="M25 10C25 10 13 20 13 30C13 36.6274 18.3726 42 25 42C31.6274 42 37 36.6274 37 30C37 20 25 10 25 10Z" fill="#16a34a"/>
      {/* Leaf Stem */}
      <path d="M25 42V22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Modern Typography */}
      <text x="48" y="34" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="900" fill="#16a34a" letterSpacing="1.5">ZAR3A</text>
    </svg>
  );
};

export default Zar3aLogo;