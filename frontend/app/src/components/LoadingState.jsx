import React from 'react';

const LoadingState = ({ 
  text = "Yükleniyor...", 
  variant = "default", // "default", "skeleton", "dots", "pulse"
  size = "md", // "sm", "md", "lg"
  className = ""
}) => {
  const sizes = {
    sm: { spinner: "w-6 h-6", text: "text-sm" },
    md: { spinner: "w-8 h-8", text: "text-base" },
    lg: { spinner: "w-12 h-12", text: "text-lg" }
  };

  const DefaultSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizes[size].spinner} animate-spin mb-4`}>
        <svg className="w-full h-full text-primary-500" fill="none" viewBox="0 0 24 24">
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
      </div>
      <p className={`text-neutral-600 ${sizes[size].text} animate-pulse`}>
        {text}
      </p>
    </div>
  );

  const DotsLoader = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex space-x-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <p className={`text-neutral-600 ${sizes[size].text}`}>
        {text}
      </p>
    </div>
  );

  const PulseLoader = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizes[size].spinner} bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full animate-pulse mb-4`} />
      <p className={`text-neutral-600 ${sizes[size].text} animate-pulse`}>
        {text}
      </p>
    </div>
  );

  const SkeletonLoader = () => (
    <div className="space-y-4 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 rounded-lg w-3/4" />
              <div className="h-3 bg-neutral-200 rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      case "skeleton":
        return <SkeletonLoader />;
      default:
        return <DefaultSpinner />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {renderLoader()}
    </div>
  );
};

export default LoadingState;