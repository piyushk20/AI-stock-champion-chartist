import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-gray-800 shadow-md">
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z" opacity="0.3"/><path d="M16.5 13.5h-3v-3h3c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-3v-1h3c1.66 0 3 1.34 3 3s-1.34 3-3 3zm-6-3h3v3h-3c-.83 0-1.5.67-1.5 1.5S9.67 16.5 10.5 16.5h3v1h-3c-1.66 0-3-1.34-3-3s1.34-3 3-3z"/>
        </svg>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Stock Champion Chartist</h1>
      </div>
      <p className="text-gray-400 mt-1">Professional Technical Analysis Agent</p>
    </div>
  </header>
);
