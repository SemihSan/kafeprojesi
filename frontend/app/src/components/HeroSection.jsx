import React from 'react';

const HeroSection = ({ 
  title, 
  subtitle, 
  backgroundImage = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80",
  children,
  className = "",
  overlay = "gradient" // "gradient", "blur", "dark", "none"
}) => {
  const getOverlayClasses = () => {
    switch (overlay) {
      case "gradient":
        return "bg-gradient-to-br from-primary-900/60 via-secondary-900/40 to-primary-900/60";
      case "blur":
        return "bg-white/10 backdrop-blur-sm";
      case "dark":
        return "bg-black/50";
      default:
        return "";
    }
  };

  return (
    <div className={`relative min-h-[60vh] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${getOverlayClasses()}`} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {title && (
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 animate-fade-in">
            <span className="block">{title}</span>
          </h1>
        )}
        
        {subtitle && (
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up text-balance">
            {subtitle}
          </p>
        )}
        
        {children && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {children}
          </div>
        )}
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-primary-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-secondary-400/20 rounded-full animate-float" style={{ animationDelay: '4s' }} />
    </div>
  );
};

export default HeroSection;