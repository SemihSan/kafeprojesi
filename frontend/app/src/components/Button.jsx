import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "btn-primary focus:ring-primary-500/20",
    secondary: "btn-secondary focus:ring-secondary-500/20",
    outline: "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 focus:ring-primary-500/20",
    ghost: "text-neutral-600 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500/20",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-soft hover:shadow-soft-lg focus:ring-red-500/20",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-soft hover:shadow-soft-lg focus:ring-green-500/20",
    glass: "glass-effect text-neutral-700 hover:bg-white/90 border border-white/30 shadow-soft hover:shadow-soft-lg focus:ring-primary-500/20"
  };
  
  const sizes = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg"
  };
  
  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6"
  };
  
  const buttonClasses = `
    ${baseClasses} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${fullWidth ? 'w-full' : ''} 
    ${disabled || loading ? 'pointer-events-none' : 'hover:scale-105'} 
    ${className}
  `.trim();

  const LoadingSpinner = () => (
    <svg 
      className={`animate-spin ${iconSizes[size]} ${iconPosition === 'right' ? 'ml-2' : 'mr-2'}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const IconComponent = () => {
    if (loading) return <LoadingSpinner />;
    if (!icon) return null;
    
    return (
      <span className={`${iconSizes[size]} ${iconPosition === 'right' ? 'ml-2' : 'mr-2'} transition-transform duration-200 group-hover:scale-110`}>
        {icon}
      </span>
    );
  };

  return (
    <button
      type={type}
      className={`${buttonClasses} group`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && <IconComponent />}
      
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>
      
      {iconPosition === 'right' && <IconComponent />}
    </button>
  );
};

export default Button;