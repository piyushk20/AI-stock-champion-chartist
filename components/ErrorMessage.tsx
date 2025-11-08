import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
    <strong className="font-bold">Analysis Failed: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);
