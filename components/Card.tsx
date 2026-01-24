import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', gradient = false, onClick }) => {
  const baseClasses = "rounded-3xl p-5 relative overflow-hidden transition-transform duration-200 active:scale-[0.98]";
  const bgClasses = gradient 
    ? "bg-gradient-to-br from-dark-card to-dark-surface border border-white/5" 
    : "bg-dark-card border border-dark-border";
  const cursorClass = onClick ? "cursor-pointer" : "";

  return (
    <div onClick={onClick} className={`${baseClasses} ${bgClasses} ${cursorClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card;