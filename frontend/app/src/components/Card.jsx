import React from 'react';

const Card = ({ 
  title, 
  description, 
  icon, 
  value, 
  link, 
  linkText = "Görüntüle", 
  className = "",
  variant = "default", // "default", "glass", "gradient", "image"
  image,
  imageAlt,
  children,
  onClick,
  hover = true
}) => {
  const baseClasses = "rounded-2xl p-6 transition-all duration-300 ease-out";
  
  const variantClasses = {
    default: "bg-white border border-neutral-200 shadow-soft",
    glass: "glass-effect shadow-soft-lg",
    gradient: "bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100",
    image: "bg-white border border-neutral-200 shadow-soft overflow-hidden"
  };
  
  const hoverClasses = hover ? "card-hover cursor-pointer" : "";
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;

  const CardContent = () => (
    <>
      {/* Image Section */}
      {image && variant === "image" && (
        <div className="relative -m-6 mb-6 h-48 overflow-hidden rounded-t-2xl">
          <img 
            src={image} 
            alt={imageAlt || title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {icon && (
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 mb-4 group-hover:scale-110 transition-transform duration-300">
              <div className="text-primary-600 text-xl">
                {icon}
              </div>
            </div>
          )}
          
          {title && (
            <h3 className="text-lg font-display font-semibold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
              {title}
            </h3>
          )}
          
          {description && (
            <p className="text-neutral-600 text-sm leading-relaxed mb-4 text-balance">
              {description}
            </p>
          )}
        </div>
        
        {value && (
          <div className="ml-4 text-right">
            <div className="text-2xl font-display font-bold gradient-text">
              {value}
            </div>
          </div>
        )}
      </div>
      
      {/* Children Content */}
      {children && (
        <div className="mb-4">
          {children}
        </div>
      )}
      
      {/* Link Section */}
      {link && (
        <div className="pt-4 border-t border-neutral-100">
          <a 
            href={link} 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200 group"
          >
            <span>{linkText}</span>
            <svg 
              className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <div className={`${cardClasses} group`} onClick={onClick}>
        <CardContent />
      </div>
    );
  }

  return (
    <div className={`${cardClasses} group`}>
      <CardContent />
    </div>
  );
};

export default Card;