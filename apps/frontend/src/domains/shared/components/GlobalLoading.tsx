import React from 'react';

interface GlobalLoadingProps {
  message?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ 
  message = "Inicializando aplicación..." 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-wellness-green-600 border-t-transparent mx-auto"></div>
          <div
            className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-wellness-gold-400 border-r-transparent mx-auto"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Centro Wellness</h2>
        <p className="text-wellness-green-400 text-sm">{message}</p>

        <div className="mt-4 w-48 mx-auto">
          <div className="h-1 bg-wellness-surface-input rounded-full overflow-hidden">
            <div className="h-full bg-wellness-green-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;
