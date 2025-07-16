import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-extrabold text-blue-700 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition">Go Home</Link>
    </div>
  );
} 