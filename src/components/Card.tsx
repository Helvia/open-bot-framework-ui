import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  clickable = false,
  onClick,
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 ${
        clickable
          ? 'cursor-pointer hover:border-primary-200'          : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};