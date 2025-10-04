
import React from 'react';

export const PaperCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="flex items-center space-x-3">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export const ResearchStoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-28"></div>
        <div className="flex items-center space-x-3">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      
      <div className="h-7 bg-gray-200 rounded w-full mb-3"></div>
      <div className="h-7 bg-gray-200 rounded w-4/5 mb-4"></div>
      
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      
      <div className="h-4 bg-gray-200 rounded w-40"></div>
    </div>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="flex justify-center space-x-8 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-8 bg-white/30 rounded w-20 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-32"></div>
        </div>
      ))}
    </div>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PaperCardSkeleton key={i} />
      ))}
    </>
  );
};
