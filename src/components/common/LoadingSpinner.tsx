import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} 
      />
      {text && (
        <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton Loading Components
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => (
  <div 
    className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`} 
  />
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton height="h-48" className="rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton height="h-4" width="w-1/4" />
      <Skeleton height="h-6" width="w-3/4" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton height="h-4" width="w-1/3" />
        <div className="flex gap-2">
          <Skeleton height="h-8" width="w-8" className="rounded-full" />
          <Skeleton height="h-8" width="w-8" className="rounded-full" />
          <Skeleton height="h-8" width="w-8" className="rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <Skeleton height="h-16" width="w-16" className="rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-1/4" />
            <Skeleton height="h-5" width="w-3/4" />
            <Skeleton height="h-4" width="w-full" />
            <div className="flex justify-between items-center">
              <Skeleton height="h-4" width="w-1/3" />
              <div className="flex gap-2">
                <Skeleton height="h-6" width="w-6" className="rounded-full" />
                <Skeleton height="h-6" width="w-6" className="rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={index} height="h-4" width="w-1/4" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} height="h-4" width="w-1/4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Loading States for specific components
export const BlogCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton height="h-48" className="rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton height="h-4" width="w-1/3" className="bg-blue-100" />
      <Skeleton height="h-6" width="w-full" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-3/4" />
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Skeleton height="h-4" width="w-4" className="rounded-full" />
          <Skeleton height="h-4" width="w-20" />
        </div>
        <div className="flex gap-3">
          <Skeleton height="h-8" width="w-12" />
          <Skeleton height="h-8" width="w-12" />
          <Skeleton height="h-8" width="w-12" />
        </div>
      </div>
    </div>
  </div>
);

export const EventCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton height="h-48" className="rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton height="h-4" width="w-1/4" className="bg-green-100" />
      <Skeleton height="h-6" width="w-full" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton height="h-4" width="w-4" />
          <Skeleton height="h-4" width="w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton height="h-4" width="w-4" />
          <Skeleton height="h-4" width="w-24" />
        </div>
      </div>
      <Skeleton height="h-6" width="w-20" className="bg-blue-100 rounded-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton height="h-4" width="w-24" />
        <div className="flex gap-2">
          <Skeleton height="h-8" width="w-16" />
          <Skeleton height="h-8" width="w-16" />
        </div>
      </div>
    </div>
  </div>
);

export const SermonCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton height="h-48" className="rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton height="h-4" width="w-1/3" className="bg-purple-100" />
      <Skeleton height="h-6" width="w-full" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-2/3" />
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <Skeleton height="h-4" width="w-16" />
        <Skeleton height="h-4" width="w-12" />
        <Skeleton height="h-4" width="w-20" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <Skeleton height="h-8" width="w-16" />
          <Skeleton height="h-8" width="w-16" />
        </div>
        <div className="flex gap-3">
          <Skeleton height="h-8" width="w-12" />
          <Skeleton height="h-8" width="w-12" />
          <Skeleton height="h-8" width="w-12" />
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;