import React from 'react';

export default function Spinner({ size = 16, color = 'border-blue-600' }) {
  return (
    <span
      className={`animate-spin inline-block border-2 border-t-transparent rounded-full ${color}`}
      style={{ width: size, height: size }}
    />
  );
} 