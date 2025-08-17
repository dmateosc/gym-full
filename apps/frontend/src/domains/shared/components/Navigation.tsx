import React from 'react';

interface NavigationTab {
  id: 'exercises' | 'routines' | 'demo';
  label: string;
  icon: string;
}

interface NavigationProps {
  currentView: string;
  onViewChange: (view: 'exercises' | 'routines' | 'demo') => void;
  tabs: NavigationTab[];
}

/**
 * Componente de navegación reutilizable
 * Parte del dominio Shared siguiendo principios DDD
 */
const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, tabs }) => {
  return (
    <div className="border-b border-gray-800">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                currentView === tab.id
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;
