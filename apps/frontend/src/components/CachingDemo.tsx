import React, { useState } from 'react';
import { useExercisesWithCache, useRoutinesWithCache, useFilterOptionsWithCache } from '../domains/shared';

/**
 * Demo component to show caching in action
 * This shows that data is cached and no redundant API calls are made
 */
const CachingDemo: React.FC = () => {
  const [showExercises, setShowExercises] = useState(false);
  const [showRoutines, setShowRoutines] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { 
    exercises, 
    isLoading: exercisesLoading, 
    error: exercisesError,
    loadExercises,
    refreshExercises 
  } = useExercisesWithCache();

  const { 
    currentRoutine, 
    isLoading: routinesLoading, 
    error: routinesError,
    loadTodayRoutine,
    refreshTodayRoutine 
  } = useRoutinesWithCache();

  const { 
    categories, 
    muscleGroups, 
    equipment, 
    isLoaded: filtersLoaded,
    loadFilterOptions,
    refreshFilterOptions 
  } = useFilterOptionsWithCache();

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🚀 Caching System Demo</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">💡 How to test caching:</h2>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>Open browser DevTools → Network tab</li>
            <li>Click on any section below to load data</li>
            <li>Notice the API calls in the network tab</li>
            <li>Click the same section again - no new API calls!</li>
            <li>Use "Force Refresh" to make new API calls</li>
          </ol>
        </div>

        {/* Exercises Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">📋 Exercises Cache</h2>
            <div className="space-x-3">
              <button
                onClick={() => {
                  setShowExercises(!showExercises);
                  if (!showExercises) loadExercises();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                {showExercises ? 'Hide' : 'Load'} Exercises
              </button>
              <button
                onClick={refreshExercises}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
              >
                Force Refresh
              </button>
            </div>
          </div>
          
          {showExercises && (
            <div>
              {exercisesLoading && <p className="text-yellow-400">Loading exercises...</p>}
              {exercisesError && <p className="text-red-400">Error: {exercisesError}</p>}
              {exercises.length > 0 && (
                <p className="text-green-400">✅ {exercises.length} exercises loaded from cache</p>
              )}
            </div>
          )}
        </div>

        {/* Routines Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">💪 Routines Cache</h2>
            <div className="space-x-3">
              <button
                onClick={() => {
                  setShowRoutines(!showRoutines);
                  if (!showRoutines) loadTodayRoutine();
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                {showRoutines ? 'Hide' : 'Load'} Today's Routine
              </button>
              <button
                onClick={refreshTodayRoutine}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
              >
                Force Refresh
              </button>
            </div>
          </div>
          
          {showRoutines && (
            <div>
              {routinesLoading && <p className="text-yellow-400">Loading routine...</p>}
              {routinesError && <p className="text-red-400">Error: {routinesError}</p>}
              {currentRoutine && (
                <p className="text-green-400">✅ Routine "{currentRoutine.name}" loaded from cache</p>
              )}
              {!currentRoutine && !routinesLoading && !routinesError && (
                <p className="text-gray-400">No routine found for today</p>
              )}
            </div>
          )}
        </div>

        {/* Filter Options Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">🏷️ Filter Options Cache</h2>
            <div className="space-x-3">
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  if (!showFilters) loadFilterOptions();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
              >
                {showFilters ? 'Hide' : 'Load'} Filter Options
              </button>
              <button
                onClick={refreshFilterOptions}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
              >
                Force Refresh
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="space-y-2">
              {filtersLoaded ? (
                <>
                  <p className="text-green-400">✅ Filter options loaded from cache:</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Categories:</span> {categories.length}
                    </div>
                    <div>
                      <span className="text-green-300">Muscle Groups:</span> {muscleGroups.length}
                    </div>
                    <div>
                      <span className="text-yellow-300">Equipment:</span> {equipment.length}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-yellow-400">Loading filter options...</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-100 mb-2">🎯 Expected Behavior:</h3>
          <ul className="text-blue-200 space-y-1 text-sm">
            <li>• First click: API call made + data cached</li>
            <li>• Subsequent clicks: Data served from cache (no API call)</li>
            <li>• Force refresh: New API call made + cache updated</li>
            <li>• Page reload: Cache persists (no redundant calls)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CachingDemo;
