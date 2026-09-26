import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RetractableBackButtonProps {
  onClick?: () => void;
  to?: string;
  label?: string;
  className?: string;
  id?: string;
}

export default function RetractableBackButton({
  onClick,
  to,
  label = 'Exit',
  className = '',
  id,
}: RetractableBackButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonContent = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-center justify-start h-9 sm:h-10 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-full shadow-sm hover:shadow-md backdrop-blur-md transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
        isHovered ? 'w-24 sm:w-28 px-3' : 'w-9 sm:w-10 px-2.5 sm:px-3'
      } ${className}`}
    >
      <ArrowLeft className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isHovered ? '-translate-x-0.5 text-blue-600 dark:text-blue-400' : ''}`} />
      
      <span
        className={`ml-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden'
        }`}
      >
        {label}
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} id={id} className="inline-block" title={label}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className="inline-block bg-transparent p-0 border-none outline-none"
      title={label}
    >
      {buttonContent}
    </button>
  );
}
