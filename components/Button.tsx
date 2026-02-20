import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900";
  
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    outline: "border border-neutral-200 text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
