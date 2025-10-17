import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  title = "Henüz veri yok", 
  description = "Buraya eklenecek içerik bulunmuyor.", 
  icon,
  image,
  actionText,
  onAction,
  className = ""
}) => {
  const DefaultIcon = () => (
    <svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Icon or Image */}
      <div className="mb-6 animate-fade-in">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-32 h-32 object-contain opacity-60"
          />
        ) : (
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 mb-2">
            {icon || <DefaultIcon />}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="max-w-md animate-slide-up">
        <h3 className="text-xl font-display font-semibold text-neutral-700 mb-3">
          {title}
        </h3>
        <p className="text-neutral-500 leading-relaxed mb-6 text-balance">
          {description}
        </p>
        
        {/* Action Button */}
        {actionText && onAction && (
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="primary" 
              onClick={onAction}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;