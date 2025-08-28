import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text = 'A su imagen y semejanza', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Elegant Cross Animation */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-2 border-gray-200 rounded-full animate-spin">
            <div className="absolute top-0 left-1/2 w-1 h-3 bg-black transform -translate-x-1/2 -translate-y-1"></div>
          </div>
          
          {/* Inner cross */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Vertical bar */}
              <div className="w-0.5 h-6 bg-black absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              {/* Horizontal bar */}
              <div className="w-4 h-0.5 bg-black absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>
          </div>
          
          {/* Glowing effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-30 animate-pulse"></div>
        </div>
      </div>
      
      {/* Animated text */}
      <div className="text-center">
        <p className={`font-medium text-gray-700 ${textSizeClasses[size]} animate-fade-in-out`}>
          {text}
        </p>
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ isVisible = true, text = 'A su imagen y semejanza' }: { isVisible?: boolean; text?: string }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
        <div className="mt-8 max-w-md">
          <p className="text-gray-600 text-sm leading-relaxed">
            "Y dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza"
          </p>
          <p className="text-gray-500 text-xs mt-2">Génesis 1:26</p>
        </div>
      </div>
    </div>
  );
}