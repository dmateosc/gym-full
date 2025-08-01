import React from 'react';

interface NavigationTab {
  id: 'exercises' | 'routines';
  label: string;
  icon: string;
}

interface NavigationProps {
  currentView: string;
  onViewChange: (view: 'exercises' | 'routines') => void;
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
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === tab.id
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;
